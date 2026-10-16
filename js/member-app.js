(function () {
  "use strict";

  const root = document.querySelector("[data-member-app]");
  if (!root) return;

  const M = window.Miki;
  const Account = window.MikiAccount;
  const message = document.getElementById("member-message");
  const authPanel = document.getElementById("member-auth-panel");
  const accountPanel = document.getElementById("member-account-panel");
  const profileDialog = document.getElementById("profile-dialog");
  const profileForm = document.getElementById("profile-form");
  const profileBirth = document.getElementById("profile-birth");
  const accountDialog = document.getElementById("account-dialog");
  const accountForm = document.getElementById("account-form");
  let profiles = [];
  let currentUser = null;
  let account = { name: "", gender: "", email: "" };
  let refreshing = 0;

  if (!Account.configured) {
    authPanel.hidden = true;
    showMessage((window.MikiSupabase && window.MikiSupabase.setupMessage) || "로그인 설정이 아직 준비되지 않았어.", "error");
    return;
  }

  window.MikiBirth.mount(profileBirth);
  document.querySelectorAll("[data-open-auth]").forEach((button) => {
    button.addEventListener("click", () => Account.openAuth({ mode: button.dataset.openAuth }));
  });

  function syncGender(form) {
    form.querySelectorAll(".choice-button").forEach((label) => {
      const input = label.querySelector("input[type='radio']");
      if (input) label.classList.toggle("is-selected", input.checked);
    });
  }
  [profileForm, accountForm].forEach((form) => {
    form.querySelectorAll("input[name='gender']").forEach((radio) => radio.addEventListener("change", () => {
      syncGender(form);
      setFieldError(form, "gender", "");
    }));
    form.querySelectorAll("input[name='name']").forEach((input) => input.addEventListener("input", () => setFieldError(form, "name", "")));
  });

  function setFieldError(form, name, text) {
    const box = form.querySelector(`[data-error-for='${name}']`);
    if (!box) return;
    box.textContent = text;
    box.hidden = !text;
    const input = form.querySelector(`[name='${name}']`);
    if (input) { if (text) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
  }
  function setFormError(form, text) {
    const box = form.querySelector("[data-form-error]");
    box.textContent = text;
    box.hidden = !text;
    if (text) box.scrollIntoView({ block: "nearest" });
  }
  function clearErrors(form) {
    setFieldError(form, "name", "");
    setFieldError(form, "gender", "");
    setFormError(form, "");
  }
  function focusFirstInvalid(form) {
    const target = form.querySelector("[aria-invalid='true']") || form.querySelector("input[name='gender']");
    if (target) { target.scrollIntoView({ block: "center" }); target.focus(); }
  }

  function checkedGender(form) {
    const checked = form.querySelector("input[name='gender']:checked");
    return checked ? checked.value : "";
  }
  function setGender(form, value) {
    form.querySelectorAll("input[name='gender']").forEach((radio) => { radio.checked = radio.value === value; });
    syncGender(form);
  }

  /* ---------- 명식 등록 팝업 ---------- */
  function resetProfileForm() {
    profileForm.reset();
    window.MikiBirth.reset(profileBirth);
    clearErrors(profileForm);
    setGender(profileForm, "");
  }

  document.getElementById("member-add-profile").addEventListener("click", () => {
    resetProfileForm();
    profileForm.elements.isDefault.checked = profiles.length === 0;
    profileDialog.showModal();
    profileForm.elements.name.focus();
  });
  document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());
  profileDialog.addEventListener("click", (event) => { if (event.target === profileDialog) profileDialog.close(); });
  profileDialog.addEventListener("close", () => clearErrors(profileForm));

  let savingProfile = false;
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (savingProfile) return;
    clearErrors(form);
    window.MikiBirth.clearErrors(profileBirth);
    const name = form.elements.name.value.trim();
    const gender = checkedGender(form);
    if (!name) setFieldError(form, "name", "명식 이름을 입력해줘.");
    if (!gender) setFieldError(form, "gender", "성별을 선택해줘. 밝히고 싶지 않으면 ‘선택 안 함’을 골라도 돼.");
    const birth = window.MikiBirth.read(profileBirth);
    if (!name || !gender) {
      if (!name) form.elements.name.focus(); else if (birth.ok) form.querySelector("input[name='gender']").focus();
      return;
    }
    if (!birth.ok) return;
    const submit = form.querySelector("[type='submit']");
    savingProfile = true;
    submit.disabled = true;
    submit.textContent = "저장하는 중…";
    try {
      const result = await Account.saveProfile({ input: birth.input, name, gender, makeDefault: form.elements.isDefault.checked, clientKey: M.uuid() });
      profileDialog.close();
      resetProfileForm();
      await refreshAccount();
      showMessage(result.status === "exists" ? "이미 저장된 명식이야." : "명식을 계정에 저장했어. 다음에 로그인해도 다시 볼 수 있어.", "success");
    } catch (error) {
      setFormError(form, `저장하지 못했어. ${Account.friendlyDatabaseError(error)}`);
    } finally {
      savingProfile = false;
      submit.disabled = false;
      submit.textContent = "내 명식 저장하기";
    }
  });

  /* ---------- 계정 정보 수정 ---------- */
  document.getElementById("member-edit-account").addEventListener("click", () => {
    clearErrors(accountForm);
    accountForm.elements.name.value = account.name || "";
    setGender(accountForm, account.gender || "");
    accountDialog.showModal();
    accountForm.elements.name.focus();
  });
  document.querySelector("[data-close-account]").addEventListener("click", () => accountDialog.close());
  accountDialog.addEventListener("click", (event) => { if (event.target === accountDialog) accountDialog.close(); });
  accountDialog.addEventListener("close", () => clearErrors(accountForm));

  let savingAccount = false;
  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (savingAccount) return;
    clearErrors(form);
    const name = form.elements.name.value.trim();
    const gender = checkedGender(form);
    if (!name) setFieldError(form, "name", "이름을 입력해줘.");
    if (!gender) setFieldError(form, "gender", "성별을 선택해줘. 밝히고 싶지 않으면 ‘선택 안 함’을 골라도 돼.");
    if (!name || !gender) { focusFirstInvalid(form); return; }
    const submit = form.querySelector("[type='submit']");
    savingAccount = true;
    submit.disabled = true;
    try {
      await Account.updateAccount(currentUser, { name, gender });
      accountDialog.close();
      await refreshAccount();
      showMessage("계정 정보를 저장했어.", "success");
    } catch (error) {
      setFormError(form, `저장하지 못했어. ${Account.friendlyDatabaseError(error)}`);
    } finally {
      savingAccount = false;
      submit.disabled = false;
    }
  });

  /* ---------- 로그아웃 ---------- */
  document.getElementById("member-signout").addEventListener("click", async () => {
    try {
      const { error } = await Account.client.auth.signOut();
      if (error) throw error;
      M.clearInput(true);
      await refreshAccount();
      showMessage("로그아웃했어.", "success");
    } catch (error) {
      showMessage(error.message || "로그아웃하지 못했어. 다시 시도해줘.", "error");
    }
  });

  window.addEventListener("miki:auth-changed", () => refreshAccount());
  window.addEventListener("miki:pending-saved", () => refreshAccount());
  refreshAccount();

  async function refreshAccount() {
    const ticket = ++refreshing;
    try {
      const session = await Account.getSession();
      if (ticket !== refreshing) return;
      if (!session) {
        currentUser = null;
        profiles = [];
        accountPanel.hidden = true;
        authPanel.hidden = false;
        return;
      }
      currentUser = session.user;
      account = await Account.loadAccount(session.user);
      profiles = await Account.listProfiles(session.user.id);
      if (ticket !== refreshing) return;
      document.getElementById("member-account-name").textContent = account.name ? `${account.name}님` : "회원님";
      document.getElementById("member-email-label").textContent = session.user.email || "";
      document.getElementById("member-edit-account").textContent = account.name ? "이름·성별 수정" : "이름·성별 추가";
      authPanel.hidden = true;
      accountPanel.hidden = false;
      hideMessage();
      renderProfiles();
      if (profiles.length) {
        const selected = profiles.find((profile) => profile.is_default) || profiles[0];
        M.setInput(toCoreInput(selected), { name: selected.name, gender: selected.gender, source: "account" });
      } else {
        M.clearInput(true);
      }
    } catch (error) {
      showMessage(Account.friendlyDatabaseError(error), "error");
    }
  }

  function renderProfiles() {
    const list = document.getElementById("member-profile-list");
    list.replaceChildren();
    if (!profiles.length) {
      const empty = make("div", "member-empty");
      empty.append(make("h3", "", "아직 저장된 명식이 없어"), make("p", "", "나와 가족, 친구의 명식을 등록해두면 언제든 다시 불러오고 궁합도 볼 수 있어."));
      list.append(empty);
      return;
    }
    profiles.forEach((profile) => {
      const card = make("article", "member-profile-card");
      const heading = make("div", "member-profile-title");
      heading.append(make("h3", "", profile.name));
      if (profile.is_default) heading.append(make("span", "default-badge", "기본 명식"));
      card.append(heading);
      const lunar = profile.calendar === "lunar" ? `음력${profile.leap_month ? " 윤달" : ""}` : "양력";
      card.append(make("p", "member-profile-meta", `${M.genderLabel(profile.gender)} · ${lunar} ${profile.birth_date} · ${M.formatTime(profile.birth_time ? profile.birth_time.slice(0, 5) : "")}`));
      try {
        const chart = window.SajuCore.calculate(toCoreInput(profile));
        const pillars = make("div", "member-pillar-preview");
        chart.pillars.forEach(({ label, pillar }) => {
          pillars.append(make("span", "", `${label} ${pillar.stem.hanja}${pillar.branch.hanja} (${pillar.stem.name}${pillar.branch.name})`));
        });
        card.append(pillars);
      } catch (error) { /* 계산하지 못하는 명식은 요약만 보여준다. */ }
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
      const { error: clearError } = await Account.client.from("saju_profiles").update({ is_default: false }).eq("user_id", currentUser.id);
      if (clearError) throw clearError;
      const { error } = await Account.client.from("saju_profiles").update({ is_default: true }).eq("id", profile.id).eq("user_id", currentUser.id);
      if (error) throw error;
      await refreshAccount();
      showMessage(`${profile.name} 명식을 기본 명식으로 설정했어.`, "success");
    } catch (error) {
      showMessage(Account.friendlyDatabaseError(error), "error");
    }
  }

  async function deleteProfile(profile) {
    if (!window.confirm(`‘${profile.name}’ 명식을 삭제할까? 삭제한 명식은 복구할 수 없어.`)) return;
    try {
      const { error } = await Account.client.from("saju_profiles").delete().eq("id", profile.id).eq("user_id", currentUser.id);
      if (error) throw error;
      await refreshAccount();
      if (profile.is_default && profiles.length) await setDefaultProfile(profiles[0]);
      showMessage("명식을 삭제했어.", "success");
    } catch (error) {
      showMessage(Account.friendlyDatabaseError(error), "error");
    }
  }

  function toCoreInput(profile) {
    return { birthDate: profile.birth_date, calendar: profile.calendar, leapMonth: profile.leap_month, birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : "" };
  }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
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
