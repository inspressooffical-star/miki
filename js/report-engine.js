(function (root) {
  "use strict";

  // 계산된 명식(SajuCore/SajuAnalysis)과 문장 라이브러리(MikiLib)를 조합해 서비스별 장문 보고서를 만든다.
  // 용신·계산하지 않은 운은 만들지 않고, 출생 시간이 없으면 시주를 채우지 않는다.
  const core = root.SajuCore;
  const An = root.SajuAnalysis;
  const lib = () => root.MikiLib || {};

  const GROUPS = { 비겁: ["비견", "겁재"], 식상: ["식신", "상관"], 재성: ["편재", "정재"], 관성: ["편관", "정관"], 인성: ["편인", "정인"] };
  const GROUP_NOTE = {
    비겁: "나와 같은 결의 힘, 곧 자립심·경쟁·동료", 식상: "내가 밖으로 내놓는 힘, 곧 표현·재능·실행",
    재성: "현실을 다루는 힘, 곧 돈·결과·관리", 관성: "나를 규율하는 힘, 곧 책임·조직·평가", 인성: "나를 채우는 힘, 곧 배움·보호·이해"
  };
  const STATE_LABEL = { lack: "드러난 글자에 없음", low: "적은 편", balanced: "고른 편", high: "많은 편", excess: "매우 많은 편" };
  const STRENGTH_LABEL = { strong: "일간을 돕는 기운이 두터운 편", balanced: "일간을 돕는 기운이 고른 편", light: "일간을 돕는 기운이 가벼운 편" };
  const POS_LABEL = { year: "년주", month: "월주", day: "일주", hour: "시주" };
  const GOD_GROUP = {};
  Object.keys(GROUPS).forEach((g) => GROUPS[g].forEach((god) => { GOD_GROUP[god] = g; }));
  const ELS = ["목", "화", "토", "금", "수"];
  const SHENG = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  const KE = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };

  const pick = (obj, ...path) => path.reduce((value, key) => (value == null ? undefined : value[key]), obj);
  const H = (text) => ({ t: "h", text });
  const P = (text) => ({ t: "p", text });
  const E = (text) => ({ t: "ev", text });
  const UL = (items) => ({ t: "ul", items });
  const clean = (blocks) => blocks.filter((block) => block && (block.items ? block.items.length : block.text));

  // 같은 문단이 한 보고서에 두 번 나오지 않게 한다.
  function createSink() {
    const seen = new Set();
    return {
      add(list, text) {
        if (!text || seen.has(text)) return;
        seen.add(text);
        list.push(P(text));
      }
    };
  }

  const pillarName = (pillar) => `${pillar.stem.name}${pillar.branch.name}`;
  const pillarHanja = (pillar) => `${pillar.stem.hanja}${pillar.branch.hanja}`;
  const joinKo = (items) => items.join(", ");
  const fmtDate = (value) => {
    const d = new Date(new Date(value).getTime() + 9 * 3600000);
    return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
  };
  const genderText = (gender) => (gender === "female" ? "여성" : gender === "male" ? "남성" : "성별 선택 안 함");

  function context(input, options) {
    const chart = core.calculate(input);
    const gender = options.gender || "undisclosed";
    const analysis = An.analyze(chart, { gender });
    const L = lib();
    const dayStem = analysis.dayStem;
    const dayPos = analysis.byKey.day;
    const monthPos = analysis.byKey.month;
    const state = analysis.elementStates;
    const sortedEls = analysis.rankedElements;
    const topGods = analysis.rankedGods.filter((god) => analysis.godWeight[god] > 0);
    return { chart, analysis, gender, L, dayStem, dayPos, monthPos, state, sortedEls, topGods, name: options.name || "", now: options.now || new Date(), sink: createSink() };
  }

  const stemLib = (c) => pick(c.L, "stem", c.dayStem.name) || {};
  const godLib = (c, god) => pick(c.L, "tenGod", god) || {};
  const relationLibKey = (rel) => {
    if (rel.scope === "stem") return rel.type === "hap" ? "stemHap" : "stemChung";
    if (rel.type === "hap") return "branchHap";
    if (rel.type === "chung") return "branchChung";
    return rel.type;
  };

  function describeRelation(c, rel, list, seenKeys) {
    const mapKey = relationLibKey(rel);
    const text = pick(c.L, "relation", mapKey, rel.key);
    const place = pick(c.L, "relation", "position", rel.type === "hap" ? "hap" : rel.type, rel.place);
    const label = `${rel.place} ${rel.scope === "stem" ? "천간" : "지지"} ${rel.glyphs} · ${rel.key} ${{ hap: "합", chung: "충", hyung: "형", pa: "파", hae: "해" }[rel.type]}`;
    list.push(H(label));
    list.push(E(`근거: ${rel.a.label}의 ${rel.scope === "stem" ? rel.a.pillar.stem.name : rel.a.pillar.branch.name}과(와) ${rel.b.label}의 ${rel.scope === "stem" ? rel.b.pillar.stem.name : rel.b.pillar.branch.name}이(가) 만나는 관계야.`));
    c.sink.add(list, text);
    if (!seenKeys.has(`${rel.type}:${rel.place}`)) { c.sink.add(list, place); seenKeys.add(`${rel.type}:${rel.place}`); }
  }

  function limitsBlock(c, extra) {
    const list = [];
    list.push(`이 보고서는 한국 표준시(UTC+9)와 절기를 기준으로 계산한 명식에 전통 명리의 상징을 연결한 읽을거리야. 계산 결과를 한국천문연구원의 공식 만세력과 별도로 대조한 것은 아니고, 같은 방식의 오픈소스 계산과 맞춰본 수준이야. 출생지 경도나 서머타임 보정은 하지 않았어.`);
    list.push("해석은 학파에 따라 달라지고, 미래를 확정하거나 건강·투자·사고 같은 일을 예측하지 않아. 중요한 결정은 현실의 정보와 전문가의 도움을 함께 살펴봐.");
    if (!c.chart.hasTime) list.push("태어난 시간을 입력하지 않아서 시주는 만들지 않았어. 시간에 따라 달라지는 해석은 이 보고서에서 빠져 있어.");
    if (c.chart.termBoundary) list.push(`태어난 날에 ${c.chart.termBoundary.name} 절기가 들어오는 시각(${String(c.chart.termBoundary.hour).padStart(2, "0")}:${String(c.chart.termBoundary.minute).padStart(2, "0")} 무렵)이 있어서, 태어난 시간에 따라 월주${c.chart.termBoundary.isLiChun ? "와 연주" : ""}가 달라질 수 있어. 정확한 시간을 알면 다시 확인해줘.`);
    (extra || []).forEach((line) => list.push(line));
    return list;
  }

  /* ---------- 공통 요약 ---------- */
  function chartSummary(c) {
    const a = c.analysis;
    const names = a.positions.map((p) => `${p.label} ${pillarName(p.pillar)}(${pillarHanja(p.pillar)})`);
    const top = a.rankedGroups[0];
    const lines = [
      `명식: ${joinKo(names)}${c.chart.hasTime ? "" : " · 시주는 시간 미상이라 제외"}`,
      `일간 ${c.dayStem.name}(${c.dayStem.hanja}) — ${c.dayStem.element}의 ${c.dayStem.polarity} 기운, “${c.dayStem.quality}”의 이미지로 읽어.`,
      `월령: ${c.monthPos.pillar.branch.name}월(${core.jieNames[c.chart.monthTerm.index / 2]} 절기월) · 일간과의 관계는 ${a.monthRoot === "same" ? "같은 오행이 받쳐주는 편" : a.monthRoot === "support" ? "일간을 돕는 오행의 계절" : "일간과 결이 다른 계절"}이야.`,
      `오행 분포: ${ELS.map((el) => `${el} ${a.elementCount[el]}`).join(" · ")} (${ELS.filter((el) => c.state[el] === "lack" || c.state[el] === "low").map((el) => el + " 적음").join(", ") || "뚜렷하게 비는 오행 없음"})`,
      `강약 참고: ${STRENGTH_LABEL[a.strength]} (돕는 기운 비중 약 ${Math.round(a.supportShare * 100)}%). 좋고 나쁨이 아니라 참고 경향이야.`,
      `눈에 띄는 십성 묶음: ${top}${a.rankedGroups[1] ? `, 다음으로 ${a.rankedGroups[1]}` : ""}${a.missingGroups.length ? ` · 드러나지 않은 묶음: ${a.missingGroups.join(", ")}` : ""}`
    ];
    return lines;
  }

  /* ---------- 정통 사주 ---------- */
  function buildClassic(input, options) {
    const c = context(input, options);
    const { analysis: a, L } = c;
    const S = stemLib(c);
    const sections = [];
    const add = (id, title, core_, blocks) => sections.push({ id, title, core: core_, blocks: clean(blocks) });
    const monthBranch = c.monthPos.pillar.branch.name;
    const monthLib = pick(L, "month", monthBranch) || {};
    const dayBranch = c.dayPos.pillar.branch.name;
    const topEl = c.sortedEls[0];
    const weakEls = ELS.filter((el) => c.state[el] === "lack" || c.state[el] === "low");
    const strongEls = ELS.filter((el) => c.state[el] === "high" || c.state[el] === "excess");

    // 1 종합
    {
      const b = [];
      b.push(H("이 보고서를 읽는 방법"));
      b.push(P("사주는 태어난 시각을 연·월·일·시 네 기둥, 여덟 글자로 바꿔 놓고 그 글자들의 관계를 읽는 전통 해석이야. 이 보고서는 한 글자만 떼어 말하지 않고, 일간(나를 대표하는 글자), 월령(태어난 계절), 오행의 분포, 십성(나와 다른 글자의 관계), 합·충 같은 글자끼리의 관계를 차례로 겹쳐서 읽어. 그래서 같은 일간이어도 나머지 글자가 다르면 설명이 달라져."));
      b.push(P("각 항목에는 ‘근거’ 줄을 달아서 어떤 글자나 계산 결과에서 그 해석이 나왔는지 보여줄게. 그리고 예시는 실제 네 과거를 맞히려는 게 아니라 ‘이런 모습으로 나타날 수 있어’ 하는 가능성의 그림이야. 읽다가 안 맞는 부분은 가볍게 넘겨도 괜찮아."));
      b.push(H("핵심 구조"));
      b.push(E(`근거: 일간 ${c.dayStem.name}(${c.dayStem.element}), 월지 ${monthBranch}, ${STRENGTH_LABEL[a.strength]}, 오행 가운데 가장 두드러지는 건 ${topEl}.`));
      c.sink.add(b, S.core);
      c.sink.add(b, monthLib.season);
      b.push(P(`네 구조를 한 줄로 줄이면, ${c.dayStem.element}의 ${c.dayStem.polarity} 기운을 가진 사람이 ${monthBranch}월이라는 계절에 태어났고, ${strongEls.length ? `${joinKo(strongEls)} 기운이 두드러지며` : "두드러지게 쏠린 오행은 없고"} ${weakEls.length ? `${joinKo(weakEls)} 기운은 상대적으로 얇은` : "다섯 오행이 비교적 고르게 보이는"} 명식이야. 십성으로는 ${a.rankedGroups[0]}— ${GROUP_NOTE[a.rankedGroups[0]]} — 이 가장 크게 잡혀서, 이 흐름이 아래 모든 항목의 바탕에 깔려 있어.`));
      const top2 = c.topGods.slice(0, 2);
      top2.forEach((god) => c.sink.add(b, godLib(c, god).meaning));
      c.sink.add(b, godLib(c, c.topGods[0]).balanced);
      b.push(H("계산에서 알아둘 점"));
      limitsBlock(c).forEach((t) => c.sink.add(b, t));
      add("overview", "전체 명식의 핵심 구조와 종합 해석", true, b);
    }

    // 2 네 기둥
    {
      const b = [];
      b.push(P("네 기둥은 인생의 시기와 영역을 나눠 보는 틀이야. 년주는 뿌리와 어린 시절의 환경, 월주는 사회와 일의 무대, 일주는 나 자신과 가장 가까운 관계, 시주는 말년과 내면의 방향으로 읽어. 다만 이런 배치는 상징적인 읽기 틀일 뿐 어떤 일이 꼭 그 시기에 일어난다는 뜻은 아니야."));
      a.positions.forEach((pos) => {
        const p = pos.pillar;
        b.push(H(`${pos.label} ${pillarName(p)} (${pillarHanja(p)})`));
        const hiddenText = pos.hidden.map((h) => `${h.stem.name}(${h.role}·${h.god})`).join(", ");
        b.push(E(`근거: 천간 ${p.stem.name}은 일간에서 보면 ${pos.key === "day" ? "나 자신" : pos.stemGod}, 지지 ${p.branch.name}(${p.branch.animal})의 중심 글자는 ${pos.branchGod}, 지장간은 ${hiddenText}.`));
        c.sink.add(b, pick(L, "tenGod", pos.key === "day" ? pos.branchGod : pos.stemGod, "pillar", pos.key));
        if (pos.key === "year") c.sink.add(b, pick(L, "branch", p.branch.name, "asYear"));
        if (pos.key === "month") { c.sink.add(b, monthLib.lifeStyle); }
        if (pos.key === "day") c.sink.add(b, pick(L, "branch", p.branch.name, "asDay"));
        if (pos.key === "hour") c.sink.add(b, pick(L, "branch", p.branch.name, "asHour"));
        c.sink.add(b, pick(L, "branch", p.branch.name, "image"));
        c.sink.add(b, pick(L, "branch", p.branch.name, "hiddenNote"));
      });
      if (!c.chart.hasTime) {
        b.push(H("시주는 계산하지 않았어"));
        b.push(P("태어난 시간을 모르면 시주를 추정해서 채우지 않아. 시주는 말년의 방향, 자식 운이라 불리는 영역, 내면의 바람 같은 부분을 읽는 데 쓰이는데, 이 부분은 시간을 알게 되면 보고서가 더 풍부해질 수 있어. 지금은 년·월·일 세 기둥만으로 읽은 결과야."));
      }
      b.push(H("기둥들이 서로 이어지는 방식"));
      const stemLine = a.positions.map((p) => `${p.label} ${p.pillar.stem.name}(${p.pillar.stem.element})`).join(" → ");
      b.push(E(`근거: 천간의 오행 흐름 ${stemLine}.`));
      b.push(P(`천간만 이어서 보면 ${stemLine}의 순서로 기운이 놓여 있어. 가까운 기둥끼리 서로 돕는 오행인지(상생), 부딪히는 오행인지(상극)에 따라 시기별 분위기가 매끄럽게 이어지거나 전환이 두드러질 수 있어. 구체적인 합·충 관계는 뒤쪽 항목에서 따로 풀어.`));
      add("pillars", "년주·월주·일주·시주의 의미와 관계", true, b);
    }

    // 3 월령
    {
      const b = [];
      b.push(E(`근거: 월지 ${monthBranch}(${c.monthPos.pillar.branch.element}), 일간 ${c.dayStem.name}(${c.dayStem.element}), 월령과의 관계 “${a.monthRoot === "same" ? "같은 오행" : a.monthRoot === "support" ? "돕는 오행" : "결이 다른 오행"}”.`));
      c.sink.add(b, monthLib.season);
      c.sink.add(b, pick(monthLib, "byElement", c.dayStem.element));
      const lead = a.monthRoot === "same"
        ? `일간과 같은 오행이 월지에 깔려 있어서, 전통 용어로는 일간이 계절의 힘을 얻은(득령) 모습으로 읽어. 그만큼 내 방식이 뚜렷하고 버티는 힘이 있다는 쪽으로 해석할 수 있지만, 뚝심이 고집으로 보이는 순간도 있을 수 있어.`
        : a.monthRoot === "support"
          ? `월지가 일간을 돕는 오행이라, 계절이 나를 받쳐주는 쪽으로 읽을 수 있어. 도움을 받는 힘이 있는 만큼 사람과 환경을 통해 성장하는 모습이 나타날 수 있어.`
          : `월지의 오행이 일간과 결이 달라서, 계절의 기운이 나를 곧바로 받쳐주기보다는 환경에 맞춰 나를 조율하는 쪽으로 읽을 수 있어. 이건 약점이 아니라 환경에 적응하며 힘을 만드는 방식이라고 이해하면 돼.`;
      b.push(P(lead));
      c.sink.add(b, monthLib.rhythm);
      ELS.filter((el) => el !== c.dayStem.element).slice(0, 5).forEach((el) => {
        if (c.state[el] === "excess" || c.state[el] === "high") c.sink.add(b, pick(monthLib, "byElement", el));
      });
      b.push(H("월령을 읽을 때 조심할 점"));
      b.push(P("월령은 사주 전체에서 비중이 큰 기준이지만, 월령 하나가 성격이나 운을 결정하지는 않아. 일지와 시지, 천간에 같은 오행이 얼마나 더 있는지, 합과 충으로 기운이 바뀌는지도 함께 보아야 해서 강약 표시는 어디까지나 참고 경향으로만 받아들여줘."));
      add("season", "일간과 월령, 계절의 영향", false, b);
    }

    // 4 오행
    {
      const b = [];
      b.push(E(`근거: 겉으로 드러난 글자 기준 ${ELS.map((el) => `${el} ${a.elementCount[el]}`).join(", ")}. 지장간까지 가중하면 ${a.rankedElements.map((el) => `${el} ${a.elementWeight[el].toFixed(1)}`).join(", ")}.`));
      b.push(P("오행은 목·화·토·금·수 다섯 기운의 균형을 보는 틀이야. 숫자가 많다고 좋고 적다고 나쁜 게 아니라, 한쪽으로 쏠렸을 때 일상에서 어떻게 나타나는지, 적은 기운은 어떻게 보충할 수 있는지를 살펴보는 용도야."));
      ELS.forEach((el) => {
        b.push(H(`${el} — ${a.elementCount[el]}개, ${STATE_LABEL[c.state[el]]}`));
        c.sink.add(b, pick(L, "element", el, c.state[el]));
      });
      b.push(H("오행끼리 만드는 흐름"));
      ELS.forEach((el) => {
        const gen = SHENG[el];
        const inv = c.state[el] !== "balanced" || c.state[gen] !== "balanced";
        if (inv) c.sink.add(b, pick(L, "flow", "sheng", el + gen));
        const target = KE[el];
        if ((c.state[el] === "excess" || c.state[el] === "high") && (c.state[target] === "lack" || c.state[target] === "low")) c.sink.add(b, pick(L, "flow", "ke", el + target));
      });
      c.sink.add(b, pick(L, "flow", "same", topEl));
      c.sink.add(b, pick(L, "element", topEl, "daily"));
      weakEls.slice(0, 2).forEach((el) => c.sink.add(b, pick(L, "element", el, "daily")));
      b.push(H("오행 분석의 한계"));
      b.push(P("오행 개수는 겉으로 드러난 여덟 글자(시간이 없으면 여섯 글자)를 센 값이고, 지장간까지 반영한 가중치는 별도로 참고해. 오행이 하나도 없다고 해서 그 영역이 비어 있다는 뜻은 아니야. 지장간에 숨어 있을 수 있고, 환경과 노력으로 보충할 수도 있어."));
      add("elements", "오행의 분포·상호작용과 해석상 한계", true, b);
    }

    // 5 십성·지장간
    {
      const b = [];
      b.push(E(`근거: 십성 가중치 ${c.topGods.slice(0, 5).map((god) => `${god} ${a.godWeight[god].toFixed(1)}`).join(", ")}. 묶음별 ${Object.keys(GROUPS).map((g) => `${g} ${a.groupWeight[g].toFixed(1)}`).join(", ")}.`));
      b.push(P("십성은 일간을 기준으로 다른 글자가 나와 어떤 관계인지를 열 가지 이름으로 부르는 방식이야. 비견·겁재(나와 같은 결), 식신·상관(내가 내놓는 것), 편재·정재(내가 다루는 것), 편관·정관(나를 다스리는 것), 편인·정인(나를 돕는 것)으로 묶어 읽어."));
      c.topGods.slice(0, 5).forEach((god) => {
        const g = godLib(c, god);
        b.push(H(`${god} (${GOD_GROUP[god]}) — 가중치 ${a.godWeight[god].toFixed(1)}`));
        c.sink.add(b, g.meaning);
        c.sink.add(b, GOD_GROUP[god] === a.rankedGroups[0] || a.groupWeight[GOD_GROUP[god]] >= 2.5 ? g.whenStrong : g.balanced);
        c.sink.add(b, g.hidden);
      });
      const missing = a.missingGroups.length ? a.missingGroups : [];
      missing.forEach((group) => {
        b.push(H(`${group}이 드러나지 않은 구조`));
        b.push(E(`근거: ${group}에 해당하는 ${joinKo(GROUPS[group])}이(가) 천간과 지지 본기에 보이지 않아.`));
        c.sink.add(b, godLib(c, GROUPS[group][0]).whenWeak);
        c.sink.add(b, godLib(c, GROUPS[group][1]).whenWeak);
      });
      b.push(H("지장간 — 지지 속에 숨은 글자"));
      b.push(P("지장간은 지지 안에 숨어 있는 천간들이야. 겉으로 보이는 글자가 ‘드러난 모습’이라면 지장간은 ‘속에 품은 재료’에 가까워. 아래는 네 명식의 지지에 들어 있는 글자들이야."));
      b.push(UL(a.positions.map((pos) => `${pos.label} ${pos.pillar.branch.name}: ${pos.hidden.map((h) => `${h.stem.name}(${h.role}, ${h.god})`).join(" · ")}`)));
      add("tengods", "십성과 지장간", true, b);
    }

    // 6 합충형파해
    {
      const b = [];
      b.push(P("합·충·형·파·해는 글자끼리 만났을 때 일어나는 관계를 부르는 말이야. 합은 어울려 묶이는 것, 충은 정면으로 부딪히는 것, 형·파·해는 불편하게 얽히거나 틈이 생기는 것으로 읽어. 아래는 네 명식에서 실제로 계산된 관계만 풀었어."));
      const seenKeys = new Set();
      a.relations.forEach((rel) => describeRelation(c, rel, b, seenKeys));
      a.groups.forEach((group) => {
        b.push(H(`${group.type === "samhap" ? "삼합" : "반합"} ${group.key}`));
        b.push(E(`근거: ${group.type === "samhap" ? "세 글자가 모두" : "중심 글자와 한 글자가"} 모여 ${group.element} 기운을 이루는 구성이야.`));
        c.sink.add(b, pick(L, "relation", group.type, group.key));
      });
      if (!a.relations.length && !a.groups.length) {
        b.push(P("이 명식에는 글자 사이에 두드러지는 합·충·형·파·해가 계산되지 않았어. 그래서 글자들이 서로 크게 당기거나 부딪히기보다 각자의 자리에서 제 역할을 하는 구조로 읽을 수 있어. 이 경우 변화는 명식 안보다는 올해·달의 기운(세운, 월운)이 들어올 때 더 또렷해질 수 있어."));
      }
      b.push(P("관계가 있다는 것과 일이 일어난다는 것은 달라. 합은 묶이는 힘이지만 때로는 변하는 힘이 되기도 하고, 충은 부딪힘이지만 정체를 깨는 계기가 되기도 해. 좋고 나쁨으로 나누지 말고 ‘내가 어느 상황에서 이런 긴장을 느끼는가’를 살펴보는 데 써줘."));
      add("relations", "실제 계산된 합·충·형·파·해의 의미", true, b);
    }

    // 7 겉과 속
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}, 월간 ${c.monthPos.pillar.stem.name}(${c.monthPos.stemGod}), 일지 ${dayBranch}.`));
      c.sink.add(b, S.outer);
      c.sink.add(b, S.inner);
      c.sink.add(b, pick(L, "tenGod", c.monthPos.stemGod, "pillar", "month"));
      b.push(P(`겉으로 보이는 인상은 월간의 ${c.monthPos.stemGod} 기운, 속마음은 일지 ${dayBranch}가 품은 기운과 연결해서 읽을 수 있어. 둘의 결이 비슷하면 겉과 속이 일치하는 편이고, 다르면 낯선 사람 앞과 가까운 사람 앞에서 다른 얼굴이 나올 수 있어.`));
      add("outer-inner", "겉으로 드러나는 성격과 내면", false, b);
    }

    // 8 강점·약점
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}의 기본 성향과 ${c.topGods[0]}·${c.topGods[1] || ""} 십성의 크기.`));
      c.sink.add(b, S.bright);
      c.sink.add(b, S.excess);
      b.push(H("이런 모습으로 나타날 수 있어"));
      (S.examples || []).forEach((t) => c.sink.add(b, t));
      c.topGods.slice(0, 2).forEach((god) => c.sink.add(b, godLib(c, god).whenStrong));
      if (a.missingGroups.length) b.push(P(`${joinKo(a.missingGroups)} 묶음이 드러나지 않은 만큼, 그 영역을 의식적으로 챙기면 균형이 맞춰질 수 있어. 이건 결핍이라기보다 ‘직접 해야 하는 연습’에 가까워.`));
      add("patterns", "강점·약점·반복하기 쉬운 행동 패턴", true, b);
    }

    // 9 감정·스트레스
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}(${c.dayStem.element})의 감정 결과 ${weakEls.length ? `${joinKo(weakEls)} 기운이 적은 구성` : "고른 오행 구성"}.`));
      c.sink.add(b, S.emotion);
      c.sink.add(b, S.stress);
      weakEls.slice(0, 2).forEach((el) => c.sink.add(b, pick(L, "element", el, c.state[el])));
      strongEls.slice(0, 1).forEach((el) => c.sink.add(b, pick(L, "element", el, c.state[el])));
      add("emotion", "감정 표현과 스트레스 반응", false, b);
    }

    // 10 공부
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}의 공부 방식, 인성(${a.groupWeight["인성"].toFixed(1)})과 식상(${a.groupWeight["식상"].toFixed(1)})의 크기.`));
      c.sink.add(b, S.study);
      c.topGods.slice(0, 3).forEach((god) => c.sink.add(b, godLib(c, god).study));
      const g = a.groupWeight["인성"] < 1 ? "편인" : "정인";
      c.sink.add(b, godLib(c, g).study);
      add("study", "공부 방식·재능·적성", false, b);
    }

    // 11 직업
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}, 월지 ${monthBranch}, 십성 상위 ${c.topGods.slice(0, 3).join("·")}.`));
      c.sink.add(b, S.work);
      c.sink.add(b, S.leadership);
      c.sink.add(b, monthLib.lifeStyle);
      c.topGods.slice(0, 3).forEach((god) => c.sink.add(b, godLib(c, god).work));
      b.push(P("직업은 십성 하나로 정해지지 않아. 어떤 일을 해야 한다는 처방이 아니라, 어떤 방식으로 일할 때 힘이 나는지(혼자/함께, 정해진 틀/자유, 표현/분석 등)를 찾는 단서로 써줘."));
      add("career", "직업·조직생활·협업·리더십", false, b);
    }

    // 12 돈
    {
      const b = [];
      b.push(E(`근거: 재성 가중치 ${a.groupWeight["재성"].toFixed(1)}, 식상 ${a.groupWeight["식상"].toFixed(1)}, 일간 ${c.dayStem.name}.`));
      c.sink.add(b, S.money);
      const wealthGods = ["편재", "정재"].sort((x, y) => a.godWeight[y] - a.godWeight[x]);
      c.sink.add(b, godLib(c, wealthGods[0]).money);
      c.sink.add(b, godLib(c, wealthGods[1]).money);
      c.topGods.slice(0, 2).forEach((god) => c.sink.add(b, godLib(c, god).money));
      if (a.groupWeight["재성"] < 0.8) c.sink.add(b, godLib(c, "정재").whenWeak);
      b.push(P("돈의 해석은 벌어들이는 방식, 쓰는 방식, 지키는 방식의 성향을 보는 거지 수익이나 손실을 예측하는 게 아니야. 투자나 큰 지출은 개인 사정과 시장 정보를 기준으로 판단해줘."));
      add("money", "돈을 벌고 쓰고 관리하는 성향", false, b);
    }

    // 13 연애
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}, 일지 ${dayBranch}(배우자궁이라 불리는 자리), ${a.gender === "female" ? "관성" : a.gender === "male" ? "재성" : "관성·재성"}의 크기.`));
      c.sink.add(b, S.love);
      c.sink.add(b, S.conflict);
      c.sink.add(b, pick(L, "branch", dayBranch, "asDay"));
      const partnerGods = a.gender === "female" ? ["정관", "편관"] : a.gender === "male" ? ["정재", "편재"] : [];
      partnerGods.sort((x, y) => a.godWeight[y] - a.godWeight[x]);
      partnerGods.forEach((god) => c.sink.add(b, godLib(c, god).relation));
      if (!partnerGods.length) {
        b.push(P("성별을 밝히지 않아서 전통적으로 성별에 따라 달리 보는 배우자성(여성의 관성, 남성의 재성) 풀이는 넣지 않았어. 대신 일간과 일지, 관계에 관한 십성만으로 읽었어."));
      }
      c.topGods.slice(0, 2).forEach((god) => c.sink.add(b, godLib(c, god).relation));
      add("love", "연애·친밀감·갈등 해결 방식", false, b);
    }

    // 14 가족/친구
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}, 년주 ${pillarName(c.byKeyYear || a.byKey.year.pillar)}, 비겁 ${a.groupWeight["비겁"].toFixed(1)}, 인성 ${a.groupWeight["인성"].toFixed(1)}.`));
      c.sink.add(b, S.family);
      c.sink.add(b, S.friends);
      c.sink.add(b, godLib(c, "비견").relation);
      c.sink.add(b, godLib(c, "겁재").relation);
      c.sink.add(b, godLib(c, "정인").relation);
      add("social", "가족·친구·사회적 관계", false, b);
    }

    // 15 리듬
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}, 월지 ${monthBranch}, ${weakEls.length ? `적은 오행 ${joinKo(weakEls)}` : "고른 오행"}.`));
      c.sink.add(b, S.rhythm);
      c.sink.add(b, monthLib.rhythm);
      weakEls.slice(0, 3).forEach((el) => c.sink.add(b, pick(L, "element", el, "rhythm")));
      strongEls.slice(0, 2).forEach((el) => c.sink.add(b, pick(L, "element", el, "rhythm")));
      b.push(P("생활 리듬 해석은 몸 상태나 건강을 진단하는 게 아니야. 에너지가 오르내리는 느낌과 어울리는 일과 휴식 방식을 고민할 때 쓰는 참고 자료야."));
      add("rhythm", "생활 리듬과 자기관리", false, b);
    }

    // 16 대운·세운
    {
      const b = [];
      const d = a.daewoon;
      const yearPillar = core.annualPillar(c.now);
      if (d) {
        b.push(H("대운의 방향과 시작"));
        b.push(E(`근거: ${genderText(a.gender)}, 태어난 해의 천간이 ${c.chart.yearPillar.stem.polarity}이므로 ${d.forward ? "순행" : "역행"}. 다음 절기까지의 거리로 계산한 시작 나이 약 ${d.years}세 ${d.months}개월.`));
        b.push(P(`대운은 약 10년 단위로 바뀌는 큰 흐름이야. 네 대운은 ${d.forward ? "월주 다음 간지로 순서대로" : "월주 이전 간지로 거꾸로"} 진행하고, 시작은 약 ${d.years}세 ${d.months}개월 무렵으로 계산돼. 이 값은 ‘3일 = 1년’ 환산을 쓰는 가장 흔한 방식이야.${d.approximate ? " 태어난 시간을 몰라서 시작 시점은 대략적인 값이야." : ""}`));
        d.steps.forEach((step) => {
          const god = core.tenGod(c.dayStem, step.pillar.stem);
          const branchGod = An.hiddenOf(step.pillar.branchIndex, c.dayStem).slice(-1)[0].god;
          const current = d.current && d.current.index === step.index;
          b.push(H(`${step.startAge}세 ~ ${step.startAge + 9}세 · ${pillarName(step.pillar)} (${pillarHanja(step.pillar)})${current ? " · 지금 지나는 구간" : ""}`));
          b.push(E(`근거: 천간 ${step.pillar.stem.name}은 일간에서 ${god}, 지지 ${step.pillar.branch.name}의 중심 글자는 ${branchGod}.`));
          const useField = step.index % 2 === 0 ? "work" : "relation";
          c.sink.add(b, godLib(c, god)[current ? "balanced" : useField]);
          if (current) c.sink.add(b, godLib(c, branchGod).study);
        });
        b.push(P("대운의 십성은 ‘이 시기에 이런 주제가 자주 떠오를 수 있다’는 배경 정도로만 읽어줘. 나이 구간에 꼭 그런 일이 생기는 게 아니고, 명식의 합·충과 만나는 방식은 이 보고서에서 계산하지 않았어."));
      } else {
        b.push(H("대운은 이번에 계산하지 않았어"));
        b.push(P("대운은 남녀에 따라 순행·역행이 갈리는 전통 규칙을 써서, 성별을 선택하지 않은 경우에는 임의로 방향을 정하지 않고 계산하지 않았어. 성별을 입력하면 이 항목에 10년 단위 흐름이 채워져."));
      }
      const ygod = core.tenGod(c.dayStem, yearPillar.stem);
      b.push(H(`${yearPillar.year}년 세운 — ${pillarName(yearPillar)}`));
      b.push(E(`근거: 입춘 기준 ${yearPillar.year}년의 간지 ${pillarName(yearPillar)}, 일간에서 보면 ${ygod}.`));
      c.sink.add(b, pick(L, "year", "byGod", ygod, "overall"));
      c.sink.add(b, pick(L, "year", "byGod", ygod, "plan"));
      b.push(P("해마다 바뀌는 흐름은 ‘올해의 사주’에서 더 자세히 볼 수 있어."));
      add("luck", "대운과 세운", false, b);
    }

    // 17 실천 조언
    {
      const b = [];
      b.push(E(`근거: 일간 ${c.dayStem.name}의 조언, ${weakEls.length ? `보충하고 싶은 ${joinKo(weakEls)} 기운` : "고른 오행"}, 상위 십성 ${c.topGods.slice(0, 3).join("·")}.`));
      b.push(H("일간에서 나온 조언"));
      (S.advice || []).forEach((t) => c.sink.add(b, t));
      if (weakEls.length) {
        b.push(H("부족한 오행을 생활에서 돌보는 법"));
        weakEls.forEach((el) => (pick(L, "element", el, "advice") || []).forEach((t) => c.sink.add(b, t)));
      }
      b.push(H("십성에서 나온 조언"));
      c.topGods.slice(0, 3).forEach((god) => c.sink.add(b, godLib(c, god).advice));
      b.push(H("이번 주 시작 체크리스트"));
      b.push(UL([
        `${c.dayStem.name} 일간답게 편한 방식으로 시작할 수 있는 작은 행동 한 가지를 정해봐.`,
        weakEls.length ? `${weakEls[0]} 기운과 닮은 활동을 하루 10분만 넣어보자.` : "오행이 고른 편이니 지금의 리듬을 해치지 않는 선에서 새로운 활동을 하나 시도해봐.",
        `${c.topGods[0]}이(가) 강하게 드러난 만큼, 그 힘이 과해지는 순간을 알아차리고 한 박자 쉬는 연습을 해봐.`
      ]));
      add("advice", "주제별 구체적인 실천 조언", true, b);
    }

    // 18 마무리
    {
      const b = [];
      b.push(P(`${c.name ? c.name + "의 " : "네 "}명식을 한 문장으로 모으면, ${c.dayStem.name}(${c.dayStem.element}) 일간이 ${monthBranch}월의 계절 위에서 ${a.rankedGroups[0]}의 힘을 가장 크게 쓰고, ${weakEls.length ? `${joinKo(weakEls)}의 기운은 생활에서 보충하며` : "오행의 균형을 유지하며"} 살아가는 구조로 읽혀. 이 해석은 지금까지 설명한 근거에서 나온 하나의 이야기이고, 다른 관점으로도 얼마든지 읽을 수 있어.`));
      b.push(P("사주는 너를 규정하는 판결문이 아니라 스스로를 돌아보는 거울에 가까워. 마음에 닿는 문장은 일상에 연결해보고, 맞지 않는 문장은 놓아줘도 괜찮아. 네가 선택하고 노력하는 방향이 언제나 해석보다 더 중요해."));
      add("closing", "전체 내용을 연결하는 마무리", false, b);
    }

    return finish(c, "정통 사주 종합 보고서", sections);
  }

  /* ---------- 토정비결 ---------- */
  function monthFields(c, god, used) {
    const order = ["focus", "work", "relation", "money", "care"];
    const count = used[god] = (used[god] || 0) + 1;
    const start = ((count - 1) * 3) % order.length;
    const fields = [0, 1, 2].map((i) => order[(start + i) % order.length]);
    return { fields, actionIndex: (count - 1) % 2 };
  }

  function buildTojeong(input, options) {
    const c = context(input, options);
    const { analysis: a, L } = c;
    const S = stemLib(c);
    const sections = [];
    const add = (id, title, core_, blocks) => sections.push({ id, title, core: core_, blocks: clean(blocks) });
    const yp = core.annualPillar(c.now);
    const months = An.yearMonths(yp.year);
    const ygod = core.tenGod(c.dayStem, yp.stem);
    const used = {};

    {
      const b = [];
      b.push(H("이 토정비결을 읽는 방법"));
      b.push(P("전통 토정비결은 태어난 해·달·날을 숫자로 바꿔 괘를 뽑아 한 해의 열두 달을 풀어. 이 사이트의 토정비결은 그 괘수 공식을 그대로 쓰지 않고, 실제로 계산한 네 명식과 입춘부터 이어지는 절기월의 간지를 겹쳐서 달마다 어떤 주제가 부각될 수 있는지를 읽어. 그래서 전통 토정비결 책과는 내용이 다를 수 있어."));
      b.push(P("각 달은 ‘그 달의 간지가 내 일간에게 어떤 십성이 되는가’를 기준으로 풀어. 같은 십성이 다시 나올 때는 다른 면을 보여주도록 구성했어. 달마다 일어날 일을 단정하지 않고, 어떤 마음가짐과 행동이 도움이 될지를 중심으로 읽어줘."));
      b.push(E(`근거: 일간 ${c.dayStem.name}, ${yp.year}년 세운 ${pillarName(yp)}(일간에서 ${ygod}), ${STRENGTH_LABEL[a.strength]}.`));
      limitsBlock(c, ["달의 경계는 양력 1일이 아니라 절기가 바뀌는 시각이야. 입춘 전에는 이전 해, 절기 직후에는 새 달의 기운으로 읽어."]).forEach((t) => c.sink.add(b, t));
      add("guide", "읽는 방법과 계산 기준", true, b);
    }
    {
      const b = [];
      b.push(E(`근거: ${yp.year}년 간지 ${pillarName(yp)}, 일간 ${c.dayStem.name}과의 관계 ${ygod}.`));
      c.sink.add(b, pick(L, "year", "byGod", ygod, "overall"));
      c.sink.add(b, S.yearView);
      c.sink.add(b, S.monthView);
      const rels = An.relationsWith(a, yp, `${yp.year}년`).pairs;
      rels.slice(0, 4).forEach((rel) => c.sink.add(b, pick(L, "relation", relationLibKey({ scope: rel.scope, type: rel.type }), rel.key)));
      add("year-overview", `${yp.year}년 전체 흐름`, true, b);
    }
    {
      const b = [];
      b.push(P("열두 달을 먼저 한눈에 보면 이렇게 이어져. 괄호는 그 달의 간지와 일간에서 본 십성이야."));
      b.push(UL(months.map((m) => `${m.order}월 ${m.jie}(${fmtDate(m.start)} ~): ${pillarName(m.pillar)} · ${core.tenGod(c.dayStem, m.pillar.stem)}`)));
      b.push(P("긴장이 높은 달과 숨 돌리는 달이 번갈아 있으니, 바쁜 달에는 우선순위를 줄이고 한가한 달에는 미뤄둔 준비를 하는 식으로 활용해봐."));
      add("overview", "열두 달 한눈에 보기", true, b);
    }
    months.forEach((m) => {
      const b = [];
      const god = core.tenGod(c.dayStem, m.pillar.stem);
      const branchGod = An.hiddenOf(m.pillar.branchIndex, c.dayStem).slice(-1)[0].god;
      b.push(E(`근거: ${m.jie} 절기월(${fmtDate(m.start)} ~ ${fmtDate(m.end)}), 월간지 ${pillarName(m.pillar)}. 천간은 일간에서 ${god}, 지지 ${m.pillar.branch.name}의 중심은 ${branchGod}.`));
      c.sink.add(b, pick(L, "tojeong", "monthTheme", m.pillar.branch.name));
      const { fields, actionIndex } = monthFields(c, god, used);
      const g = pick(L, "tojeong", "byGod", god) || {};
      fields.forEach((f) => c.sink.add(b, g[f]));
      if (branchGod !== god) {
        const g2 = pick(L, "tojeong", "byGod", branchGod) || {};
        const { fields: f2 } = monthFields(c, branchGod, used);
        c.sink.add(b, g2[f2[0]]);
      }
      const rels = An.relationsWith(a, m.pillar, `${m.order}월`).pairs;
      rels.slice(0, 2).forEach((rel) => {
        c.sink.add(b, `${rel.glyphs} — 이 달의 ${rel.scope === "stem" ? "천간" : "지지"}이(가) 명식의 ${rel.position.label}과(와) ${{ hap: "합", chung: "충", hyung: "형", pa: "파", hae: "해" }[rel.type]} 관계로 만나. 아래는 그 관계가 의미할 수 있는 모습이야.`);
        c.sink.add(b, pick(L, "relation", relationLibKey({ scope: rel.scope, type: rel.type }), rel.key));
      });
      if (g.actions && g.actions[actionIndex]) b.push(UL([g.actions[actionIndex]]));
      sections.push({ id: `month-${m.order}`, title: `${m.order}월 · ${m.jie} 무렵 (${pillarName(m.pillar)})`, core: m.order <= 2, blocks: clean(b) });
    });
    {
      const b = [];
      b.push(H("한 해를 꾸려가는 방법"));
      c.sink.add(b, pick(L, "year", "byGod", ygod, "plan"));
      c.sink.add(b, pick(L, "year", "byGod", ygod, "rhythm"));
      (S.advice || []).forEach((t) => c.sink.add(b, t));
      add("plan", "한 해 계획과 마음가짐", true, b);
    }
    {
      const b = [];
      b.push(P("토정비결은 한 해의 분위기를 미리 짚어보는 옛 풍습이야. 이 풀이는 오늘의 선택을 도와주는 참고 자료일 뿐, 정해진 결과를 알려주지 않아. 좋게 읽힌 달은 준비에 쓰고, 조심하라고 읽힌 달은 쉬어가는 신호로 받아들이면 충분해."));
      add("closing", "마무리와 한계", false, b);
    }
    return finish(c, `${yp.year}년 토정비결`, sections);
  }

  /* ---------- 올해의 사주 ---------- */
  function buildYear(input, options) {
    const c = context(input, options);
    const { analysis: a, L } = c;
    const S = stemLib(c);
    const sections = [];
    const add = (id, title, core_, blocks) => sections.push({ id, title, core: core_, blocks: clean(blocks) });
    const yp = core.annualPillar(c.now);
    const ygod = core.tenGod(c.dayStem, yp.stem);
    const bgod = An.hiddenOf(yp.branchIndex, c.dayStem).slice(-1)[0].god;
    const Y = pick(L, "year", "byGod", ygod) || {};
    const rels = An.relationsWith(a, yp, `${yp.year}년`).pairs;
    const weakEls = ELS.filter((el) => c.state[el] === "lack" || c.state[el] === "low");

    {
      const b = [];
      b.push(H("올해의 사주를 읽는 방법"));
      b.push(P(`올해의 사주는 입춘을 기준으로 바뀌는 ${yp.year}년의 간지 ${pillarName(yp)}(${pillarHanja(yp)})를 네 명식 옆에 놓고 읽는 풀이야. 그해의 천간이 내 일간에게 어떤 십성이 되는지, 지지가 내 명식의 글자와 합·충 같은 관계를 맺는지, 그리고 오행의 균형이 어떻게 달라지는지를 차례로 살펴볼게.`));
      b.push(E(`근거: 기준 연도 ${yp.year}(입춘 기준), 올해 간지 ${pillarName(yp)}, 일간 ${c.dayStem.name}, 올해 천간의 십성 ${ygod}, 지지 중심의 십성 ${bgod}.`));
      limitsBlock(c, ["올해가 입춘 전이면 직전 해의 간지가 쓰이고, 입춘 시각이 지나면 새 해의 기운으로 바뀌어."]).forEach((t) => c.sink.add(b, t));
      add("guide", "읽는 방법과 계산 기준", true, b);
    }
    {
      const b = [];
      b.push(E(`근거: ${yp.year}년 ${pillarName(yp)} — 천간 ${yp.stem.name}(${yp.stem.element}), 지지 ${yp.branch.name}(${yp.branch.animal}, ${yp.branch.element}).`));
      c.sink.add(b, Y.overall);
      c.sink.add(b, pick(L, "year", "byBranchGod", bgod, "overall"));
      c.sink.add(b, S.yearView);
      c.sink.add(b, godLib(c, ygod).meaning);
      add("overview", `${yp.year}년의 핵심 기운`, true, b);
    }
    [["work", "일과 커리어의 흐름"], ["money", "돈과 계획의 흐름"], ["relation", "관계와 감정의 흐름"], ["study", "배움과 성장의 흐름"], ["rhythm", "생활 리듬과 컨디션 관리"]].forEach(([field, title]) => {
      const b = [];
      b.push(E(`근거: 올해 천간 ${yp.stem.name}이(가) 일간 ${c.dayStem.name}에게 ${ygod}, ${title}에 해당하는 ${GOD_GROUP[ygod]} 묶음의 크기 ${a.groupWeight[GOD_GROUP[ygod]].toFixed(1)}.`));
      c.sink.add(b, Y[field]);
      b.push(H(`내 일간 ${c.dayStem.name}의 바탕에서 보면`));
      c.sink.add(b, S[{ work: "work", money: "money", relation: "love", study: "study", rhythm: "rhythm" }[field]]);
      if (field === "work") c.sink.add(b, S.leadership);
      if (field === "relation") { c.sink.add(b, S.friends); c.sink.add(b, S.conflict); }
      if (field === "rhythm") { c.sink.add(b, S.emotion); c.sink.add(b, S.stress); }
      b.push(H(`올해 ${ygod}의 기운으로 보면`));
      c.sink.add(b, godLib(c, ygod)[field === "rhythm" ? "balanced" : field]);
      if (a.groupWeight[GOD_GROUP[ygod]] >= 2.5) c.sink.add(b, godLib(c, ygod).whenStrong);
      else if (a.groupWeight[GOD_GROUP[ygod]] < 1) c.sink.add(b, godLib(c, ygod).whenWeak);
      add(`y-${field}`, title, field === "work", b);
    });
    {
      const b = [];
      b.push(E(`근거: 올해 간지와 명식 글자의 관계 ${rels.length ? rels.map((r) => `${r.glyphs} ${r.key} ${{ hap: "합", chung: "충", hyung: "형", pa: "파", hae: "해" }[r.type]}`).join(", ") : "계산된 합·충·형·파·해 없음"}.`));
      if (rels.length) {
        rels.forEach((rel) => {
          b.push(H(`${rel.scope === "stem" ? "천간" : "지지"} ${rel.glyphs} · ${rel.key} ${{ hap: "합", chung: "충", hyung: "형", pa: "파", hae: "해" }[rel.type]} (${rel.position.label})`));
          c.sink.add(b, pick(L, "relation", relationLibKey({ scope: rel.scope, type: rel.type }), rel.key));
          c.sink.add(b, pick(L, "relation", "position", rel.type, rel.position.key === "year" ? "년월" : rel.position.key === "month" ? "월일" : rel.position.key === "day" ? "일시" : "년시"));
        });
      } else {
        b.push(P("올해의 간지와 네 명식 글자 사이에는 두드러진 합·충·형·파·해가 계산되지 않았어. 그래서 큰 부딪힘이나 변화의 압박보다는 명식이 가진 성향이 그대로 드러나는 해로 읽을 수 있어."));
      }
      c.sink.add(b, pick(L, "year", "byBranchGod", bgod, "caution"));
      add("y-relations", "올해 글자와 내 명식의 관계", true, b);
    }
    {
      const b = [];
      const after = Object.assign({}, a.elementCount);
      after[yp.stem.element] += 1; after[yp.branch.element] += 1;
      b.push(E(`근거: 명식의 오행 ${ELS.map((el) => `${el} ${a.elementCount[el]}`).join(" ")} → 올해 두 글자를 더하면 ${ELS.map((el) => `${el} ${after[el]}`).join(" ")}.`));
      b.push(P(`올해의 천간 ${yp.stem.name}(${yp.stem.element})과 지지 ${yp.branch.name}(${yp.branch.element})이 더해지면 ${yp.stem.element}${yp.stem.element === yp.branch.element ? "" : "·" + yp.branch.element} 기운이 올해 분위기에서 커져. 이 오행이 네 명식에서 ${joinKo([...new Set([yp.stem.element, yp.branch.element])].map((el) => `${el}은 ${STATE_LABEL[c.state[el]]}`))}이라서, ${weakEls.includes(yp.stem.element) || weakEls.includes(yp.branch.element) ? "부족한 기운이 보충되는 느낌으로 읽을 수 있어." : "이미 있는 기운이 한 번 더 강조되는 느낌으로 읽을 수 있어."}`));
      [...new Set([yp.stem.element, yp.branch.element])].forEach((el) => c.sink.add(b, pick(L, "element", el, c.state[el])));
      ELS.forEach((el) => {
        const next = An.elementState(after[el]);
        b.push(H(`${el} — 명식 ${a.elementCount[el]}개 → 올해 ${after[el]}개 (${STATE_LABEL[next]})`));
        c.sink.add(b, pick(L, "element", el, next));
        if (el === yp.stem.element || el === yp.branch.element) c.sink.add(b, pick(L, "element", el, "daily"));
      });
      add("y-elements", "올해 더해지는 오행과 균형", false, b);
    }
    {
      const b = [];
      const months = An.yearMonths(yp.year);
      b.push(UL(months.map((m) => `${m.order}월 ${m.jie}: ${pillarName(m.pillar)} · 일간에서 ${core.tenGod(c.dayStem, m.pillar.stem)}`)));
      b.push(P("올해를 네 계절로 나누어, 각 달의 기운이 내 일간에게 어떤 주제를 건네는지 살펴볼게. 달마다 모든 일을 예측하는 게 아니라 ‘이런 주제가 떠오를 수 있다’는 힌트로 읽어줘."));
      const used = {};
      const seasons = ["봄", "여름", "가을", "겨울"];
      months.forEach((m, i) => {
        if (i % 3 === 0) b.push(H(`${seasons[Math.floor(i / 3)]}의 흐름`));
        const god = core.tenGod(c.dayStem, m.pillar.stem);
        b.push(H(`${m.order}월 ${m.jie} 무렵 · ${pillarName(m.pillar)} (${god})`));
        c.sink.add(b, pick(L, "tojeong", "monthTheme", m.pillar.branch.name));
        const { fields } = monthFields(c, god, used);
        c.sink.add(b, pick(L, "tojeong", "byGod", god, fields[0]));
        c.sink.add(b, pick(L, "tojeong", "byGod", god, fields[1]));
      });
      add("y-months", "계절별·달별 흐름", false, b);
    }
    if (a.daewoon) {
      const b = [];
      const cur = a.daewoon.current;
      if (cur) {
        const cgod = core.tenGod(c.dayStem, cur.pillar.stem);
        b.push(E(`근거: 현재 대운 ${pillarName(cur.pillar)}(${cur.startAge}세~), 일간에서 ${cgod}.`));
        c.sink.add(b, godLib(c, cgod).balanced);
        c.sink.add(b, godLib(c, cgod).work);
        b.push(P("올해의 세운은 이 큰 흐름 위에 얹히는 한 해의 기운이야. 큰 흐름과 올해가 같은 방향이면 힘이 실리고, 다른 방향이면 균형을 맞추는 해가 될 수 있어."));
      } else {
        b.push(P("대운이 아직 시작되기 전이라 현재 구간에 대한 해석은 넣지 않았어."));
      }
      add("y-daewoon", "대운이라는 배경", false, b);
    }
    {
      const b = [];
      c.sink.add(b, Y.plan);
      c.sink.add(b, Y.caution);
      (S.advice || []).forEach((t) => c.sink.add(b, t));
      weakEls.slice(0, 2).forEach((el) => (pick(L, "element", el, "advice") || []).forEach((t) => c.sink.add(b, t)));
      c.sink.add(b, godLib(c, ygod).advice);
      add("y-plan", "올해 실천 계획과 조심할 점", true, b);
    }
    {
      const b = [];
      b.push(P("올해의 흐름은 해석의 한 가지 틀이야. 같은 간지의 해라도 사람마다 환경과 선택이 달라서 다르게 나타나. 네가 정한 방향을 중심에 두고 참고만 해줘."));
      add("closing", "마무리와 한계", false, b);
    }
    return finish(c, `${yp.year}년 올해의 사주`, sections);
  }

  /* ---------- 살풀이 ---------- */
  function buildSal(input, options) {
    const c = context(input, options);
    const { analysis: a, L } = c;
    const S = stemLib(c);
    const sections = [];
    const add = (id, title, core_, blocks) => sections.push({ id, title, core: core_, blocks: clean(blocks) });
    const SAL = pick(L, "sal", "items") || {};
    const names = { 도화: "도화", 역마: "역마", 화개: "화개", 귀인: "귀인" };
    const weakEls = ELS.filter((el) => c.state[el] === "lack" || c.state[el] === "low");
    const posKey = { year: "year", month: "month", day: "day", hour: "hour" };

    {
      const b = [];
      b.push(H("살풀이를 읽는 방법"));
      b.push(P("‘살’은 전통 명리에서 쓰는 이름표일 뿐 나쁜 일을 예고하는 낙인이 아니야. 이 풀이는 도화·역마·화개·귀인처럼 명식 안에서 계산된 신호를 성향과 마음 돌봄의 이야기로 풀어. 있다고 해서 꼭 그 일이 생기는 것도, 없다고 해서 그 영역이 비는 것도 아니야."));
      b.push(E(`근거: 년지 ${a.byKey.year.pillar.branch.name}·일지 ${c.dayPos.pillar.branch.name} 기준 삼합 계열 신호와 일간 ${c.dayStem.name} 기준 귀인.`));
      limitsBlock(c, ["살의 기준은 학파마다 달라서 여기서는 가장 흔히 쓰는 도화·역마·화개·귀인만 다뤘어."]).forEach((t) => c.sink.add(b, t));
      add("guide", "읽는 방법과 기준", true, b);
    }
    ["도화", "역마", "화개", "귀인"].forEach((name) => {
      const info = a.sal[name];
      const item = SAL[name] || {};
      const b = [];
      const foundLabels = info.found.map((k) => POS_LABEL[k] || k);
      b.push(E(`근거: ${name} ${name === "귀인" ? `일간 ${c.dayStem.name} 기준 해당 지지 ${info.targets.map((t) => core.branches[t].name).join("·")}` : `기준 지지에서 찾는 글자 ${info.targets.map((t) => core.branches[t].name).join("·")}`}. 명식에서 찾은 위치: ${foundLabels.length ? foundLabels.join(", ") : "없음"}.`));
      c.sink.add(b, item.meaning);
      if (info.found.length) {
        c.sink.add(b, item.present);
        info.found.forEach((k) => c.sink.add(b, pick(item, "position", posKey[k])));
        c.sink.add(b, item.soft);
        c.sink.add(b, item.care);
        b.push(H("생활에서 이렇게 돌볼 수 있어"));
        b.push(UL(item.practices || []));
      } else {
        c.sink.add(b, item.absent);
        c.sink.add(b, item.soft);
        c.sink.add(b, item.care);
        b.push(UL(item.practices || []));
      }
      add(`sal-${name}`, `${names[name]}${name === "귀인" ? " — 돕는 기운" : "의 흐름"}`, true, b);
    });
    {
      const b = [];
      const seenKeys = new Set();
      const bad = a.relations.filter((r) => ["chung", "hyung", "pa", "hae"].includes(r.type));
      b.push(P("충·형·파·해는 전통적으로 ‘살’이나 ‘흉’으로 불러온 관계들이야. 하지만 이 관계가 있다고 안 좋은 일이 생기는 게 아니라, 마음이 부딪히거나 변화가 생기기 쉬운 지점을 알려주는 신호로 읽는 게 더 도움이 돼."));
      if (bad.length) bad.forEach((rel) => describeRelation(c, rel, b, seenKeys));
      else b.push(P("이 명식에는 계산된 충·형·파·해가 없어. 그래서 명식 안에서 서로 부딪히는 신호는 두드러지지 않아."));
      add("clash", "부딪힘과 긴장의 신호", true, b);
    }
    {
      const b = [];
      b.push(E(`근거: 오행 분포 ${ELS.map((el) => `${el} ${a.elementCount[el]}`).join(" ")}.`));
      c.sink.add(b, S.salView);
      ELS.forEach((el) => {
        b.push(H(`${el} — ${a.elementCount[el]}개, ${STATE_LABEL[c.state[el]]}`));
        c.sink.add(b, pick(L, "element", el, c.state[el]));
        if (c.state[el] === "lack" || c.state[el] === "low") c.sink.add(b, pick(L, "sal", "care", el));
        else c.sink.add(b, pick(L, "element", el, "daily"));
      });
      add("balance", "오행 균형에서 보는 마음 돌봄", true, b);
    }
    {
      const b = [];
      b.push(E(`근거: 십성 가중치 ${c.topGods.slice(0, 4).map((god) => `${god} ${a.godWeight[god].toFixed(1)}`).join(", ")}.`));
      b.push(P("살처럼 불리는 기운은 혼자 움직이지 않고, 명식에서 가장 크게 자리 잡은 십성의 분위기 위에서 다르게 나타나. 같은 도화라도 표현의 힘이 큰 사람과 책임의 힘이 큰 사람이 다르게 경험할 수 있어서, 두드러진 십성의 성향도 함께 살펴볼게."));
      c.topGods.slice(0, 4).forEach((god) => {
        b.push(H(`${god} — 마음이 쏠리는 방식`));
        c.sink.add(b, godLib(c, god).meaning);
        c.sink.add(b, a.groupWeight[GOD_GROUP[god]] >= 2 ? godLib(c, god).whenStrong : godLib(c, god).balanced);
        c.sink.add(b, godLib(c, god).advice);
      });
      add("gods", "두드러진 십성과 살의 분위기", false, b);
    }
    {
      const b = [];
      b.push(H("성향으로 풀어본 정리"));
      c.sink.add(b, S.stress);
      c.sink.add(b, S.emotion);
      b.push(H("관계에서 돌볼 점"));
      c.sink.add(b, S.love);
      c.sink.add(b, S.conflict);
      c.sink.add(b, S.family);
      c.sink.add(b, S.friends);
      b.push(H("생활 리듬에서 돌볼 점"));
      c.sink.add(b, S.rhythm);
      c.sink.add(b, pick(L, "month", c.monthPos.pillar.branch.name, "rhythm"));
      b.push(H("작게 시작하는 실천"));
      (S.examples || []).forEach((t) => c.sink.add(b, t));
      (S.advice || []).forEach((t) => c.sink.add(b, t));
      add("care", "일간으로 보는 마음 돌봄", false, b);
    }
    {
      const b = [];
      b.push(P("살풀이는 두려움을 키우는 풀이가 아니라, 나를 더 잘 돌보기 위한 풀이야. 불안한 마음이 든다면 풀이의 문장에 매달리기보다 오늘 할 수 있는 작은 돌봄 한 가지를 골라봐."));
      add("closing", "마무리와 한계", false, b);
    }
    return finish(c, "살풀이 종합 보고서", sections);
  }

  /* ---------- 궁합 ---------- */
  function buildCompat(firstInput, secondInput, options) {
    const a1 = options.first || {};
    const a2 = options.second || {};
    const c1 = context(firstInput, { gender: a1.gender, name: a1.name, now: options.now });
    const c2 = context(secondInput, { gender: a2.gender, name: a2.name, now: options.now });
    const L = lib();
    const sink = createSink();
    const n1 = a1.name || "첫 번째 사람";
    const n2 = a2.name || "두 번째 사람";
    const sections = [];
    const add = (id, title, core_, blocks) => sections.push({ id, title, core: core_, blocks: clean(blocks) });
    const d1 = c1.dayStem; const d2 = c2.dayStem;

    // 일간 관계 유형
    const e1 = d1.element; const e2 = d2.element;
    let relKey;
    if (e1 === e2) relKey = d1.name === d2.name || d1.polarity === d2.polarity ? "sameSame" : "sameDiff";
    else if (SHENG[e1] === e2) relKey = "aGenB";
    else if (SHENG[e2] === e1) relKey = "bGenA";
    else if (KE[e1] === e2) relKey = "aKeB";
    else relKey = "bKeA";
    const RK = pick(L, "compat", "stemRel", relKey) || {};
    const godAB = core.tenGod(d1, d2);
    const godBA = core.tenGod(d2, d1);

    {
      const b = [];
      b.push(H("궁합을 읽는 방법"));
      b.push(P("궁합은 두 사람의 명식을 나란히 놓고 서로의 기운이 어떻게 만나는지를 보는 풀이야. 좋은 궁합과 나쁜 궁합으로 나누는 대신, 서로 어떤 부분에서 편안하고 어떤 부분에서 부딪히기 쉬운지, 그리고 어떻게 맞춰갈 수 있는지를 살펴볼게."));
      b.push(E(`근거: ${n1} 일간 ${d1.name}(${e1}) · ${n2} 일간 ${d2.name}(${e2}). 일간 관계 ${relKey}, 서로에게 보이는 십성 ${n1}→${n2} ${godAB}, ${n2}→${n1} ${godBA}.`));
      limitsBlock(c1, ["궁합은 두 사람의 관계를 확정하지 않아. 서로의 성향을 이해하는 대화의 재료로만 써줘."]).forEach((t) => sink.add(b, t));
      add("guide", "읽는 방법과 계산 기준", true, b);
    }
    {
      const b = [];
      b.push(UL([...chartSummary(c1).slice(0, 4).map((t) => `${n1} · ${t}`), ...chartSummary(c2).slice(0, 4).map((t) => `${n2} · ${t}`)]));
      [[c1, n1], [c2, n2]].forEach(([c, n]) => {
        b.push(H(`${n}의 기본 결`));
        sink.add(b, stemLib(c).core);
      });
      add("each", "두 사람의 기본 명식", true, b);
    }
    {
      const b = [];
      b.push(E(`근거: 두 일간의 오행 관계 — ${e1}과 ${e2}.`));
      ["communication", "daily", "conflict", "growth", "role"].forEach((f) => sink.add(b, RK[f]));
      add("stems", "일간으로 보는 두 사람의 결", true, b);
    }
    {
      const b = [];
      b.push(H(`${n1}가 보는 ${n2} — ${godAB}`));
      ["view", "conflict", "tip"].forEach((f) => sink.add(b, pick(L, "compat", "godView", godAB, f)));
      b.push(H(`${n2}가 보는 ${n1} — ${godBA}`));
      ["view", "conflict", "tip"].forEach((f) => sink.add(b, pick(L, "compat", "godView", godBA, f)));
      add("godview", "서로가 서로에게 어떤 존재로 보일까", true, b);
    }
    {
      const b = [];
      const rels = [];
      const pairs = [["day", "일지"], ["month", "월지"], ["year", "년지"]];
      pairs.forEach(([k1, l1]) => pairs.forEach(([k2, l2]) => {
        const p1 = c1.analysis.byKey[k1]; const p2 = c2.analysis.byKey[k2];
        if (!p1 || !p2) return;
        An.branchPair(p1.pillar.branchIndex, p2.pillar.branchIndex).forEach((rel) => rels.push({ ...rel, l1: `${n1} ${l1}`, l2: `${n2} ${l2}`, g1: p1.pillar.branch.name, g2: p2.pillar.branch.name }));
      }));
      const seen = new Set();
      rels.forEach((rel) => {
        const key = relationLibKey({ scope: "branch", type: rel.type });
        const label = `${rel.l1} ${rel.g1} · ${rel.l2} ${rel.g2} — ${rel.key} ${{ hap: "합", chung: "충", hyung: "형", pa: "파", hae: "해" }[rel.type]}`;
        if (seen.has(label)) return;
        seen.add(label);
        b.push(H(label));
        sink.add(b, pick(L, "relation", key, rel.key));
      });
      if (!rels.length) b.push(P("두 사람의 지지(일지·월지·년지) 사이에는 두드러진 합·충·형·파·해가 계산되지 않았어. 글자끼리 크게 당기거나 부딪히는 신호가 없어서, 관계의 분위기는 일간과 십성의 만남으로 읽는 편이 더 도움이 돼."));
      b.push(P("지지 관계는 ‘이 부분에서 마음이 모이기 쉽다’ 또는 ‘이 부분에서 오해가 생기기 쉽다’ 정도의 힌트야. 관계는 결국 대화와 배려로 만들어져."));
      add("branches", "지지 관계 — 생활 속 분위기", true, b);
    }
    {
      const b = [];
      [[c1, c2, n1, n2], [c2, c1, n2, n1]].forEach(([me, other, nm, no]) => {
        ELS.filter((el) => me.state[el] === "lack" || me.state[el] === "low").forEach((el) => {
          const gives = other.state[el] === "high" || other.state[el] === "excess" || other.state[el] === "balanced";
          b.push(H(`${nm}에게 적은 ${el} 기운`));
          b.push(E(`근거: ${nm}의 ${el} ${me.analysis.elementCount[el]}개, ${no}의 ${el} ${other.analysis.elementCount[el]}개.`));
          sink.add(b, pick(L, "compat", "lack", el));
          sink.add(b, gives ? `${no}에게는 ${el} 기운이 비교적 있는 편이라, 곁에서 보완하는 느낌이 들 수 있어.` : `${no}에게도 ${el} 기운이 많지 않아서, 두 사람이 함께 의식적으로 챙기면 좋은 영역이야.`);
        });
      });
      add("balance", "서로의 부족한 기운 채우기", false, b);
    }
    {
      const b = [];
      [[c1, n1], [c2, n2]].forEach(([c, n]) => {
        b.push(H(`${n}의 관계 방식`));
        sink.add(b, stemLib(c).pairView);
        sink.add(b, stemLib(c).love);
        sink.add(b, stemLib(c).conflict);
        sink.add(b, pick(L, "branch", c.dayPos.pillar.branch.name, "asDay"));
      });
      add("styles", "각자의 관계 방식과 갈등 때 모습", true, b);
    }
    {
      const b = [];
      b.push(P("같은 관계라도 두 사람이 태어난 계절과 명식의 구성이 다르면 편안함을 느끼는 속도와 방식이 달라. 각자의 바탕을 먼저 나란히 놓아볼게."));
      [[c1, n1], [c2, n2]].forEach(([c, n]) => {
        const mb = c.monthPos.pillar.branch.name;
        b.push(H(`${n} — ${mb}월의 계절과 기질`));
        b.push(E(`근거: ${n}의 월지 ${mb}, 오행 ${ELS.map((el) => `${el} ${c.analysis.elementCount[el]}`).join(" ")}, 강약 참고 ${STRENGTH_LABEL[c.analysis.strength]}.`));
        sink.add(b, pick(L, "month", mb, "season"));
        sink.add(b, pick(L, "month", mb, "rhythm"));
        sink.add(b, stemLib(c).outer);
        sink.add(b, stemLib(c).inner);
      });
      add("temper", "두 사람이 가진 계절과 기질", false, b);
    }
    {
      const b = [];
      b.push(P("일상에서 마주치는 영역별로, 두 사람이 각자 어떤 모습으로 나타날 수 있는지 살펴볼게. 서로의 방식을 미리 알아두면 오해를 줄이는 데 도움이 돼."));
      [["money", "돈과 소비"], ["work", "일과 생활"], ["family", "가족과 주변 사람"], ["emotion", "감정 표현"], ["stress", "스트레스를 받을 때"]].forEach(([field, title]) => {
        b.push(H(title));
        [[c1, n1], [c2, n2]].forEach(([c, n]) => {
          b.push(E(`근거: ${n}의 일간 ${c.dayStem.name}(${c.dayStem.element}) — ${title} 영역.`));
          sink.add(b, stemLib(c)[field]);
        });
      });
      add("daily", "일상 영역별로 보는 두 사람", false, b);
    }
    {
      const b = [];
      [[c1, n1], [c2, n2]].forEach(([c, n]) => {
        b.push(H(`${n}의 두드러진 십성`));
        c.topGods.slice(0, 3).forEach((god) => {
          b.push(E(`근거: ${n}의 ${god} 가중치 ${c.analysis.godWeight[god].toFixed(1)}.`));
          sink.add(b, godLib(c, god).meaning);
          sink.add(b, godLib(c, god).relation);
        });
      });
      b.push(P("두 사람 모두 자기 명식에서 크게 잡힌 십성의 방식으로 관계를 맺는 경향이 있어. 같은 말도 한 사람은 책임감으로, 다른 사람은 간섭으로 느낄 수 있다는 점을 기억해줘."));
      add("gods", "십성으로 보는 관계의 방식", false, b);
    }
    {
      const b = [];
      b.push(H("함께 해볼 수 있는 일"));
      [[c1, n1], [c2, n2]].forEach(([c, n]) => {
        b.push(P(`${n}를 위한 팁`));
        (stemLib(c).advice || []).forEach((t) => sink.add(b, t));
      });
      add("tips", "함께 가꾸는 방법", true, b);
    }
    {
      const b = [];
      b.push(P("이 궁합은 두 사람의 일간·십성·지지 관계를 읽은 풀이야. 합이 많다고 잘 맞는 게 아니고 충이 있다고 안 맞는 것도 아니야. 서로를 이해하려는 마음과 대화가 가장 큰 변수라는 걸 기억해줘."));
      add("closing", "마무리와 한계", false, b);
    }
    const title = `${n1} ♡ ${n2} 궁합 보고서`;
    const ctx = Object.assign({}, c1, { chart: c1.chart });
    return finish(ctx, title, sections, [
      `${n1}: 일간 ${d1.name}(${e1}) · ${genderText(c1.gender)}`,
      `${n2}: 일간 ${d2.name}(${e2}) · ${genderText(c2.gender)}`,
      `일간 관계: ${relKey === "sameSame" ? "같은 결" : relKey === "sameDiff" ? "같은 오행, 다른 음양" : relKey === "aGenB" ? `${n1}이(가) ${n2}를 돕는 흐름` : relKey === "bGenA" ? `${n2}이(가) ${n1}을 돕는 흐름` : relKey === "aKeB" ? `${n1}이(가) ${n2}를 누르는 흐름` : `${n2}이(가) ${n1}을 누르는 흐름`}`,
      `서로에게 보이는 십성: ${n1}→${n2} ${godAB}, ${n2}→${n1} ${godBA}`
    ]);
  }

  /* ---------- 마무리 ---------- */
  function finish(c, title, sections, summaryOverride) {
    const summary = summaryOverride || chartSummary(c);
    let chars = title.length;
    summary.forEach((line) => { chars += line.length; });
    sections.forEach((s) => {
      chars += s.title.length;
      s.blocks.forEach((block) => {
        if (block.items) block.items.forEach((item) => { chars += item.length; });
        else chars += block.text.length;
      });
    });
    return {
      title,
      summary,
      toc: sections.map((s) => ({ id: s.id, title: s.title })),
      sections,
      chars,
      bodyChars: chars - title.length - summary.reduce((n, l) => n + l.length, 0)
    };
  }

  root.MikiReport = Object.freeze({
    build(kind, input, options) {
      const opts = options || {};
      if (kind === "classic") return buildClassic(input, opts);
      if (kind === "tojeong") return buildTojeong(input, opts);
      if (kind === "year") return buildYear(input, opts);
      if (kind === "sal") return buildSal(input, opts);
      throw new Error("알 수 없는 보고서 종류야.");
    },
    buildCompat,
    toPlainText(report) {
      const lines = [report.title, "", ...report.summary, ""];
      report.sections.forEach((s) => {
        lines.push(`## ${s.title}`);
        s.blocks.forEach((block) => {
          if (block.t === "h") lines.push(`### ${block.text}`);
          else if (block.items) block.items.forEach((item) => lines.push(`- ${item}`));
          else lines.push(block.text);
        });
        lines.push("");
      });
      return lines.join("\n");
    }
  });
}(typeof window !== "undefined" ? window : globalThis));
