(function () {
  "use strict";

  const KEYS = { input: "mikiSajuResult", name: "mikiSajuProfileName", gender: "mikiSajuGender", source: "mikiSajuSource" };
  const FLASH_KEY = "mikiFlash";

  function safe(storage, action, key, value) {
    try {
      if (action === "get") return window[storage].getItem(key);
      if (action === "set") window[storage].setItem(key, value);
      if (action === "remove") window[storage].removeItem(key);
    } catch (error) { /* 저장소를 쓸 수 없는 브라우저에서는 조용히 건너뛴다. */ }
    return null;
  }

  const pad = (value) => String(value).padStart(2, "0");

  // 시간은 항상 24시간 'HH:MM'으로 저장하고, 입력·표시는 오전/오후 1~12시로 통일한다.
  function to24(period, hour, minute) {
    const base = hour % 12;
    return `${pad(base + (period === "pm" ? 12 : 0))}:${pad(minute)}`;
  }

  function formatTime(value) {
    const match = /^(\d{2}):(\d{2})/.exec(value || "");
    if (!match) return "시간 미상";
    const hour = Number(match[1]);
    const period = hour >= 12 ? "오후" : "오전";
    const shown = hour % 12 === 0 ? 12 : hour % 12;
    return `${period} ${shown}:${match[2]}`;
  }

  function signature(input) {
    return [input.calendar, input.leapMonth ? 1 : 0, input.birthDate, input.birthTime || ""].join("|");
  }

  function genderLabel(value) {
    return { female: "여성", male: "남성", undisclosed: "선택 안 함" }[value] || "선택 안 함";
  }

  function getInput() {
    const raw = safe("sessionStorage", "get", KEYS.input);
    if (!raw) return null;
    try {
      const input = JSON.parse(raw);
      return {
        input,
        name: safe("sessionStorage", "get", KEYS.name) || "",
        gender: safe("sessionStorage", "get", KEYS.gender) || "undisclosed",
        source: safe("sessionStorage", "get", KEYS.source) || "guest"
      };
    } catch (error) {
      return null;
    }
  }

  function setInput(input, meta) {
    safe("sessionStorage", "set", KEYS.input, JSON.stringify({
      birthDate: input.birthDate, calendar: input.calendar, leapMonth: Boolean(input.leapMonth), birthTime: input.birthTime || ""
    }));
    safe("sessionStorage", "set", KEYS.name, (meta && meta.name) || "");
    safe("sessionStorage", "set", KEYS.gender, (meta && meta.gender) || "undisclosed");
    safe("sessionStorage", "set", KEYS.source, (meta && meta.source) || "guest");
  }

  function clearInput(onlyAccount) {
    if (onlyAccount && safe("sessionStorage", "get", KEYS.source) !== "account") return;
    Object.values(KEYS).forEach((key) => safe("sessionStorage", "remove", key));
  }

  function flash(text, type) {
    safe("sessionStorage", "set", FLASH_KEY, JSON.stringify({ text, type: type || "success" }));
  }

  function showBanner(text, type, action) {
    let banner = document.getElementById("miki-flash");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "miki-flash";
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
      const header = document.querySelector("header.topbar");
      if (header && header.parentNode) header.parentNode.insertBefore(banner, header.nextSibling);
      else document.body.prepend(banner);
    }
    banner.className = `miki-flash is-${type || "success"}`;
    banner.replaceChildren();
    const span = document.createElement("span");
    span.textContent = text;
    banner.append(span);
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-button";
      button.textContent = action.label;
      button.addEventListener("click", action.run);
      banner.append(button);
    }
    const close = document.createElement("button");
    close.type = "button";
    close.className = "miki-flash-close";
    close.setAttribute("aria-label", "알림 닫기");
    close.textContent = "×";
    close.addEventListener("click", () => banner.remove());
    banner.append(close);
  }

  function showStoredFlash() {
    const raw = safe("sessionStorage", "get", FLASH_KEY);
    if (!raw) return;
    safe("sessionStorage", "remove", FLASH_KEY);
    try {
      const data = JSON.parse(raw);
      if (data && data.text) showBanner(data.text, data.type);
    } catch (error) { /* 잘못된 알림은 무시한다. */ }
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  document.addEventListener("DOMContentLoaded", showStoredFlash);

  window.Miki = Object.freeze({
    KEYS, safe, pad, to24, formatTime, signature, genderLabel, getInput, setInput, clearInput, flash, showBanner, uuid
  });
}());
