(function () {
  "use strict";

  const root = document.querySelector("[data-member-app]");
  if (!root) return;

  const message = document.getElementById("member-message");
  const authPanel = document.getElementById("member-auth-panel");
  const accountPanel = document.getElementById("member-account-panel");
  const client = window.MikiSupabase.client;
  let authMode = "login";
  let profiles = [];

  if (!window.MikiSupabase.configured || !client) {
    authPanel.hidden = true;
    showMessage(window.MikiSupabase.setupMessage, "error");
    return;
  }

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      document.getElementById("member-auth-submit").textContent =
        authMode === "signup" ? "회원가입하기" : "로그인";
      document.getElementById("member-password").autocomplete =
        authMode === "signup" ? "new-password" : "current-password";
      hideMessage();
    });
  });

  document.getElementById("member-auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("member-email").value.trim();
    const password = document.getElementById("member-password").value;
    const submit = document.getElementById("member-auth-submit");
    setBusy(submit, true, authMode === "signup" ? "가입하는 중…" : "로그인하는 중…");
    try {
      if (authMode === "signup") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href.split("?")[0] }
        });
        if (error) throw error;
        if (data.session) {
          showMessage("가입했어. 이제 명식을 등록할 수 있어.", "success");
        } else {
          showMessage("가입 확인 메일을 보냈어. 이메일 인증을 마친 뒤 로그인해줘.", "success");
          setBusy(submit, false);
          return;
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await refreshAccount();
    } catch (error) {
      showMessage(friendlyAuthError(error), "error");
    } finally {
      setBusy(submit, false);
    }
  });

  document.getElementById("member-signout").addEventListener("click", async () => {
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      sessionStorage.removeItem("mikiSajuResult");
      sessionStorage.removeItem("mikiSajuProfileName");
      await refreshAccount();
      showMessage("로그아웃했어.", "success");
    } catch (error) {
      showMessage(error.message || "로그아웃하지 못했어. 다시 시도해줘.", "error");
    }
  });

  const profileDialog = document.getElementById("profile-dialog");
  document.getElementById("member-add-profile").addEventListener("click", () => {
    document.getElementById("profile-default").checked = profiles.length === 0;
    profileDialog.showModal();
  });
  document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());
  profileDialog.addEventListener("click", (event) => {
    if (event.target === profileDialog) profileDialog.close();
  });

  document.querySelectorAll(".profile-dialog [inputmode='numeric']").forEach((input) => {
    input.addEventListener("input", () => { input.value = input.value.replace(/[^0-9]/g, ""); });
  });
  bindChoice("[data-gender]", "#profile-gender-value", "data-gender");
  bindChoice("[data-profile-calendar]", "#profile-calendar", "data-profile-calendar");
  bindChoice("[data-profile-period]", "#profile-time-period", "data-profile-period");
  document.querySelectorAll("[data-profile-calendar]").forEach((button) => {
    button.addEventListener("click", () => {
      const lunar = button.dataset.profileCalendar === "lunar";
      document.getElementById("profile-leap-label").hidden = !lunar;
      if (!lunar) document.getElementById("profile-leap").checked = false;
      document.getElementById("profile-date-label").innerHTML =
        `${lunar ? "음력" : "양력"} 생년월일 <span class="optional-label">숫자로 입력해줘</span>`;
    });
  });

  document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("[type='submit']");
    if (!form.reportValidity()) return;
    const hourValue = document.getElementById("profile-hour").value;
    const minuteValue = document.getElementById("profile-minute").value;
    if (Boolean(hourValue) !== Boolean(minuteValue)) {
      showMessage("태어난 시간을 입력할 때는 시와 분을 함께 적어줘.", "error");
      return;
    }
    let birthTime = null;
    if (hourValue && minuteValue) {
      const hour = Number(hourValue);
      const minute = Number(minuteValue);
      if (hour < 1 || hour > 12 || minute > 59) {
        showMessage("시간은 1~12시, 분은 0~59분으로 입력해줘.", "error");
        return;
      }
      const isPm = document.getElementById("profile-time-period").value === "pm";
      birthTime = `${String((hour % 12) + (isPm ? 12 : 0)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    const input = {
      birthDate: [
        document.getElementById("profile-year").value,
        document.getElementById("profile-month").value.padStart(2, "0"),
        document.getElementById("profile-day").value.padStart(2, "0")
      ].join("-"),
      calendar: document.getElementById("profile-calendar").value,
      leapMonth: document.getElementById("profile-leap").checked,
      birthTime: birthTime || ""
    };
    const profileName = document.getElementById("profile-name").value.trim();
    if (!profileName) {
      showMessage("명식 이름을 입력해줘.", "error");
      return;
    }
    try {
      window.SajuCore.calculate(input);
    } catch (error) {
      showMessage(error.message || "입력한 생년월일을 확인해줘.", "error");
      return;
    }
    setBusy(submit, true, "저장하는 중…");
    try {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      const shouldDefault = document.getElementById("profile-default").checked || profiles.length === 0;
      if (shouldDefault) {
        const { error: clearError } = await client.from("saju_profiles")
          .update({ is_default: false })
          .eq("user_id", userData.user.id);
        if (clearError) throw clearError;
      }
      const { data, error } = await client.from("saju_profiles").insert({
        user_id: userData.user.id,
        name: profileName,
        gender: document.getElementById("profile-gender-value").value,
        birth_date: input.birthDate,
        calendar: input.calendar,
        leap_month: input.leapMonth,
        birth_time: input.birthTime || null,
        is_default: shouldDefault
      }).select().single();
      if (error) throw error;
      profileDialog.close();
      form.reset();
      resetProfileChoices();
      await refreshAccount();
      if (data.is_default) persistSelectedProfile(data);
      showMessage("명식을 계정에 저장했어. 다음에 로그인해도 다시 볼 수 있어.", "success");
    } catch (error) {
      showMessage(friendlyDatabaseError(error), "error");
    } finally {
      setBusy(submit, false);
    }
  });

  client.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      if (session) refreshAccount();
      else {
        profiles = [];
        accountPanel.hidden = true;
        authPanel.hidden = false;
      }
    }, 0);
  });
  refreshAccount();

  async function refreshAccount() {
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        accountPanel.hidden = true;
        authPanel.hidden = false;
        return;
      }
      const user = sessionData.session.user;
      const { data, error } = await client.from("saju_profiles")
        .select("id,user_id,name,gender,birth_date,calendar,leap_month,birth_time,is_default,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      profiles = data;
      document.getElementById("member-email-label").textContent = user.email || "내 계정";
      authPanel.hidden = true;
      accountPanel.hidden = false;
      renderProfiles();
      if (profiles.length) {
        const selected = profiles.find((profile) => profile.is_default) || profiles[0];
        persistSelectedProfile(selected);
      } else {
        sessionStorage.removeItem("mikiSajuResult");
        sessionStorage.removeItem("mikiSajuProfileName");
      }
    } catch (error) {
      showMessage(friendlyDatabaseError(error), "error");
    }
  }

  function renderProfiles() {
    const list = document.getElementById("member-profile-list");
    list.replaceChildren();
    if (!profiles.length) {
      const empty = document.createElement("div");
      empty.className = "member-empty";
      empty.append(
        make("h3", "아직 저장된 명식이 없어"),
        make("p", "나와 가족, 친구의 명식을 등록해두면 언제든 다시 불러오고 궁합도 볼 수 있어.")
      );
      list.append(empty);
      return;
    }
    profiles.forEach((profile) => {
      const chart = window.SajuCore.calculate(toCoreInput(profile));
      const card = make("article", "member-profile-card");
      const heading = make("div", "member-profile-title");
      heading.append(make("h3", profile.name));
      if (profile.is_default) heading.append(make("span", "default-badge", "기본 명식"));
      card.append(heading);
      card.append(make("p", "member-profile-meta",
        `${genderLabel(profile.gender)} · ${profile.calendar === "lunar" ? `음력${profile.leap_month ? " 윤달" : ""}` : "양력"} ${profile.birth_date}${profile.birth_time ? ` · ${profile.birth_time.slice(0, 5)}` : " · 시간 미상"}`));
      const pillars = make("div", "member-pillar-preview");
      chart.pillars.forEach(({ label, pillar }) => {
        const item = make("span", "", `${label} ${pillar.stem.hanja}${pillar.branch.hanja} (${pillar.stem.name}${pillar.branch.name})`);
        pillars.append(item);
      });
      card.append(pillars);
      const actions = make("div", "member-profile-actions");
      const select = make("button", "text-button", profile.is_default ? "기본 명식" : "기본으로 설정");
      select.type = "button";
      select.disabled = profile.is_default;
      select.addEventListener("click", () => setDefaultProfile(profile));
      const remove = make("button", "text-button text-button-danger", "삭제");
      remove.type = "button";
      remove.addEventListener("click", () => deleteProfile(profile));
      actions.append(select, remove);
      card.append(actions);
      list.append(card);
    });
  }

  async function setDefaultProfile(profile) {
    try {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      const { error: clearError } = await client.from("saju_profiles").update({ is_default: false }).eq("user_id", userData.user.id);
      if (clearError) throw clearError;
      const { error } = await client.from("saju_profiles").update({ is_default: true }).eq("id", profile.id).eq("user_id", userData.user.id);
      if (error) throw error;
      persistSelectedProfile(profile);
      await refreshAccount();
      showMessage(`${profile.name} 명식을 기본 명식으로 설정했어.`, "success");
    } catch (error) {
      showMessage(friendlyDatabaseError(error), "error");
    }
  }

  async function deleteProfile(profile) {
    if (!window.confirm(`‘${profile.name}’ 명식을 삭제할까? 삭제한 명식은 복구할 수 없어.`)) return;
    try {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      const { error } = await client.from("saju_profiles").delete().eq("id", profile.id).eq("user_id", userData.user.id);
      if (error) throw error;
      await refreshAccount();
      if (profile.is_default && profiles.length) await setDefaultProfile(profiles[0]);
      showMessage("명식을 삭제했어.", "success");
    } catch (error) {
      showMessage(friendlyDatabaseError(error), "error");
    }
  }

  function bindChoice(selector, target, dataKey) {
    document.querySelectorAll(selector).forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelector(target).value = button.dataset[dataKey];
        document.querySelectorAll(selector).forEach((choice) => {
          const selected = choice === button;
          choice.classList.toggle("is-selected", selected);
          choice.setAttribute("aria-pressed", String(selected));
        });
      });
    });
  }

  function resetProfileChoices() {
    ["[data-gender]", "[data-profile-calendar]", "[data-profile-period]"].forEach((selector) => {
      const first = document.querySelector(selector);
      if (first) first.click();
    });
    document.getElementById("profile-leap-label").hidden = true;
  }

  function toCoreInput(profile) {
    return {
      birthDate: profile.birth_date,
      calendar: profile.calendar,
      leapMonth: profile.leap_month,
      birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : ""
    };
  }

  function persistSelectedProfile(profile) {
    try {
      sessionStorage.setItem("mikiSajuResult", JSON.stringify(toCoreInput(profile)));
      sessionStorage.setItem("mikiSajuProfileName", profile.name);
    } catch (error) {
      showMessage("이 브라우저에서 명식을 불러올 수 없어. 브라우저 저장 설정을 확인해줘.", "error");
    }
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function genderLabel(value) {
    return { female: "여성", male: "남성", undisclosed: "성별 선택 안 함" }[value] || "성별 선택 안 함";
  }

  function friendlyAuthError(error) {
    if (error.status === 429) return "잠깐 기다렸다가 다시 시도해줘.";
    if (/invalid login credentials/i.test(error.message || "")) return "이메일이나 비밀번호를 다시 확인해줘.";
    if (/user already registered/i.test(error.message || "")) return "이미 가입된 이메일이야. 로그인해줘.";
    if (/password/i.test(error.message || "")) return "비밀번호를 8자 이상으로 입력해줘.";
    return error.message || "계정 요청을 처리하지 못했어. 잠시 후 다시 시도해줘.";
  }

  function friendlyDatabaseError(error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return "명식 저장 테이블을 찾지 못했어. Supabase에서 supabase/schema.sql을 먼저 실행해줘.";
    }
    if (error.code === "42501" || error.code === "PGRST301") {
      return "계정 확인이 만료됐어. 다시 로그인해줘.";
    }
    return error.message || "저장한 명식을 불러오지 못했어. 연결 설정과 권한을 확인해줘.";
  }

  function setBusy(button, busy, label) {
    if (busy) {
      button.dataset.originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = label;
    } else {
      button.disabled = false;
      if (button.dataset.originalLabel) button.textContent = button.dataset.originalLabel;
      delete button.dataset.originalLabel;
    }
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `member-message is-${type}`;
  }

  function hideMessage() {
    message.textContent = "";
    message.className = "member-message";
  }
}());
