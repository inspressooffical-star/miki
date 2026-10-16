(function () {
  "use strict";

  const core = window.SajuCore;
  const { stems, branches, elements } = core;
  const stemIndex = (name) => stems.findIndex((stem) => stem.name === name);
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;

  // 지장간: 여기·중기·정기 순서(마지막이 정기).
  const hiddenNames = [
    ["계"], ["계", "신", "기"], ["무", "병", "갑"], ["을"], ["을", "계", "무"], ["무", "경", "병"],
    ["병", "기", "정"], ["정", "을", "기"], ["무", "임", "경"], ["신"], ["신", "정", "무"], ["무", "갑", "임"]
  ];
  const hiddenRoles = { 1: ["정기"], 3: ["여기", "중기", "정기"] };
  const hiddenWeight = { 여기: 0.3, 중기: 0.5, 정기: 1 };

  const godGroupOf = {
    비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성", 정재: "재성",
    편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성"
  };
  const groupNames = ["비겁", "식상", "재성", "관성", "인성"];

  function hiddenOf(branchIndex, dayStem) {
    const names = hiddenNames[branchIndex];
    const roles = hiddenRoles[names.length] || ["여기", "정기"];
    return names.map((name, index) => {
      const stem = stems[stemIndex(name)];
      return { stem, role: roles[index], god: core.tenGod(dayStem, stem) };
    });
  }

  const stemPairs = {
    hap: { "0,5": "갑기", "1,6": "을경", "2,7": "병신", "3,8": "정임", "4,9": "무계" },
    chung: { "0,6": "갑경", "1,7": "을신", "2,8": "병임", "3,9": "정계" }
  };
  const sixHap = { "0,1": "자축", "2,11": "인해", "3,10": "묘술", "4,9": "진유", "5,8": "사신", "6,7": "오미" };
  const pa = { "0,9": "자유", "1,4": "축진", "2,11": "인해", "3,6": "묘오", "5,8": "사신", "7,10": "미술" };
  const hae = { "0,7": "자미", "1,6": "축오", "2,5": "인사", "3,4": "묘진", "8,11": "신해", "9,10": "유술" };
  const triples = [
    { key: "수국", set: [8, 0, 4], center: 0, element: "수" },
    { key: "목국", set: [11, 3, 7], center: 3, element: "목" },
    { key: "화국", set: [2, 6, 10], center: 6, element: "화" },
    { key: "금국", set: [5, 9, 1], center: 9, element: "금" }
  ];

  const pairKey = (a, b) => `${Math.min(a, b)},${Math.max(a, b)}`;

  // 두 지지 사이의 육합·충·형·파·해를 찾는다.
  function branchPair(a, b) {
    const found = [];
    const key = pairKey(a, b);
    if (a !== b && sixHap[key]) found.push({ type: "hap", key: sixHap[key] });
    if (a !== b && Math.abs(a - b) === 6) found.push({ type: "chung", key: branches[Math.min(a, b)].name + branches[Math.min(a, b) + 6].name });
    if (a !== b && pa[key]) found.push({ type: "pa", key: pa[key] });
    if (a !== b && hae[key]) found.push({ type: "hae", key: hae[key] });
    const set = [a, b];
    if (a !== b) {
      if (set.every((value) => [2, 5, 8].includes(value))) found.push({ type: "hyung", key: "인사신" });
      else if (set.every((value) => [1, 10, 7].includes(value))) found.push({ type: "hyung", key: "축술미" });
      else if (key === "0,3") found.push({ type: "hyung", key: "자묘" });
    } else if ([4, 6, 9, 11].includes(a)) found.push({ type: "hyung", key: "자형" });
    return found;
  }

  function stemPair(a, b) {
    const key = pairKey(a, b);
    const found = [];
    if (stemPairs.hap[key]) found.push({ type: "hap", key: stemPairs.hap[key] });
    if (stemPairs.chung[key]) found.push({ type: "chung", key: stemPairs.chung[key] });
    return found;
  }

  function elementState(count) {
    if (count <= 0) return "lack";
    if (count === 1) return "low";
    if (count === 2) return "balanced";
    if (count === 3) return "high";
    return "excess";
  }

  function analyze(chart, options) {
    const gender = options && options.gender;
    const dayStem = chart.dayPillar.stem;
    const dayElementIndex = elements.indexOf(dayStem.element);
    const positions = chart.pillars.map((entry) => {
      const { pillar } = entry;
      const isDay = entry.key === "day";
      const hidden = hiddenOf(pillar.branchIndex, dayStem);
      const main = hidden[hidden.length - 1];
      return {
        key: entry.key,
        label: entry.label,
        focus: entry.focus,
        pillar,
        stemGod: isDay ? null : core.tenGod(dayStem, pillar.stem),
        hidden,
        branchGod: main.god
      };
    });
    const byKey = Object.fromEntries(positions.map((position) => [position.key, position]));

    // 십성 분포: 겉으로 드러난 천간·지지 본기(visible)와 지장간 전체(hiddenAll)를 따로 센다.
    const godVisible = {};
    const godHidden = {};
    const godWeight = {};
    Object.keys(godGroupOf).forEach((god) => { godVisible[god] = 0; godHidden[god] = 0; godWeight[god] = 0; });
    const elementWeight = Object.fromEntries(elements.map((element) => [element, 0]));
    positions.forEach((position) => {
      if (position.stemGod) {
        godVisible[position.stemGod] += 1;
        godWeight[position.stemGod] += 1;
      }
      elementWeight[position.pillar.stem.element] += 1;
      const monthFactor = position.key === "month" ? 1.5 : 1;
      position.hidden.forEach((item) => {
        const weight = hiddenWeight[item.role] * monthFactor;
        godWeight[item.god] += weight;
        elementWeight[item.stem.element] += weight;
        if (item.role === "정기") godVisible[item.god] += 1;
        else godHidden[item.god] += 1;
      });
    });
    const groupWeight = Object.fromEntries(groupNames.map((group) => [group, 0]));
    const groupCount = Object.fromEntries(groupNames.map((group) => [group, 0]));
    Object.keys(godWeight).forEach((god) => {
      groupWeight[godGroupOf[god]] += godWeight[god];
      groupCount[godGroupOf[god]] += godVisible[god];
    });
    const rankedGods = Object.keys(godWeight).sort((a, b) => godWeight[b] - godWeight[a] || a.localeCompare(b));
    const rankedGroups = [...groupNames].sort((a, b) => groupWeight[b] - groupWeight[a]);
    const totalWeight = groupNames.reduce((sum, group) => sum + groupWeight[group], 0);
    const supportShare = (groupWeight["비겁"] + groupWeight["인성"]) / totalWeight;
    const strength = supportShare >= 0.5 ? "strong" : supportShare >= 0.36 ? "balanced" : "light";

    const monthPosition = byKey.month;
    const monthMain = monthPosition.hidden[monthPosition.hidden.length - 1];
    const monthRoot = monthMain.stem.element === dayStem.element
      ? "same"
      : monthMain.stem.element === elements[mod(dayElementIndex + 4, 5)] ? "support" : "other";

    // 합충형파해: 천간은 보이는 글자끼리, 지지는 모든 기둥의 쌍을 본다.
    const relations = [];
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i];
        const b = positions[j];
        const place = a.label.slice(0, 1) + b.label.slice(0, 1);
        stemPair(a.pillar.stemIndex, b.pillar.stemIndex).forEach((found) => {
          relations.push({ ...found, scope: "stem", place, a, b, glyphs: `${a.pillar.stem.hanja}${b.pillar.stem.hanja}` });
        });
        branchPair(a.pillar.branchIndex, b.pillar.branchIndex).forEach((found) => {
          relations.push({ ...found, scope: "branch", place, a, b, glyphs: `${a.pillar.branch.hanja}${b.pillar.branch.hanja}` });
        });
      }
    }
    const chartBranches = positions.map((position) => position.pillar.branchIndex);
    const groups = [];
    triples.forEach((triple) => {
      const present = triple.set.filter((index) => chartBranches.includes(index));
      if (present.length === 3) groups.push({ type: "samhap", ...triple, present });
      else if (present.length === 2 && present.includes(triple.center)) groups.push({ type: "banhap", ...triple, present });
    });

    // 신살: 년지·일지를 기준으로 도화·역마·화개를 찾고, 일간을 기준으로 천을귀인을 찾는다.
    const salTable = [
      { set: [8, 0, 4], peach: 9, travel: 2, canopy: 4 },
      { set: [2, 6, 10], peach: 3, travel: 8, canopy: 10 },
      { set: [5, 9, 1], peach: 6, travel: 11, canopy: 1 },
      { set: [11, 3, 7], peach: 0, travel: 5, canopy: 7 }
    ];
    const noble = { 갑: [1, 7], 무: [1, 7], 경: [1, 7], 을: [0, 8], 기: [0, 8], 병: [11, 9], 정: [11, 9], 임: [5, 3], 계: [5, 3], 신: [6, 2] };
    const baseBranches = [...new Set([byKey.year.pillar.branchIndex, byKey.day.pillar.branchIndex])];
    const sal = {};
    [["도화", "peach"], ["역마", "travel"], ["화개", "canopy"]].forEach(([name, field]) => {
      const targets = [...new Set(baseBranches.map((base) => salTable.find((row) => row.set.includes(base))[field]))];
      sal[name] = {
        targets,
        found: positions.filter((position) => targets.includes(position.pillar.branchIndex)).map((position) => position.key)
      };
    });
    const nobleTargets = noble[dayStem.name];
    sal["귀인"] = {
      targets: nobleTargets,
      found: positions.filter((position) => nobleTargets.includes(position.pillar.branchIndex)).map((position) => position.key)
    };

    const elementCount = chart.counts;
    const elementStates = Object.fromEntries(elements.map((element) => [element, elementState(elementCount[element])]));
    const rankedElements = [...elements].sort((a, b) => elementWeight[b] - elementWeight[a]);

    const analysis = {
      chart, gender, dayStem, dayElement: dayStem.element, positions, byKey,
      godVisible, godHidden, godWeight, groupWeight, groupCount, rankedGods, rankedGroups, supportShare, strength,
      monthMain, monthRoot, relations, groups, sal,
      elementCount, elementStates, elementWeight, rankedElements,
      missingGroups: groupNames.filter((group) => groupCount[group] === 0),
      daewoon: core.daewoon(chart, gender)
    };
    return analysis;
  }

  // 한 해(입춘~다음 입춘)를 열두 절기월로 나눈다.
  function yearMonths(pillarYear) {
    const yearStemIndex = mod(pillarYear - 4, 10);
    const list = [];
    for (let m = 0; m < 12; m += 1) {
      const startStamp = m < 11 ? core.solarTerm(pillarYear, 2 + m * 2) : core.solarTerm(pillarYear + 1, 0);
      const endStamp = m < 10 ? core.solarTerm(pillarYear, 4 + m * 2)
        : m === 10 ? core.solarTerm(pillarYear + 1, 0) : core.solarTerm(pillarYear + 1, 2);
      const branchIndex = mod(2 + m, 12);
      const stemIdx = mod((yearStemIndex % 5) * 2 + 2 + m, 10);
      list.push({
        order: m + 1,
        jie: core.jieNames[mod(1 + m, 12)],
        pillar: core.sexagenary(stemIdx, branchIndex),
        start: new Date(startStamp + 9 * 3600000),
        end: new Date(endStamp + 9 * 3600000)
      });
    }
    return list;
  }

  // 세운·월운 같은 외부 기둥이 명식과 맺는 관계(천간 합·충, 지지 합·충·형·파·해, 삼합·반합 완성).
  function relationsWith(analysis, outside, label) {
    const found = [];
    analysis.positions.forEach((position) => {
      stemPair(outside.stemIndex, position.pillar.stemIndex).forEach((rel) => {
        found.push({ ...rel, scope: "stem", position, label, glyphs: `${outside.stem.hanja}${position.pillar.stem.hanja}` });
      });
      branchPair(outside.branchIndex, position.pillar.branchIndex).forEach((rel) => {
        found.push({ ...rel, scope: "branch", position, label, glyphs: `${outside.branch.hanja}${position.pillar.branch.hanja}` });
      });
    });
    const natalBranches = analysis.positions.map((position) => position.pillar.branchIndex);
    const groups = [];
    triples.forEach((triple) => {
      if (!triple.set.includes(outside.branchIndex)) return;
      const others = triple.set.filter((index) => index !== outside.branchIndex);
      const have = others.filter((index) => natalBranches.includes(index));
      if (have.length === 2) groups.push({ type: "samhap", ...triple, label });
      else if (have.length === 1 && (outside.branchIndex === triple.center || have[0] === triple.center)) groups.push({ type: "banhap", ...triple, label });
    });
    return { pairs: found, groups };
  }

  window.SajuAnalysis = Object.freeze({
    analyze, yearMonths, relationsWith, branchPair, stemPair, elementState, godGroupOf, groupNames, hiddenOf, hiddenNames
  });
}());
