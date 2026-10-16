(function () {
  "use strict";

  const resultContent = document.getElementById("result-content");
  const emptyState = document.getElementById("result-empty");
  let saved;
  try {
    saved = window.sessionStorage.getItem("mikiSajuResult");
  } catch (error) {
    emptyState.hidden = false;
    emptyState.querySelector("p").textContent = "이 브라우저에서는 이전 페이지의 입력 정보를 읽을 수 없어. 처음 화면에서 다시 입력해줘.";
    return;
  }
  if (!saved) {
    emptyState.hidden = false;
    return;
  }

  let result;
  try {
    result = JSON.parse(saved);
  } catch (error) {
    window.sessionStorage.removeItem("mikiSajuResult");
    emptyState.hidden = false;
    emptyState.querySelector("p").textContent = "저장된 사주 정보를 읽지 못했어. 다시 입력해줘.";
    return;
  }

  let chart;
  let reading;
  try {
    chart = window.SajuCore.calculate(result);
    reading = window.SajuCore.interpretations(chart);
  } catch (error) {
    emptyState.hidden = false;
    emptyState.querySelector("p").textContent = error instanceof Error
      ? error.message
      : "사주 결과를 계산하지 못했어. 처음 화면에서 정보를 다시 입력해줘.";
    return;
  }

  const title = document.getElementById("result-title");
  title.textContent = `${reading.dayStem.name} 일간인 너의 사주`;
  document.getElementById("result-subtitle").textContent =
    `${reading.dayStem.quality}처럼 타고난 너의 기운을 친구처럼 하나씩 풀어볼게.`;
  document.getElementById("result-birth-date").textContent = formatBirthDate(result, chart);
  document.getElementById("chart-explainer").textContent =
    `위쪽 글자는 하늘의 기운인 천간, 아래쪽 글자는 땅의 기운인 지지야. ${chart.hasTime
      ? "태어난 시간을 포함한 네 기둥을 계산했어."
      : "태어난 시간을 몰라 시주는 비워두었어. 나머지 세 기둥으로 먼저 살펴볼게."}` +
    `${chart.dayChangedAtZi ? " 자시(밤 11시)에 태어난 경우 날짜가 바뀌는 전통 계산법을 적용했어." : ""}`;
  renderPillars(chart, reading);
  renderDayMaster(reading);
  renderElements(chart, reading);
  renderReadings(chart, reading);
  resultContent.hidden = false;

  function formatBirthDate(input, calculated) {
    const date = calculated.solarDate;
    const dateText = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric"
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)));
    const calendarText = input.calendar === "lunar"
      ? `음력${input.leapMonth ? " 윤달" : ""} 입력 · 양력 ${dateText}`
      : `양력 ${dateText}`;
    return `${calendarText}${input.birthTime ? ` · ${input.birthTime}` : " · 태어난 시간 미상"}`;
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderPillars(calculated, interpretation) {
    const container = document.getElementById("result-pillars");
    calculated.pillars.forEach(({ label, pillar }) => {
      const column = makeElement("article", "result-pillar");
      column.append(makeElement("span", "result-pillar-label", label));
      column.append(makeElement("span", `pillar-ganzhi ${pillar.stem.element}`, pillar.stem.hanja + pillar.branch.hanja));
      column.append(makeElement("span", "pillar-korean-reading", `(${pillar.stem.name}${pillar.branch.name})`));
      column.append(makeElement("span", "pillar-animal", `${pillar.branch.animal}띠`));
      const relation = interpretation.tenGods.find((item) => item.label === label);
      if (relation) column.append(makeElement("span", "pillar-relation", relation.relation));
      container.append(column);
    });
    if (!calculated.hasTime) {
      const column = makeElement("article", "result-pillar result-pillar-unknown");
      column.append(makeElement("span", "result-pillar-label", "시주"));
      column.append(makeElement("span", "unknown-pillar-mark", "미상"));
      column.append(makeElement("span", "pillar-animal", "시간 미입력"));
      container.append(column);
    }
  }

  function renderDayMaster(interpretation) {
    const card = document.getElementById("day-master-card");
    card.append(makeElement("span", "mini-kicker", "사주의 중심이 되는 나"));
    card.append(makeElement("h2", "", `너는 ${interpretation.dayStem.name} 일간이야`));
    card.append(makeElement("p", "day-master-quality", `${interpretation.dayStem.polarity}의 ${interpretation.dayStem.element} · ${interpretation.dayStem.quality}`));
    card.append(makeElement("p", "day-master-description", interpretation.dayStem.description));
  }

  function renderElements(calculated, interpretation) {
    const container = document.getElementById("result-elements");
    const total = calculated.pillars.length * 2;
    const summary = makeElement("p", "element-summary", interpretation.balance);
    container.append(summary);
    const list = makeElement("div", "result-element-list");
    window.SajuCore.elements.forEach((element) => {
      const count = calculated.counts[element];
      const row = makeElement("div", `result-element-row ${element}`);
      row.append(makeElement("span", "result-element-name", element));
      const track = makeElement("span", "element-track");
      const bar = makeElement("span", "element-bar");
      bar.style.width = `${(count / total) * 100}%`;
      track.append(bar);
      row.append(track);
      row.append(makeElement("span", "result-element-count", `${count} / ${total}`));
      list.append(row);
    });
    container.append(list);
    container.append(makeElement("p", "element-method-note",
      `천간과 지지에 겉으로 드러난 오행을 세어본 참고용 분포야. 지지 안에 숨은 기운과 계절의 힘까지 더한 정밀한 강약 점수는 아니야. 태어난 시간 미입력으로 시주가 빠지면 ${total}글자 기준으로 보여줘.`));
  }

  function renderReadings(calculated, interpretation) {
    const container = document.getElementById("reading-grid");
    calculated.pillars.forEach(({ key, label, focus, pillar }) => {
      const card = makeElement("article", "reading-card");
      card.append(makeElement("span", "reading-kicker", focus));
      const title = makeElement("h3", "reading-pillar-title");
      title.append(makeElement("span", "", `${label} · ${pillar.stem.hanja}${pillar.branch.hanja}`));
      title.append(makeElement("span", "reading-korean-reading", `(${pillar.stem.name}${pillar.branch.name})`));
      card.append(title);
      card.append(makeElement("p", "reading-pillars",
        `${pillar.stem.hanja}(${pillar.stem.name}·${pillar.stem.element}·${pillar.stem.polarity}) 위에 ${pillar.branch.hanja}(${pillar.branch.name}·${pillar.branch.animal}·${pillar.branch.element})가 놓인 기둥이야. 이 기둥은 ${pillar.stem.element}과 ${pillar.branch.element}의 기운을 함께 품고 있어.`));
      card.append(makeElement("p", "", interpretation.pillarTexts[key]));
      const god = interpretation.tenGods.find((item) => item.label === label);
      if (god && key !== "day") {
        card.append(makeElement("p", "reading-relation",
          `일간인 너를 기준으로 이 기둥의 천간은 ‘${god.relation}’의 관계야. 이는 전통 명리에서 역할을 설명하는 이름이지, 사람의 성격을 단정하는 꼬리표는 아니야.`));
      }
      container.append(card);
    });

    const elementCard = makeElement("article", "reading-card reading-card-wide");
    elementCard.append(makeElement("span", "reading-kicker", "다섯 기운을 실제 생활에 연결해 보기"));
    elementCard.append(makeElement("h3", "", "오행은 좋고 나쁜 점수가 아니야"));
    interpretation.elementTexts.forEach((text, index) => {
      elementCard.append(makeElement("p", `element-story ${window.SajuCore.elements[index]}`, text));
    });
    container.append(elementCard);

    const lifeCards = [
      ["관계와 마음", interpretation.relationship],
      ["일과 배움", interpretation.work],
      ["돈과 현실 감각", interpretation.money],
      ["쉬어가는 방법", interpretation.wellbeing],
      ["친구가 건네는 한마디", interpretation.advice]
    ];
    lifeCards.forEach(([heading, text]) => {
      const card = makeElement("article", "reading-card");
      card.append(makeElement("span", "reading-kicker", "너의 기운을 생활에 비춰보면"));
      card.append(makeElement("h3", "", heading));
      card.append(makeElement("p", "", text));
      container.append(card);
    });
  }
}());
