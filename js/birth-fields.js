(function () {
  "use strict";

  let counter = 0;

  function template(uid) {
    return `
      <span class="form-label">날짜 기준</span>
      <div class="choice-buttons" role="group" aria-label="양력 또는 음력 선택">
        <button class="choice-button is-selected" type="button" data-bf-calendar="solar" aria-pressed="true">양력</button>
        <button class="choice-button" type="button" data-bf-calendar="lunar" aria-pressed="false">음력</button>
      </div>
      <span class="form-label" data-bf-datelabel id="${uid}-date">양력 생년월일 <span class="optional-label">숫자로 입력해줘</span></span>
      <div class="numeric-date-fields" role="group" aria-labelledby="${uid}-date">
        <label class="numeric-field"><span class="visually-hidden">태어난 해</span><input data-bf="year" inputmode="numeric" maxlength="4" placeholder="1990" autocomplete="off"><span>년</span></label>
        <label class="numeric-field"><span class="visually-hidden">태어난 달</span><input data-bf="month" inputmode="numeric" maxlength="2" placeholder="01" autocomplete="off"><span>월</span></label>
        <label class="numeric-field"><span class="visually-hidden">태어난 날</span><input data-bf="day" inputmode="numeric" maxlength="2" placeholder="01" autocomplete="off"><span>일</span></label>
      </div>
      <p class="field-error" data-bf-error="date" role="alert" hidden></p>
      <label class="leap-month-option" data-bf-leapwrap hidden><input type="checkbox" data-bf="leap"><span>윤달에 태어났어요</span></label>
      <span class="form-label" id="${uid}-time">태어난 시간 <span class="optional-label">(모르면 비워도 괜찮아)</span></span>
      <div class="birth-time-controls" role="group" aria-labelledby="${uid}-time">
        <div class="choice-buttons time-period-buttons" role="group" aria-label="오전 또는 오후 선택">
          <button class="choice-button is-selected" type="button" data-bf-period="am" aria-pressed="true">오전</button>
          <button class="choice-button" type="button" data-bf-period="pm" aria-pressed="false">오후</button>
        </div>
        <div class="numeric-time-fields">
          <label class="numeric-field"><span class="visually-hidden">태어난 시, 1에서 12까지</span><input data-bf="hour" inputmode="numeric" maxlength="2" placeholder="9" autocomplete="off"><span>시</span></label>
          <span class="time-separator" aria-hidden="true">:</span>
          <label class="numeric-field"><span class="visually-hidden">태어난 분, 0에서 59까지</span><input data-bf="minute" inputmode="numeric" maxlength="2" placeholder="30" autocomplete="off"><span>분</span></label>
        </div>
      </div>
      <p class="field-hint">오전·오후를 고르고 시는 1~12, 분은 0~59로 적어줘. 낮 12시는 오후 12시, 밤 12시는 오전 12시야.</p>
      <label class="leap-month-option" data-bf-unknownwrap><input type="checkbox" data-bf="unknown"><span>태어난 시간을 몰라요 (시주는 계산하지 않아)</span></label>
      <p class="field-error" data-bf-error="time" role="alert" hidden></p>`;
  }

  function q(root, name) { return root.querySelector(`[data-bf="${name}"]`); }

  function setError(root, field, text, inputs) {
    const box = root.querySelector(`[data-bf-error="${field}"]`);
    box.textContent = text;
    box.hidden = false;
    inputs.forEach((input) => { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", box.id || (box.id = `bf-err-${++counter}`)); });
  }

  function clearErrors(root) {
    root.querySelectorAll("[data-bf-error]").forEach((box) => { box.hidden = true; box.textContent = ""; });
    root.querySelectorAll("[aria-invalid]").forEach((input) => { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); });
  }

  function choose(root, selector, attr, value) {
    root.querySelectorAll(selector).forEach((button) => {
      const selected = button.getAttribute(attr) === value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function mount(container) {
    counter += 1;
    container.innerHTML = template(`bf${counter}`);
    const root = container;
    root.dataset.calendar = "solar";
    root.dataset.period = "am";
    root.querySelectorAll("[data-bf='year'],[data-bf='month'],[data-bf='day'],[data-bf='hour'],[data-bf='minute']").forEach((input) => {
      input.addEventListener("input", () => { input.value = input.value.replace(/[^0-9]/g, ""); });
    });
    root.querySelectorAll("[data-bf-calendar]").forEach((button) => button.addEventListener("click", () => setCalendar(root, button.dataset.bfCalendar)));
    root.querySelectorAll("[data-bf-period]").forEach((button) => button.addEventListener("click", () => {
      root.dataset.period = button.dataset.bfPeriod;
      choose(root, "[data-bf-period]", "data-bf-period", root.dataset.period);
    }));
    q(root, "unknown").addEventListener("change", () => syncUnknown(root));
    ["hour", "minute"].forEach((name) => q(root, name).addEventListener("input", () => {
      if (q(root, "hour").value || q(root, "minute").value) { q(root, "unknown").checked = false; syncUnknown(root); }
    }));
    return root;
  }

  function setCalendar(root, calendar) {
    root.dataset.calendar = calendar;
    choose(root, "[data-bf-calendar]", "data-bf-calendar", calendar);
    const lunar = calendar === "lunar";
    root.querySelector("[data-bf-leapwrap]").hidden = !lunar;
    if (!lunar) q(root, "leap").checked = false;
    root.querySelector("[data-bf-datelabel]").innerHTML = `${lunar ? "음력" : "양력"} 생년월일 <span class="optional-label">숫자로 입력해줘</span>`;
  }

  function syncUnknown(root) {
    const unknown = q(root, "unknown").checked;
    ["hour", "minute"].forEach((name) => {
      const input = q(root, name);
      input.disabled = unknown;
      if (unknown) input.value = "";
    });
    root.querySelectorAll("[data-bf-period]").forEach((button) => { button.disabled = unknown; });
  }

  function reset(root) {
    ["year", "month", "day", "hour", "minute"].forEach((name) => { q(root, name).value = ""; });
    q(root, "leap").checked = false;
    q(root, "unknown").checked = false;
    syncUnknown(root);
    setCalendar(root, "solar");
    root.dataset.period = "am";
    choose(root, "[data-bf-period]", "data-bf-period", "am");
    clearErrors(root);
  }

  function fill(root, input) {
    reset(root);
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate || "");
    if (parts) {
      q(root, "year").value = parts[1];
      q(root, "month").value = String(Number(parts[2]));
      q(root, "day").value = String(Number(parts[3]));
    }
    setCalendar(root, input.calendar === "lunar" ? "lunar" : "solar");
    q(root, "leap").checked = Boolean(input.leapMonth);
    const time = /^(\d{2}):(\d{2})$/.exec(input.birthTime || "");
    if (time) {
      const hour = Number(time[1]);
      root.dataset.period = hour >= 12 ? "pm" : "am";
      choose(root, "[data-bf-period]", "data-bf-period", root.dataset.period);
      q(root, "hour").value = String(hour % 12 === 0 ? 12 : hour % 12);
      q(root, "minute").value = String(Number(time[2]));
    } else if (input.birthDate) {
      q(root, "unknown").checked = true;
      syncUnknown(root);
    }
  }

  // 입력을 검증해 { ok, input } 또는 { ok:false }를 돌려주고, 오류는 해당 입력 근처에 표시하며 첫 오류로 포커스를 옮긴다.
  function read(root) {
    clearErrors(root);
    const year = q(root, "year");
    const month = q(root, "month");
    const day = q(root, "day");
    const hour = q(root, "hour");
    const minute = q(root, "minute");
    let invalid = null;
    const fail = (field, text, inputs) => {
      setError(root, field, text, inputs);
      if (!invalid) invalid = inputs[0];
    };
    const y = Number(year.value);
    const m = Number(month.value);
    const d = Number(day.value);
    if (!year.value || !month.value || !day.value) {
      fail("date", "년·월·일을 모두 숫자로 입력해줘.", [!year.value ? year : !month.value ? month : day]);
    } else if (year.value.length !== 4) {
      fail("date", "태어난 해는 숫자 네 자리로 입력해줘. 예: 1990", [year]);
    } else if (m < 1 || m > 12) {
      fail("date", "월은 1~12 사이로 입력해줘.", [month]);
    } else if (d < 1 || d > 31) {
      fail("date", "일은 1~31 사이로 입력해줘.", [day]);
    }

    let birthTime = "";
    if (!q(root, "unknown").checked) {
      const hasHour = Boolean(hour.value);
      const hasMinute = Boolean(minute.value);
      if (hasHour !== hasMinute) {
        fail("time", "태어난 시간을 적을 때는 시와 분을 함께 입력해줘. 모르면 둘 다 비워도 돼.", [hasHour ? minute : hour]);
      } else if (hasHour) {
        const h = Number(hour.value);
        const min = Number(minute.value);
        if (h < 1 || h > 12) {
          fail("time", "오전·오후를 고른 뒤 시는 1~12 사이로 입력해줘. 15시처럼 24시간 표기는 오후 3시로 바꿔줘.", [hour]);
        } else if (min < 0 || min > 59) {
          fail("time", "분은 0~59 사이로 입력해줘.", [minute]);
        } else {
          birthTime = window.Miki.to24(root.dataset.period, h, min);
        }
      }
    }

    const input = {
      birthDate: `${year.value}-${window.Miki.pad(m)}-${window.Miki.pad(d)}`,
      calendar: root.dataset.calendar,
      leapMonth: q(root, "leap").checked,
      birthTime
    };
    if (!invalid) {
      try {
        window.SajuCore.calculate(input);
      } catch (error) {
        fail("date", error.message || "입력한 생년월일을 확인해줘.", [day]);
      }
    }
    if (invalid) {
      invalid.focus();
      const box = invalid.closest("[data-bf-error]") || root.querySelector("[data-bf-error]:not([hidden])");
      if (box && box.scrollIntoView) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return { ok: false };
    }
    return { ok: true, input };
  }

  window.MikiBirth = Object.freeze({ mount, read, fill, reset, clearErrors });
}());
