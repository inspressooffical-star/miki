(function () {
  "use strict";

  const page = document.querySelector("[data-service-page]");
  if (!page) return;

  const service = page.dataset.servicePage;
  const empty = document.getElementById("service-empty");
  const content = document.getElementById("service-personalized");
  let saved;
  try {
    saved = window.sessionStorage.getItem("mikiSajuResult");
  } catch (error) {
    empty.querySelector("p").textContent = "이 브라우저에서는 입력 정보를 읽을 수 없어. 처음 화면으로 돌아가 다시 입력해줘.";
    return;
  }
  if (!saved) return;

  let chart;
  let reading;
  let input;
  try {
    input = JSON.parse(saved);
    chart = window.SajuCore.calculate(input);
    reading = window.SajuCore.interpretations(chart);
  } catch (error) {
    empty.querySelector("p").textContent = error instanceof Error
      ? error.message
      : "입력 정보를 읽지 못했어. 처음 화면에서 다시 입력해줘.";
    return;
  }

  const heading = document.getElementById("service-year-title");
  const description = document.getElementById("service-year-copy");
  if (service === "tojeong") renderTojeong();
  if (service === "year") renderYear();
  if (service === "sal") renderSal();
  if (service === "classic") renderClassic();
  empty.hidden = true;
  content.hidden = false;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function appendCard(container, kicker, title, text, className) {
    const card = make("article", `service-topic-card${className ? ` ${className}` : ""}`);
    card.append(make("span", "reading-kicker", kicker));
    card.append(make("h3", "", title));
    card.append(make("p", "", text));
    container.append(card);
    return card;
  }

  function renderTojeong() {
    const annual = window.SajuCore.annualPillar();
    const annualLabel = `${annual.stem.hanja}${annual.branch.hanja} (${annual.stem.name}${annual.branch.name})년`;
    heading.textContent = `${annual.year}년 ${annualLabel}, 네 한 해를 살펴볼게`;
    description.textContent =
      `${reading.dayStem.name} 일간인 너는 ${reading.dayStem.quality} 같은 기운을 갖고 있어. ${annualElementSentence(annual)} 한 번에 큰 결론을 내리기보다, 네 리듬을 살피며 달마다 작은 선택을 쌓아가면 좋아.`;

    const monthNotes = [
      ["새 계획을 정리하기", "올해 하고 싶은 일을 작게 나눠 적어봐. 계획을 현실적인 순서로 놓으면 첫걸음이 쉬워져."],
      ["사람들과 뜻을 나누기", "혼자 생각한 일을 믿을 만한 사람과 나눠봐. 다른 관점이 네 계획을 더 단단하게 다듬어줄 수 있어."],
      ["속도를 조절하기", "바쁘게 달려왔다면 잠깐 정리할 때야. 할 일의 우선순위를 고르면 마음도 덜 복잡해져."],
      ["표현하고 움직이기", "준비해 둔 생각을 작은 행동으로 옮겨봐. 완벽한 순간을 기다리기보다 부담 없는 시도부터 해도 충분해."],
      ["약속과 관계 챙기기", "고마운 마음이나 미안한 마음을 말로 전해봐. 따뜻한 대화 하나가 다음 기회의 시작이 될 수 있어."],
      ["기본기를 다지기", "새로운 일을 늘리기보다 지금 하는 일을 차분히 마무리해봐. 꾸준함이 네 실력을 보여주는 시기가 될 거야."],
      ["배운 것을 넓히기", "관심 있는 주제를 한 단계 더 깊게 배워봐. 작은 공부와 기록이 생각보다 오래 가는 자산이 돼."],
      ["정리하고 선택하기", "모든 기회를 다 잡으려 하지 않아도 괜찮아. 지금의 너에게 중요한 한두 가지를 고르면 힘이 모여."],
      ["결과를 돌아보기", "지금까지 쌓아온 일을 확인하고 스스로를 칭찬해줘. 부족한 점은 자책보다 다음 계획을 위한 정보로 쓰면 돼."],
      ["새로운 관점 받아들이기", "익숙한 방법이 잘 풀리지 않는다면 다른 방식을 가볍게 시험해봐. 작은 변화가 답답함을 풀어줄 수 있어."],
      ["마음을 나누기", "주변의 도움을 받거나 먼저 손을 내밀어봐. 혼자 짊어지던 일을 나누면 더 좋은 방법이 보일 수 있어."],
      ["한 해를 잘 마무리하기", "올해 해낸 일과 배운 점을 적어봐. 잘된 일도 힘들었던 일도 다음 해의 너를 돕는 경험이야."]
    ];
    const monthElements = ["목", "목", "토", "화", "화", "토", "금", "금", "토", "수", "수", "토"];
    const monthGrid = document.getElementById("service-month-grid");
    monthNotes.forEach(([title, text], index) => {
      const element = monthElements[index];
      const seasonalNote = reading.dayStem.element === element
        ? "너의 중심 기운과 닮은 달이야. 익숙한 장점을 살리되 무리하지 않게 쉬어가."
        : `${element} 기운이 두드러지는 달이야. ${window.SajuCore.elementNames[element].meaning.split(",")[0]}을 의식하며 균형을 잡아봐.`;
      appendCard(monthGrid, `음력 ${index + 1}월 · ${element} 기운`, title, `${text} ${seasonalNote}`);
    });
  }

  function renderYear() {
    const annual = window.SajuCore.annualPillar();
    const annualName = `${annual.stem.hanja}${annual.branch.hanja}`;
    heading.textContent = `${annual.year}년의 기운은 ${annualName}년이야`;
    description.textContent =
      `${annual.year}년의 천간은 ${annual.stem.hanja}(${annual.stem.name}), 지지는 ${annual.branch.hanja}(${annual.branch.name})야. ${annualElementSentence(annual)} ${reading.dayStem.name} 일간인 네 명식과 함께 읽어볼게.`;
    const cards = document.getElementById("service-topic-grid");
    const element = annual.stem.element;
    appendCard(cards, "올해의 나", "내 중심을 지키기",
      `${reading.dayStem.description} 올해는 여기에 ${window.SajuCore.elementNames[element].meaning.split(",")[0]}의 분위기가 더해져. 주변 흐름에 휩쓸리기보다 네 기준을 먼저 확인해봐.`);
    appendCard(cards, "일과 배움", "꾸준히 쌓은 실력 보여주기",
      `${reading.work} 올해는 특히 목표를 작게 나누고 결과를 기록해두면 네 노력이 더 잘 보여.`);
    appendCard(cards, "사람과 관계", "분명하고 다정하게 말하기",
      `${reading.relationship} 중요한 이야기는 마음속으로만 짐작하지 말고 서로 편한 때에 차분히 나눠봐.`);
    appendCard(cards, "돈과 계획", "현실적인 기준 세우기",
      `${reading.money} 한 해의 분위기만 믿고 큰 결정을 하기보다, 감당 가능한 예산과 시간을 먼저 살펴보자.`);
    const advice = document.getElementById("service-advice-list");
    advice.append(make("p", "service-advice-line",
      `${annual.year}년의 간지는 ${annualName}(${annual.stem.name}${annual.branch.name})야. ${annualElementSentence(annual)} 사주의 흐름은 정답이나 예약된 미래가 아니라, 네가 어떤 선택을 할지 돌아보는 하나의 관점으로 써줘.`));
  }

  function renderSal() {
    const signs = window.SajuCore.salSigns(chart);
    heading.textContent = `${reading.dayStem.name} 일간인 네 명식의 상징`;
    description.textContent =
      "전통에서 ‘살’이라고 부른 기운을 겁주는 말로 쓰지 않을게. 명식에 보이는 상징을 성향과 생활 속 선택으로 편안하게 풀어볼게.";
    const grid = document.getElementById("sal-sign-grid");
    signs.forEach((sign) => {
      const status = sign.present
        ? `${sign.foundAt.join("·")}에 ${sign.branch.hanja}(${sign.branch.name})가 보여`
        : `년지와 일지를 기준으로 살펴본 ${sign.branches.map((branch) => `${branch.hanja}(${branch.name})`).join(" 또는 ")} 글자는 명식의 겉글자에 보이지 않아`;
      const card = appendCard(grid, sign.present ? "명식에서 살펴볼 수 있어" : "겉으로 드러난 글자 기준",
        sign.name, `${status}. ${sign.description}`, sign.present ? "sal-present" : "sal-quiet");
      card.append(make("span", "sal-symbol", sign.present
        ? `${sign.branch.hanja} · ${sign.branch.name}`
        : sign.branches.map((branch) => `${branch.hanja} · ${branch.name}`).join(" / ")));
    });
  }

  function renderClassic() {
    document.getElementById("service-birth-date").textContent = formatBirthDate();
    const pillarContainer = document.getElementById("service-pillars");
    chart.pillars.forEach(({ label, pillar }) => {
      const card = make("article", "result-pillar");
      card.append(make("span", "result-pillar-label", label));
      card.append(make("span", `pillar-ganzhi ${pillar.stem.element}`, `${pillar.stem.hanja}${pillar.branch.hanja}`));
      card.append(make("span", "pillar-korean-reading", `(${pillar.stem.name}${pillar.branch.name})`));
      card.append(make("span", "pillar-animal", `${pillar.branch.animal}띠`));
      pillarContainer.append(card);
    });
    if (!chart.hasTime) {
      const card = make("article", "result-pillar result-pillar-unknown");
      card.append(make("span", "result-pillar-label", "시주"));
      card.append(make("span", "unknown-pillar-mark", "미상"));
      card.append(make("span", "pillar-animal", "시간 미입력"));
      pillarContainer.append(card);
    }
    document.getElementById("service-chart-explainer").textContent =
      chart.hasTime
        ? "각 기둥의 위에는 하늘의 기운인 천간, 아래에는 땅의 기운인 지지가 있어. 네 기둥이 서로 어떤 기운을 주고받는지 차근차근 읽어보면 돼."
        : "태어난 시간을 모르면 시주는 알 수 없어. 비워둔 상태로 연주·월주·일주 세 기둥을 살펴봤고, 시간을 억지로 추측하지 않았어.";
    heading.textContent = `너의 중심에는 ${reading.dayStem.hanja}(${reading.dayStem.name})의 기운이 있어`;
    description.textContent = reading.dayStem.description;
    renderElements(document.getElementById("service-elements"));
    const cards = document.getElementById("service-topic-grid");
    appendCard(cards, "관계와 마음", "가까운 사이에서의 너", reading.relationship);
    appendCard(cards, "일과 배움", "잘하는 일을 키우는 법", reading.work);
    appendCard(cards, "돈과 현실 감각", "계획을 세우는 방식", reading.money);
    appendCard(cards, "생활 속 균형", "너에게 맞는 쉬어가기", reading.wellbeing);
  }

  function renderElements(container) {
    const total = chart.pillars.length * 2;
    const summary = make("p", "element-summary", reading.balance);
    container.append(summary);
    const list = make("div", "result-element-list");
    window.SajuCore.elements.forEach((element) => {
      const row = make("div", `result-element-row ${element}`);
      row.append(make("span", "result-element-name", element));
      const track = make("span", "element-track");
      const bar = make("span", "element-bar");
      bar.style.width = `${(chart.counts[element] / total) * 100}%`;
      track.append(bar);
      row.append(track);
      row.append(make("span", "result-element-count", `${chart.counts[element]} / ${total}`));
      list.append(row);
    });
    container.append(list);
    container.append(make("p", "element-method-note",
      "천간과 지지에 겉으로 드러난 글자만 센 분포라서, 지지 안에 숨은 기운이나 계절의 힘까지 계산한 점수는 아니야."));
  }

  function annualElementSentence(annual) {
    const stemElement = annual.stem.element;
    const branchElement = annual.branch.element;
    return stemElement === branchElement
      ? `올해는 ${stemElement} 기운이 함께 두드러져.`
      : `올해는 ${stemElement}·${branchElement} 기운이 함께해.`;
  }

  function formatBirthDate() {
    const date = chart.solarDate;
    const dateText = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric"
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)));
    const calendarText = input.calendar === "lunar"
      ? `음력${input.leapMonth ? " 윤달" : ""} 입력 · 양력 ${dateText}`
      : `양력 ${dateText}`;
    return `${calendarText}${chart.birthTime ? ` · ${chart.birthTime}` : " · 태어난 시간 미상"}`;
  }
}());
