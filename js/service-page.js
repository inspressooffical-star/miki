(function () {
  "use strict";

  const main = document.querySelector("[data-service-page]");
  if (!main) return;
  const kind = main.dataset.servicePage;
  const M = window.Miki;
  const Account = window.MikiAccount;
  const els = {
    input: document.getElementById("service-input"),
    form: document.getElementById("service-form"),
    birth: document.getElementById("service-birth"),
    formError: document.getElementById("service-form-error"),
    current: document.getElementById("service-current"),
    report: document.getElementById("service-report")
  };
  let saving = false;

  window.MikiBirth.mount(els.birth);
  const radios = () => Array.from(els.form.querySelectorAll("input[name='gender']"));
  function syncGender() {
    els.form.querySelectorAll(".auth-gender .choice-button").forEach((label) => label.classList.toggle("is-selected", label.querySelector("input").checked));
  }
  radios().forEach((radio) => radio.addEventListener("change", syncGender));

  const show = (node, visible) => { node.hidden = !visible; };
  const setText = (node, text) => { node.textContent = text; node.hidden = !text; };

  function clearFormErrors() {
    setText(els.formError, "");
    const box = els.form.querySelector("[data-error-for='gender']");
    box.hidden = true; box.textContent = "";
    window.MikiBirth.clearErrors(els.birth);
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    clearFormErrors();
    const genderInput = form.querySelector("input[name='gender']:checked");
    const result = window.MikiBirth.read(els.birth);
    if (!genderInput) {
      const box = form.querySelector("[data-error-for='gender']");
      box.textContent = "성별을 선택해줘. 밝히고 싶지 않으면 ‘선택 안 함’을 골라도 돼.";
      box.hidden = false;
      if (result.ok) form.querySelector("input[name='gender']").focus();
    }
    if (!result.ok || !genderInput) return;
    const name = form.elements.name.value.trim();
    M.setInput(result.input, { name, gender: genderInput.value, source: "guest" });
    start({ input: result.input, name, gender: genderInput.value, source: "guest" });
  });

  function profileLine(data) {
    const lunar = data.input.calendar === "lunar" ? `음력${data.input.leapMonth ? "(윤달)" : ""} ` : "양력 ";
    return `${data.name || "이름 없음"} · ${lunar}${data.input.birthDate} · ${M.formatTime(data.input.birthTime)} · ${M.genderLabel(data.gender)}`;
  }

  function renderCurrent(data) {
    els.current.replaceChildren();
    const label = document.createElement("span");
    label.textContent = profileLine(data);
    const change = document.createElement("button");
    change.type = "button";
    change.className = "text-button";
    change.textContent = "명식 바꾸기";
    change.addEventListener("click", () => {
      show(els.input, true);
      window.MikiBirth.fill(els.birth, data.input);
      els.form.elements.name.value = data.name || "";
      radios().forEach((radio) => { radio.checked = radio.value === data.gender; });
      syncGender();
      els.input.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    els.current.append(label, change);
    show(els.current, true);
  }

  function saveSection(data) {
    const wrap = document.createElement("section");
    wrap.className = "report-save";
    wrap.setAttribute("aria-labelledby", "report-save-title");
    wrap.innerHTML = "<h3 id=\"report-save-title\">이 명식을 내 계정에 보관할까?</h3><p class=\"report-save-lead\"></p><p class=\"form-error\" role=\"alert\" hidden></p><button class=\"primary-button\" type=\"button\" data-save-profile>내 명식 저장하기</button><p class=\"report-save-done\" role=\"status\" hidden></p>";
    const lead = wrap.querySelector(".report-save-lead");
    const error = wrap.querySelector(".form-error");
    const button = wrap.querySelector("button");
    const done = wrap.querySelector(".report-save-done");
    lead.textContent = "로그인 상태라면 바로 저장되고, 아니라면 로그인·회원가입 뒤에 방금 본 명식이 자동으로 저장돼.";
    let saved = false;

    const markDone = (text) => {
      saved = true;
      done.textContent = text; done.hidden = false; error.hidden = true;
      button.disabled = true; button.textContent = "저장 완료";
    };
    Account.isSaved(data.input).then((already) => { if (already) markDone("이 명식은 이미 내 명식 보관함에 저장되어 있어."); }).catch(() => {});

    button.addEventListener("click", async () => {
      if (saving || saved) return;
      saving = true;
      error.hidden = true;
      button.disabled = true;
      try {
        const session = await Account.getSession();
        if (!session) {
          // 저장 대기 정보에는 명식 입력, 이름, 성별, 돌아올 주소만 최소한으로 담는다.
          const existing = Account.readPending();
          const key = existing && existing.returnUrl === location.href && M.signature(existing.input) === M.signature(data.input) ? existing.key : M.uuid();
          Account.openAuth({ mode: "login", pending: { key, input: data.input, name: data.name || "", gender: data.gender, returnUrl: location.href, email: "" } });
          return;
        }
        const result = await Account.saveProfile({ input: data.input, name: data.name || "내 명식", gender: data.gender, dedupe: true, clientKey: M.uuid() });
        markDone(result.status === "exists" ? "이미 내 명식 보관함에 있는 명식이야." : "내 명식 보관함에 저장했어.");
      } catch (err) {
        error.textContent = `저장하지 못했어. ${Account.friendlyDatabaseError(err)}`;
        error.hidden = false;
      } finally {
        saving = false;
        if (!saved) button.disabled = false;
      }
    });
    window.addEventListener("miki:pending-saved", (event) => {
      if (event.detail && M.signature(event.detail.input) === M.signature(data.input)) markDone(event.detail.status === "exists" ? "이미 내 명식 보관함에 있는 명식이야." : "방금 본 명식을 내 명식 보관함에 저장했어.");
    });
    return wrap;
  }

  function start(data) {
    show(els.input, false);
    renderCurrent(data);
    try {
      const report = window.MikiReport.build(kind, data.input, { gender: data.gender, name: data.name, now: new Date() });
      window.MikiReportView.render(report, els.report, { prefix: kind, footer: saveSection(data) });
    } catch (error) {
      els.report.hidden = true;
      setText(els.formError, error.message || "풀이를 만들지 못했어.");
      show(els.input, true);
    }
  }

  async function init() {
    const stored = M.getInput();
    if (stored) { start(stored); return; }
    // 입력이 없으면 로그인 계정의 기본 명식을 이어서 보여준다.
    try {
      const session = Account.configured ? await Account.getSession() : null;
      if (session) {
        const list = await Account.listProfiles(session.user.id);
        const profile = list.find((item) => item.is_default) || list[0];
        if (profile) {
          const input = { birthDate: profile.birth_date, calendar: profile.calendar, leapMonth: profile.leap_month, birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : "" };
          M.setInput(input, { name: profile.name, gender: profile.gender, source: "account" });
          start({ input, name: profile.name, gender: profile.gender, source: "account" });
          return;
        }
      }
    } catch (error) { /* 불러오지 못해도 직접 입력으로 이어간다. */ }
    show(els.input, true);
  }

  window.addEventListener("miki:pending-saved", () => {
    if (!els.report.hidden) return;
    const stored = M.getInput();
    if (stored) start(stored);
  });
  init();
}());
