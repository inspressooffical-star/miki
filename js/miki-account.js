(function () {
  "use strict";

  const M = window.Miki;
  const PENDING_KEY = "mikiPendingSave";
  const SAVED_KEY = "mikiSavedCharts";
  const PENDING_TTL = 24 * 60 * 60 * 1000;
  const support = window.MikiSupabase || { configured: false, client: null };
  const client = support.client;
  const configured = Boolean(support.configured && client);

  let dialog = null;
  let state = { mode: "login", busy: false, emailSent: false, pendingKey: null };
  let processing = false;

  const isMissingTable = (error) => error && (error.code === "42P01" || error.code === "PGRST205" || /relation .* does not exist|Could not find the table/i.test(error.message || ""));
  const isMissingColumn = (error) => error && (error.code === "PGRST204" || error.code === "42703" || /client_key/i.test(error.message || ""));

  /* ---------- 대기 중인 저장 ---------- */
  function readPending() {
    const raw = M.safe("localStorage", "get", PENDING_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!data || !data.key || !data.input || Date.now() - data.createdAt > PENDING_TTL) {
        M.safe("localStorage", "remove", PENDING_KEY);
        return null;
      }
      return data;
    } catch (error) {
      M.safe("localStorage", "remove", PENDING_KEY);
      return null;
    }
  }
  function writePending(data) { M.safe("localStorage", "set", PENDING_KEY, JSON.stringify(data)); }
  function clearPending() { M.safe("localStorage", "remove", PENDING_KEY); }

  function savedMap() {
    try { return JSON.parse(M.safe("localStorage", "get", SAVED_KEY) || "{}"); } catch (error) { return {}; }
  }
  function markSaved(input, userId) {
    const map = savedMap();
    map[`${userId}:${M.signature(input)}`] = Date.now();
    M.safe("localStorage", "set", SAVED_KEY, JSON.stringify(map));
  }
  async function isSaved(input) {
    const session = await getSession();
    return Boolean(session && savedMap()[`${session.user.id}:${M.signature(input)}`]);
  }

  /* ---------- 세션·계정 정보 ---------- */
  async function getSession() {
    if (!configured) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function loadAccount(user) {
    const meta = user.user_metadata || {};
    let row = null;
    try {
      const { data, error } = await client.from("member_profiles").select("display_name,gender").eq("user_id", user.id).maybeSingle();
      if (error && !isMissingTable(error)) throw error;
      row = data || null;
    } catch (error) { /* 마이그레이션 전에는 가입 정보(user_metadata)를 대신 쓴다. */ }
    const name = (row && row.display_name) || meta.display_name || "";
    const gender = (row && row.gender) || meta.gender || "";
    if (!row && name) {
      client.from("member_profiles").upsert({ user_id: user.id, display_name: name, gender: gender || "undisclosed" }, { onConflict: "user_id" }).then(() => {}, () => {});
    }
    return { name, gender, email: user.email || "" };
  }

  async function updateAccount(user, values) {
    const gender = values.gender || "undisclosed";
    const { error: metaError } = await client.auth.updateUser({ data: { display_name: values.name, gender } });
    if (metaError) throw metaError;
    const { error } = await client.from("member_profiles").upsert({ user_id: user.id, display_name: values.name, gender }, { onConflict: "user_id" });
    if (error && !isMissingTable(error)) throw error;
  }

  /* ---------- 명식 저장 ---------- */
  const normalizeTime = (value) => (value ? String(value).slice(0, 5) : "");

  async function listProfiles(userId) {
    const { data, error } = await client.from("saju_profiles")
      .select("id,name,gender,birth_date,calendar,leap_month,birth_time,is_default,created_at")
      .eq("user_id", userId).order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  // 로그인된 계정(세션의 사용자)에만 저장한다. clientKey와 같은 명식 검사로 중복 저장을 막는다.
  async function saveProfile(params) {
    const session = await getSession();
    if (!session) throw Object.assign(new Error("로그인이 필요해."), { code: "NO_SESSION" });
    const userId = session.user.id;
    const existing = await listProfiles(userId);
    const sameChart = existing.find((profile) =>
      profile.birth_date === params.input.birthDate && profile.calendar === params.input.calendar &&
      Boolean(profile.leap_month) === Boolean(params.input.leapMonth) && normalizeTime(profile.birth_time) === (params.input.birthTime || ""));
    if (params.dedupe && sameChart) {
      markSaved(params.input, userId);
      return { status: "exists", profile: sameChart };
    }
    const makeDefault = Boolean(params.makeDefault) || existing.length === 0;
    if (makeDefault && existing.some((profile) => profile.is_default)) {
      const { error } = await client.from("saju_profiles").update({ is_default: false }).eq("user_id", userId);
      if (error) throw error;
    }
    const row = {
      user_id: userId,
      name: params.name,
      gender: params.gender || "undisclosed",
      birth_date: params.input.birthDate,
      calendar: params.input.calendar,
      leap_month: Boolean(params.input.leapMonth),
      birth_time: params.input.birthTime || null,
      is_default: makeDefault
    };
    let result = await client.from("saju_profiles").insert(params.clientKey ? { ...row, client_key: params.clientKey } : row).select().single();
    if (result.error && params.clientKey && isMissingColumn(result.error) && result.error.code !== "23505") {
      result = await client.from("saju_profiles").insert(row).select().single();
    }
    if (result.error) {
      if (result.error.code === "23505" && /client_key/i.test(result.error.message || "")) {
        markSaved(params.input, userId);
        return { status: "exists", profile: null };
      }
      throw result.error;
    }
    markSaved(params.input, userId);
    return { status: "saved", profile: result.data };
  }

  async function processPending() {
    if (!configured || processing) return null;
    const pending = readPending();
    if (!pending) return null;
    processing = true;
    try {
      const session = await getSession();
      if (!session) return null;
      const email = (session.user.email || "").toLowerCase();
      if (!pending.email || pending.email.toLowerCase() !== email) {
        // 인증을 시작한 이메일과 다른 계정이면 저장하지 않는다.
        if (pending.email) {
          clearPending();
          M.showBanner("다른 계정으로 로그인되어 있어서 보던 명식은 저장하지 않았어. 필요하면 다시 저장해줘.", "error");
        }
        return null;
      }
      const result = await saveProfile({
        input: pending.input, name: pending.name || "내 명식", gender: pending.gender, clientKey: pending.key, dedupe: true
      });
      clearPending();
      if (!M.getInput()) M.setInput(pending.input, { name: pending.name, gender: pending.gender, source: "guest" });
      const detail = { status: result.status, input: pending.input, returnUrl: pending.returnUrl };
      const text = result.status === "exists" ? "이미 내 명식 보관함에 있는 명식이라 그대로 두었어." : "방금 보던 명식을 내 명식 보관함에 저장했어.";
      const here = location.pathname.split("/").pop();
      const target = pending.returnUrl ? new URL(pending.returnUrl, location.href) : null;
      if (target && target.pathname.split("/").pop() !== here) {
        M.flash(text, "success");
        location.href = target.href;
      } else {
        M.showBanner(text, "success");
      }
      window.dispatchEvent(new CustomEvent("miki:pending-saved", { detail }));
      return detail;
    } catch (error) {
      window.dispatchEvent(new CustomEvent("miki:pending-failed", { detail: { message: friendlyDatabaseError(error) } }));
      M.showBanner(`로그인은 완료됐지만 명식을 저장하지 못했어. ${friendlyDatabaseError(error)}`, "error", { label: "다시 저장", run: () => { processPending(); } });
      return null;
    } finally {
      processing = false;
    }
  }

  /* ---------- 오류 문구 ---------- */
  function friendlyAuthError(error) {
    const text = (error && error.message) || "";
    if (error && error.status === 429) return "요청이 너무 많아. 잠깐 기다렸다가 다시 시도해줘.";
    if (/invalid login credentials/i.test(text)) return "이메일이나 비밀번호가 맞지 않아. 다시 확인해줘.";
    if (/email not confirmed/i.test(text)) return "이메일 인증이 아직 끝나지 않았어. 받은 메일의 인증 링크를 먼저 눌러줘.";
    if (/already registered|already been registered/i.test(text)) return "이미 가입된 이메일이야. 로그인해줘.";
    if (/password/i.test(text) && /(short|least|weak|characters)/i.test(text)) return "비밀번호는 8자 이상으로 입력해줘.";
    if (/rate limit/i.test(text)) return "메일을 너무 자주 보냈어. 잠시 뒤에 다시 시도해줘.";
    if (/failed to fetch|network/i.test(text)) return "네트워크 연결을 확인하고 다시 시도해줘.";
    return text || "계정 요청을 처리하지 못했어. 잠시 후 다시 시도해줘.";
  }

  function friendlyDatabaseError(error) {
    if (isMissingTable(error)) return "저장 공간이 아직 준비되지 않았어. 관리자 설정(supabase 마이그레이션)이 필요해.";
    if (error && (error.code === "42501" || error.code === "PGRST301")) return "로그인 확인이 만료됐어. 다시 로그인해줘.";
    return (error && error.message) || "잠시 후 다시 시도해줘.";
  }

  /* ---------- 로그인·회원가입 팝업 ---------- */
  function buildDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "miki-auth-dialog";
    dialog.className = "profile-dialog auth-dialog";
    dialog.setAttribute("aria-labelledby", "miki-auth-title");
    dialog.innerHTML = `
      <form id="miki-auth-form" novalidate>
        <div class="dialog-head"><div><span class="mini-kicker" data-auth-kicker>내 명식을 안전하게 보관해</span><h2 id="miki-auth-title">로그인</h2><p data-auth-lead></p></div><button class="close-button" type="button" data-auth-close aria-label="닫기">×</button></div>
        <div class="member-auth-tabs" role="tablist" aria-label="로그인 또는 회원가입">
          <button class="member-auth-tab is-active" type="button" role="tab" data-auth-mode="login" aria-selected="true">로그인</button>
          <button class="member-auth-tab" type="button" role="tab" data-auth-mode="signup" aria-selected="false">회원가입</button>
        </div>
        <div data-auth-signup hidden>
          <label class="member-field"><span>이름</span><input name="name" maxlength="40" autocomplete="name" placeholder="예: 김미키"></label>
          <p class="field-error" data-error-for="name" role="alert" hidden></p>
          <fieldset class="auth-gender"><legend class="form-label">성별</legend>
            <div class="choice-buttons profile-gender">
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="female"><span>여성</span></label>
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="male"><span>남성</span></label>
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="undisclosed"><span>선택 안 함</span></label>
            </div>
          </fieldset>
          <p class="field-error" data-error-for="gender" role="alert" hidden></p>
        </div>
        <label class="member-field"><span>이메일</span><input name="email" type="email" autocomplete="email" inputmode="email"></label>
        <p class="field-error" data-error-for="email" role="alert" hidden></p>
        <label class="member-field"><span>비밀번호</span><input name="password" type="password" autocomplete="current-password"><small data-auth-pwhint>8자 이상 입력해줘.</small></label>
        <p class="field-error" data-error-for="password" role="alert" hidden></p>
        <p class="form-error" data-auth-error role="alert" hidden></p>
        <p class="form-notice" data-auth-notice role="status" hidden></p>
        <button class="primary-button dialog-submit" type="submit" data-auth-submit>로그인</button>
      </form>`;
    document.body.append(dialog);
    const form = dialog.querySelector("form");
    dialog.querySelectorAll("[data-auth-mode]").forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));
    dialog.querySelector("[data-auth-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("cancel", () => { /* Esc 닫기도 close 이벤트에서 정리한다. */ });
    form.querySelectorAll("input[name='gender']").forEach((radio) => radio.addEventListener("change", () => {
      form.querySelectorAll(".auth-gender .choice-button").forEach((label) => label.classList.toggle("is-selected", label.querySelector("input").checked));
    }));
    form.addEventListener("submit", onSubmit);
    return dialog;
  }

  const field = (name) => dialog.querySelector(`[name="${name}"]`);
  const errorBox = (name) => dialog.querySelector(`[data-error-for="${name}"]`);

  function clearDialogErrors() {
    dialog.querySelectorAll("[data-error-for]").forEach((box) => { box.hidden = true; box.textContent = ""; });
    dialog.querySelectorAll("[aria-invalid]").forEach((input) => { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); });
    const error = dialog.querySelector("[data-auth-error]");
    error.hidden = true; error.textContent = "";
    const notice = dialog.querySelector("[data-auth-notice]");
    notice.hidden = true; notice.textContent = "";
  }

  function fieldError(name, text) {
    const box = errorBox(name);
    box.textContent = text;
    box.hidden = false;
    box.id = box.id || `auth-err-${name}`;
    const input = field(name);
    if (input) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", box.id); }
    return input;
  }

  function formError(text) {
    const box = dialog.querySelector("[data-auth-error]");
    box.textContent = text;
    box.hidden = false;
    if (box.scrollIntoView) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function setMode(mode) {
    state.mode = mode;
    state.emailSent = false;
    clearDialogErrors();
    const signup = mode === "signup";
    dialog.querySelectorAll("[data-auth-mode]").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.authMode === mode);
      tab.setAttribute("aria-selected", String(tab.dataset.authMode === mode));
    });
    dialog.querySelector("[data-auth-signup]").hidden = !signup;
    dialog.querySelector("#miki-auth-title").textContent = signup ? "회원가입" : "로그인";
    const submit = dialog.querySelector("[data-auth-submit]");
    submit.textContent = signup ? "회원가입하기" : "로그인";
    submit.disabled = false;
    field("password").autocomplete = signup ? "new-password" : "current-password";
    dialog.querySelector("[data-auth-pwhint]").hidden = !signup;
  }

  function openAuth(options) {
    if (!configured) {
      M.showBanner((support && support.setupMessage) || "로그인 설정이 아직 준비되지 않았어.", "error");
      return;
    }
    buildDialog();
    const pending = options && options.pending;
    state.pendingKey = null;
    if (pending) {
      state.pendingKey = pending.key;
      writePending({ ...pending, createdAt: Date.now() });
    }
    dialog.querySelector("[data-auth-lead]").textContent = pending
      ? "로그인하거나 가입하면 방금 보던 명식을 내 계정에 바로 저장해줘."
      : "로그인하면 명식을 저장하고 다음에도 이어서 볼 수 있어.";
    setMode((options && options.mode) || "login");
    if (!dialog.open) dialog.showModal();
    field("email").focus();
  }

  function onClose() {
    clearDialogErrors();
    state.busy = false;
    // 이메일 인증을 기다리는 중이 아니면 저장 대기를 취소한다(보고서와 입력값은 그대로 남아 있다).
    const pending = readPending();
    if (pending && state.pendingKey === pending.key && !pending.awaitingEmail && !state.emailSent) clearPending();
    const form = dialog.querySelector("form");
    form.querySelectorAll("input[name='password']").forEach((input) => { input.value = ""; });
    state.emailSent = false;
  }

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (state.busy || state.emailSent) return;
    clearDialogErrors();
    const signup = state.mode === "signup";
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const name = form.elements.name.value.trim();
    const genderInput = form.querySelector("input[name='gender']:checked");
    let first = null;
    const note = (name_, text) => { const input = fieldError(name_, text); if (!first) first = input; };
    if (signup && !name) note("name", "이름을 입력해줘.");
    if (signup && !genderInput) note("gender", "성별을 선택해줘. 밝히고 싶지 않으면 ‘선택 안 함’을 골라도 돼.");
    if (!email) note("email", "이메일을 입력해줘.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) note("email", "이메일 형식을 확인해줘. 예: name@example.com");
    if (!password) note("password", "비밀번호를 입력해줘.");
    else if (signup && password.length < 8) note("password", "비밀번호는 8자 이상으로 입력해줘.");
    if (first) {
      (first.focus ? first : form.querySelector("input[name='gender']")).focus();
      return;
    }

    const submit = form.querySelector("[data-auth-submit]");
    const label = submit.textContent;
    state.busy = true;
    submit.disabled = true;
    submit.textContent = signup ? "가입하는 중…" : "로그인하는 중…";
    const pending = readPending();
    if (pending && pending.key === state.pendingKey) writePending({ ...pending, email });
    let signedIn = false;
    try {
      if (signup) {
        const returnUrl = pending && pending.returnUrl ? pending.returnUrl : location.origin + location.pathname + location.search;
        const { data, error } = await client.auth.signUp({
          email, password,
          options: { emailRedirectTo: new URL(returnUrl, location.href).href, data: { display_name: name, gender: genderInput.value } }
        });
        if (error) throw error;
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          const input = fieldError("email", "이미 가입된 이메일이야. 로그인 탭에서 로그인해줘.");
          input.focus();
          return;
        }
        if (data.session) {
          signedIn = true;
        } else {
          state.emailSent = true;
          const stored = readPending();
          if (stored && stored.key === state.pendingKey) writePending({ ...stored, awaitingEmail: true });
          const notice = dialog.querySelector("[data-auth-notice]");
          notice.textContent = `${email}로 인증 메일을 보냈어. 메일의 링크를 누르면 이 페이지로 돌아와 로그인되고${pending ? ", 방금 보던 명식도 자동으로 저장돼" : ""}. 아직 가입이 끝난 건 아니야.`;
          notice.hidden = false;
          submit.textContent = "인증 메일을 보냈어";
          return;
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        signedIn = true;
      }
    } catch (error) {
      formError(friendlyAuthError(error));
      return;
    } finally {
      state.busy = false;
      if (!state.emailSent) { submit.disabled = false; submit.textContent = label; }
    }
    if (signedIn) {
      state.pendingKey = null;
      dialog.close();
      // 인증은 성공했으므로 이후 단계의 문제는 로그인 실패로 보이지 않게 따로 알린다.
      window.setTimeout(() => { processPending(); }, 0);
    }
  }

  /* ---------- 헤더·인증 상태 ---------- */
  async function refreshHeader() {
    const link = document.querySelector("[data-site-member-link]");
    if (!link) return;
    const label = link.querySelector("[data-site-member-label]");
    try {
      const session = await getSession();
      if (label) label.textContent = session ? "내 명식" : "로그인";
      link.setAttribute("aria-label", session ? "내 명식 보관함으로 이동" : "로그인 또는 내 명식 보관함으로 이동");
    } catch (error) { /* 헤더 문구는 기본값을 유지한다. */ }
  }

  if (configured) {
    client.auth.onAuthStateChange((event) => {
      window.setTimeout(() => {
        refreshHeader();
        if (event === "SIGNED_OUT") M.clearInput(true);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") processPending();
        window.dispatchEvent(new CustomEvent("miki:auth-changed", { detail: { event } }));
      }, 0);
    });
  }
  document.addEventListener("DOMContentLoaded", () => { refreshHeader(); processPending(); });

  window.MikiAccount = Object.freeze({
    configured, client, getSession, loadAccount, updateAccount, listProfiles, saveProfile, processPending,
    openAuth, readPending, clearPending, isSaved, markSaved, friendlyAuthError, friendlyDatabaseError, isMissingTable
  });
}());
