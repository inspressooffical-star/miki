(function () {
  "use strict";

  const stems = [
    { name: "갑", hanja: "甲", element: "목", polarity: "양", quality: "곧게 뻗는 큰 나무", description: "생각한 일을 밀고 나가는 힘이 있고, 주변에 방향을 잡아주는 편이야. 다만 모든 걸 혼자 책임지려 하거나 네 방식만 옳다고 고집하지 않도록 가끔 숨을 고르면 더 편해." },
    { name: "을", hanja: "乙", element: "목", polarity: "음", quality: "유연하게 뻗는 풀과 덩굴", description: "사람과 상황에 맞춰 길을 찾는 감각이 좋아. 부드럽지만 쉽게 꺾이지 않는 힘도 있어. 마음을 맞추느라 네 바람을 뒤로 미루지 않는 연습이 중요해." },
    { name: "병", hanja: "丙", element: "화", polarity: "양", quality: "환하게 비추는 햇볕", description: "표현이 솔직하고 주변을 밝게 만드는 재주가 있어. 시작을 이끄는 힘도 좋지. 다만 의욕이 앞설 때는 상대의 속도도 살펴주면 네 따뜻함이 더 오래 전해져." },
    { name: "정", hanja: "丁", element: "화", polarity: "음", quality: "은은하게 타오르는 등불", description: "작은 변화나 사람의 기분을 잘 알아차리는 섬세함이 있어. 관심 있는 일에는 깊게 몰입하는 편이야. 다른 사람을 챙기듯 네 마음과 체력도 꼭 돌봐줘." },
    { name: "무", hanja: "戊", element: "토", polarity: "양", quality: "넓게 자리를 지키는 산", description: "안정감과 책임감이 있어 주변에서 믿고 의지하기 쉬워. 큰 그림을 보는 힘도 있지. 다만 익숙한 자리를 지키느라 새로운 기회를 지나치지 않도록 작은 변화를 허락해봐." },
    { name: "기", hanja: "己", element: "토", polarity: "음", quality: "생명을 키우는 따뜻한 흙", description: "사람과 일을 차분히 돌보고 실속 있게 정리하는 감각이 있어. 주변을 편하게 해주는 힘도 크지. 모두의 필요를 먼저 채우다 네 몫을 잊지 않도록 경계를 세우면 좋아." },
    { name: "경", hanja: "庚", element: "금", polarity: "양", quality: "단단하고 곧은 쇠", description: "결단력과 실행력이 있고, 아닌 것은 아니라고 말할 수 있어. 복잡한 문제를 정리하는 데 강하지. 빠른 판단이 누군가에게는 차갑게 들릴 수 있으니 설명을 한마디 보태면 좋아." },
    { name: "신", hanja: "辛", element: "금", polarity: "음", quality: "섬세하게 다듬은 보석", description: "기준이 분명하고 디테일을 놓치지 않아. 감각과 완성도를 살리는 재주도 있지. 스스로에게 너무 엄격해지기 쉬우니, 충분히 잘한 일도 알아봐 주는 게 필요해." },
    { name: "임", hanja: "壬", element: "수", polarity: "양", quality: "큰 흐름으로 움직이는 강물", description: "호기심이 넓고 새로운 생각과 사람을 받아들이는 폭이 커. 상황을 크게 보는 감각도 있지. 관심사가 많아 에너지가 흩어질 수 있으니 한 번에 한 가지씩 마무리해봐." },
    { name: "계", hanja: "癸", element: "수", polarity: "음", quality: "조용히 스며드는 빗물", description: "관찰력과 직감이 섬세하고, 말하지 않은 마음도 잘 읽는 편이야. 조용히 깊이를 쌓는 힘이 있어. 생각을 오래 품기보다 믿을 만한 사람과 나누면 마음이 한결 가벼워져." }
  ];
  const branches = [
    { name: "자", hanja: "子", animal: "쥐", element: "수" },
    { name: "축", hanja: "丑", animal: "소", element: "토" },
    { name: "인", hanja: "寅", animal: "호랑이", element: "목" },
    { name: "묘", hanja: "卯", animal: "토끼", element: "목" },
    { name: "진", hanja: "辰", animal: "용", element: "토" },
    { name: "사", hanja: "巳", animal: "뱀", element: "화" },
    { name: "오", hanja: "午", animal: "말", element: "화" },
    { name: "미", hanja: "未", animal: "양", element: "토" },
    { name: "신", hanja: "申", animal: "원숭이", element: "금" },
    { name: "유", hanja: "酉", animal: "닭", element: "금" },
    { name: "술", hanja: "戌", animal: "개", element: "토" },
    { name: "해", hanja: "亥", animal: "돼지", element: "수" }
  ];
  const elements = ["목", "화", "토", "금", "수"];
  const elementNames = {
    목: { title: "자라나는 힘", meaning: "새로운 시작, 배움, 관계를 넓히는 기운" },
    화: { title: "표현하고 밝히는 힘", meaning: "열정, 표현, 사람들 사이의 온기" },
    토: { title: "받쳐주고 익히는 힘", meaning: "안정, 꾸준함, 현실적인 정리" },
    금: { title: "가르고 맺는 힘", meaning: "기준, 결단, 완성도와 마무리" },
    수: { title: "흐르고 살피는 힘", meaning: "생각, 관찰, 지혜와 유연함" }
  };
  const jieTerms = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const jieNames = ["소한", "입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설"];
  const termCache = new Map();
  const monthNames = {
    "正月": 1, "一月": 1, "二月": 2, "三月": 3, "四月": 4, "五月": 5, "六月": 6,
    "七月": 7, "八月": 8, "九月": 9, "十月": 10, "冬月": 11, "十一月": 11,
    "腊月": 12, "臘月": 12, "十二月": 12
  };
  const chineseCalendar = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul"
  });

  function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function parseDate(value, isLunar) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!match) throw new Error("생년월일을 다시 확인해줘.");
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    // 음력은 달마다 29일 또는 30일이라 양력 달력으로 검사하지 않고 실제 변환 결과로 확인한다.
    const check = new Date(Date.UTC(year, month - 1, day, 12));
    const valid = isLunar
      ? month >= 1 && month <= 12 && day >= 1 && day <= 30
      : check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
    if (!valid) throw new Error("달력에 있는 날짜를 입력해줘.");
    if (year < 1901 || year > 2099) throw new Error("현재는 1901년부터 2099년까지의 생년월일을 계산할 수 있어.");
    return { year, month, day };
  }

  function lunarParts(date) {
    const parts = chineseCalendar.formatToParts(date);
    const values = {};
    parts.forEach((part) => { values[part.type] = part.value; });
    return values;
  }

  function tabulatedSolarDate(lunar, isLeapMonth) {
    const row = window.MikiLunarTable && window.MikiLunarTable[lunar.year];
    if (!row) return null;
    const leapMonth = Number(row.slice(0, 2));
    const lengths = row.slice(6);
    let stamp = Date.UTC(lunar.year, Number(row.slice(2, 4)) - 1, Number(row.slice(4, 6)), 12);
    for (let index = 0; index < lengths.length; index += 1) {
      // 윤달이 있으면 그 달 번호 바로 뒤에 한 칸이 더 들어간다.
      const monthNumber = leapMonth && index >= leapMonth ? index : index + 1;
      const isLeap = leapMonth > 0 && index === leapMonth;
      const days = lengths[index] === "1" ? 30 : 29;
      if (monthNumber === lunar.month && isLeap === Boolean(isLeapMonth)) {
        if (lunar.day > days) throw new Error(`그 음력 달은 ${days}일까지만 있어. 날짜를 확인해줘.`);
        const date = new Date(stamp + (lunar.day - 1) * 86400000);
        return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
      }
      stamp += days * 86400000;
    }
    throw new Error(isLeapMonth
      ? "그 해에는 입력한 윤달이 없어. 윤달 선택을 확인해줘."
      : "입력한 음력 날짜를 찾지 못했어. 날짜를 확인해줘.");
  }

  function toSolarDate(lunarDate, isLeapMonth) {
    const lunar = parseDate(lunarDate, true);
    const tabulated = tabulatedSolarDate(lunar, isLeapMonth);
    if (tabulated) return tabulated;
    if (!chineseCalendar || typeof chineseCalendar.formatToParts !== "function") {
      throw new Error("이 브라우저에서는 음력 날짜 변환을 지원하지 않아. 양력을 선택해줘.");
    }
    const start = Date.UTC(lunar.year, 0, 1, 12);
    const end = Date.UTC(lunar.year + 2, 0, 1, 12);
    for (let stamp = start; stamp < end; stamp += 86400000) {
      const date = new Date(stamp);
      const parts = lunarParts(date);
      const monthValue = parts.month || "";
      const leap = monthValue.includes("闰") || monthValue.includes("閏");
      const monthName = monthValue.replace(/[闰閏]/g, "");
      const monthNumber = monthNames[monthName];
      if (Number(parts.relatedYear) === lunar.year && monthNumber === lunar.month &&
          Number(parts.day) === lunar.day && leap === Boolean(isLeapMonth)) {
        return {
          year: date.getUTCFullYear(),
          month: date.getUTCMonth() + 1,
          day: date.getUTCDate()
        };
      }
    }
    throw new Error("입력한 음력 날짜를 찾지 못했어. 윤달 여부와 날짜를 확인해줘.");
  }

  function solarLongitude(timestamp) {
    const julianDay = timestamp / 86400000 + 2440587.5;
    const century = (julianDay - 2451545) / 36525;
    const meanLongitude = mod(280.46646 + 36000.76983 * century + 0.0003032 * century * century, 360);
    const meanAnomaly = mod(357.52911 + 35999.05029 * century - 0.0001537 * century * century, 360);
    const anomalyRadians = meanAnomaly * Math.PI / 180;
    const equationOfCenter =
      Math.sin(anomalyRadians) * (1.914602 - 0.004817 * century - 0.000014 * century * century) +
      Math.sin(2 * anomalyRadians) * (0.019993 - 0.000101 * century) +
      Math.sin(3 * anomalyRadians) * 0.000289;
    const omega = (125.04 - 1934.136 * century) * Math.PI / 180;
    return mod(meanLongitude + equationOfCenter - 0.00569 - 0.00478 * Math.sin(omega), 360);
  }

  // 1900~2100년은 검증된 절기 표(js/saju-terms.js)를 쓰고, 표가 없을 때만 천문 근사식으로 계산한다.
  function tabulatedTerm(year, index) {
    const row = window.MikiSolarTerms && window.MikiSolarTerms[year];
    if (!row || index % 2 !== 0) return null;
    const cell = row.slice((index / 2) * 8, (index / 2) * 8 + 8);
    return Date.UTC(year, Number(cell.slice(0, 2)) - 1, Number(cell.slice(2, 4)), Number(cell.slice(4, 6)) - 9, Number(cell.slice(6, 8)));
  }

  function solarTerm(year, index) {
    const key = `${year}-${index}`;
    if (termCache.has(key)) return termCache.get(key);
    const tabulated = tabulatedTerm(year, index);
    if (tabulated !== null) {
      termCache.set(key, tabulated);
      return tabulated;
    }
    const targetLongitude = mod(285 + index * 15, 360);
    const dayMilliseconds = 86400000;
    let estimate = Date.UTC(year, 0, 5, 12) + index * (365.2422 / 24) * dayMilliseconds;
    for (let iteration = 0; iteration < 5; iteration += 1) {
      const difference = mod(solarLongitude(estimate) - targetLongitude + 180, 360) - 180;
      estimate -= difference * dayMilliseconds / 0.98564736;
    }
    termCache.set(key, estimate);
    return estimate;
  }

  function sexagenary(stemIndex, branchIndex) {
    const cycleIndex = Array.from({ length: 60 }, (_, index) => index).find((index) =>
      index % 10 === mod(stemIndex, 10) && index % 12 === mod(branchIndex, 12));
    return {
      cycleIndex,
      stemIndex: mod(stemIndex, 10),
      branchIndex: mod(branchIndex, 12),
      stem: stems[mod(stemIndex, 10)],
      branch: branches[mod(branchIndex, 12)]
    };
  }

  function julianDay(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function calculate(input) {
    const enteredDate = parseDate(input.birthDate, input.calendar === "lunar");
    const solarDate = input.calendar === "lunar"
      ? toSolarDate(input.birthDate, input.leapMonth)
      : enteredDate;
    const hasTime = Boolean(input.birthTime);
    const timeParts = hasTime ? /^([01]\d|2[0-3]):([0-5]\d)$/.exec(input.birthTime) : null;
    if (hasTime && !timeParts) throw new Error("태어난 시간을 다시 확인해줘.");
    const hour = timeParts ? Number(timeParts[1]) : 12;
    const minute = timeParts ? Number(timeParts[2]) : 0;
    const birthInstant = Date.UTC(solarDate.year, solarDate.month - 1, solarDate.day, hour - 9, minute);

    let pillarYear = solarDate.year;
    if (birthInstant < solarTerm(solarDate.year, 2)) pillarYear -= 1;
    const yearPillar = sexagenary(pillarYear - 4, pillarYear - 4);

    const monthTerm = [solarDate.year - 1, solarDate.year].flatMap((termYear) =>
      jieTerms.map((index) => ({ year: termYear, index, time: solarTerm(termYear, index) }))
    ).filter((term) => term.time <= birthInstant)
      .sort((a, b) => b.time - a.time)[0];
    if (!monthTerm) throw new Error("절기 정보를 계산하지 못했어. 날짜를 확인해줘.");
    const monthBranchIndex = mod(monthTerm.index / 2 + 1, 12);
    const monthOrder = mod(monthBranchIndex - 2, 12);
    const monthStemIndex = mod((yearPillar.stemIndex % 5) * 2 + 2 + monthOrder, 10);
    const monthPillar = sexagenary(monthStemIndex, monthBranchIndex);

    let dayNumber = julianDay(solarDate.year, solarDate.month, solarDate.day);
    if (hasTime && hour === 23) dayNumber += 1;
    const dayPillar = sexagenary(dayNumber + 49, dayNumber + 49);
    const hourBranchIndex = hasTime ? mod(Math.floor((hour + 1) / 2), 12) : null;
    const hourPillar = hasTime
      ? sexagenary((dayPillar.stemIndex % 5) * 2 + hourBranchIndex, hourBranchIndex)
      : null;

    const pillars = [
      { key: "year", label: "년주", focus: "어릴 때의 환경과 처음 만나는 사람들에게 비치는 모습", pillar: yearPillar },
      { key: "month", label: "월주", focus: "사회생활과 일하는 방식, 익숙하게 자리 잡은 태도", pillar: monthPillar },
      { key: "day", label: "일주", focus: "너의 중심 성향과 가까운 관계에서의 모습", pillar: dayPillar }
    ];
    if (hourPillar) pillars.push({ key: "hour", label: "시주", focus: "마음속 바람과 시간이 갈수록 키워가는 관심", pillar: hourPillar });

    const counts = Object.fromEntries(elements.map((element) => [element, 0]));
    pillars.forEach(({ pillar }) => {
      counts[pillar.stem.element] += 1;
      counts[pillar.branch.element] += 1;
    });

    // 태어난 시간을 모르면 정오로 계산하므로, 그날 절기가 바뀌면 연주·월주가 시각에 따라 달라질 수 있다.
    let termBoundary = null;
    if (!hasTime) {
      [solarDate.year - 1, solarDate.year, solarDate.year + 1].some((termYear) => jieTerms.some((index) => {
        const stamp = solarTerm(termYear, index);
        if (stamp === undefined || Number.isNaN(stamp)) return false;
        const kst = new Date(stamp + 9 * 3600000);
        if (kst.getUTCFullYear() === solarDate.year && kst.getUTCMonth() + 1 === solarDate.month && kst.getUTCDate() === solarDate.day) {
          termBoundary = {
            name: jieNames[index / 2], isLiChun: index === 2,
            hour: kst.getUTCHours(), minute: kst.getUTCMinutes()
          };
          return true;
        }
        return false;
      }));
    }
    const timeCaution = hasTime && (solarDate.year < 1912 ||
      (solarDate.year >= 1948 && solarDate.year <= 1951) ||
      (solarDate.year >= 1954 && solarDate.year <= 1961) ||
      (solarDate.year >= 1987 && solarDate.year <= 1988))
      ? "이 시기에는 한국의 표준시나 서머타임이 지금과 달랐던 구간이 있어. 입력한 시각을 그대로 한국 표준시(UTC+9)로 계산했고 당시 시각 보정은 적용하지 않았어. 시주가 경계에 가까우면 만세력 기준에 따라 달라질 수 있어."
      : "";

    return {
      solarDate,
      enteredDate,
      calendar: input.calendar,
      leapMonth: Boolean(input.leapMonth),
      birthTime: hasTime ? input.birthTime : "",
      hasTime,
      termBoundary,
      timeCaution,
      monthTerm: { year: monthTerm.year, index: monthTerm.index, time: monthTerm.time },
      birthInstant,
      pillarYear,
      dayChangedAtZi: hasTime && hour === 23,
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      pillars,
      counts,
      chartCharacters: pillars.map(({ pillar }) => [pillar.stem, pillar.branch]).flat()
    };
  }

  function tenGod(dayStem, otherStem) {
    const dayElement = elements.indexOf(dayStem.element);
    const otherElement = elements.indexOf(otherStem.element);
    const samePolarity = dayStem.polarity === otherStem.polarity;
    if (dayElement === otherElement) return samePolarity ? "비견" : "겁재";
    if (mod(dayElement + 1, 5) === otherElement) return samePolarity ? "식신" : "상관";
    if (mod(dayElement + 2, 5) === otherElement) return samePolarity ? "편재" : "정재";
    if (mod(otherElement + 2, 5) === dayElement) return samePolarity ? "편관" : "정관";
    return samePolarity ? "편인" : "정인";
  }

  function elementReading(element, count, dayStem) {
    const name = elementNames[element];
    if (count === 0) {
      return `${name.title}이 겉으로 드러난 글자에는 없어. 이 기운이 없다는 뜻은 아니고, 처음부터 자동으로 쓰기보다 의식적으로 보충하면 좋은 부분이야. ${name.meaning}이 필요한 순간에 작은 습관으로 챙겨봐.`;
    }
    if (count >= 3) {
      return `${name.title}이 ${count}개로 도드라져 있어. ${name.meaning}을 자연스럽게 잘 쓰는 편이야. 강점이 지나치면 한쪽으로 치우칠 수 있으니, ${element === dayStem.element ? "네 중심 기운을 충분히 쉬게 하고 다른 방식도 받아들이면" : "반대 성향의 사람이나 방법도 함께 살피면"} 균형이 좋아져.`;
    }
    return `${name.title}이 ${count}개 보여. ${name.meaning}을 필요할 때 차분히 꺼내 쓸 수 있는 구성이야. 이 기운을 작은 행동으로 자주 이어가면 장점이 더 잘 살아나.`;
  }

  function interpretations(chart) {
    const dayStem = chart.dayPillar.stem;
    const dayElementIndex = elements.indexOf(dayStem.element);
    const outputElement = elements[(dayElementIndex + 1) % 5];
    const wealthElement = elements[(dayElementIndex + 2) % 5];
    const supportElement = elements[(dayElementIndex + 4) % 5];
    const controlElement = elements[(dayElementIndex + 3) % 5];
    const pillarTexts = {
      year: "년주는 사주의 바탕과 첫인상을 상징해. 이 글자가 네 전부를 정해주는 건 아니지만, 새로운 사람이나 환경을 만날 때 익숙하게 보이는 분위기를 보여줘.",
      month: "월주는 계절의 기운과 사회생활의 바탕을 보는 자리야. 맡은 역할을 어떻게 익히고, 일과 관계에서 어떤 환경에 편안함을 느끼는지 살펴볼 때 참고해.",
      day: "일주는 너 자신을 보는 중심 자리야. 위쪽 글자인 일간을 ‘나를 비추는 등불’처럼 보고, 아래쪽 글자는 가까운 관계에서 만나기 쉬운 분위기를 함께 살펴봐.",
      hour: "시주는 속으로 품은 바람과 앞으로 키워갈 관심을 살펴보는 자리야. 태어난 시간을 모르면 정확히 채울 수 없어서 이번 풀이에서는 빼고 계산했어."
    };
    const elementsText = elements.map((element) => elementReading(element, chart.counts[element], dayStem));
    const strongest = elements.filter((element) => chart.counts[element] === Math.max(...Object.values(chart.counts)));
    const weakest = elements.filter((element) => chart.counts[element] === Math.min(...Object.values(chart.counts)));
    const balance = strongest.length === elements.length
      ? "다섯 기운이 고르게 보여. 한 가지 방식에 갇히지 않고 상황에 맞춰 여러 면을 활용할 수 있는 구성이야."
      : `겉으로 드러난 글자에서는 ${strongest.join("·")} 기운이 비교적 많고, ${weakest.join("·")} 기운은 적게 보여. 이건 좋고 나쁨의 점수가 아니야. 익숙한 장점을 살리면서 부족한 쪽은 습관으로 채우면 돼.`;
    const relationship = `${dayStem.name} 일간의 너는 ${dayStem.description.split(".")[0]} 가까운 사이일수록 마음을 알아서 알아주길 바라기보다, 원하는 것과 고마운 점을 말로 나눠보면 관계가 훨씬 편안해져.`;
    const work = `일이나 공부에서는 ${elementNames[outputElement].meaning.split(",")[0]}을 살릴 수 있는 역할이 잘 맞는 편이야. ${dayStem.element} 기운을 바탕으로 네 방식대로 집중하되, ${outputElement} 기운처럼 결과를 밖으로 표현하고 마무리하는 흐름까지 챙겨봐. 잘하는 일을 꾸준히 보여주는 게 큰 힘이 돼.`;
    const money = `${elementNames[wealthElement].meaning.split(",")[0]}과 연결되는 기운은 네가 결과와 자원을 다루는 방식을 생각해보는 참고점이야. 큰 결정을 운세만으로 정하기보다는, 네가 감당할 수 있는 계획인지 확인하고 기록하는 습관이 도움이 돼.`;
    const wellbeing = `마음이 바쁠 때는 ${elementNames[supportElement].meaning.split(",")[0]}을 회복하는 시간을 먼저 마련해봐. 반대로 한 가지 생각에 오래 갇힐 때는 ${elementNames[controlElement].meaning.split(",")[0]}의 방식으로 우선순위를 정하고 작게 실행하면 균형을 잡기 좋아.`;
    const advice = `너의 일간은 ‘${dayStem.quality}’에 비유할 수 있어. 이미 가진 방식이 분명하니 다른 사람과 비교하기보다, 그 힘을 언제 쓰고 언제 내려놓을지 알아가는 게 중요해. 이번 달에는 네가 잘하는 일 하나를 정해 작게 끝까지 해보자.`;
    return {
      dayStem,
      balance,
      elementTexts: elementsText,
      pillarTexts,
      relationship,
      work,
      money,
      wellbeing,
      advice,
      strongest,
      tenGods: chart.pillars.map(({ label, pillar }) => ({
        label,
        stem: pillar.stem,
        relation: tenGod(dayStem, pillar.stem)
      }))
    };
  }

  function annualPillar(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric"
    }).formatToParts(date || new Date());
    const values = {};
    parts.forEach((part) => { values[part.type] = Number(part.value); });
    const year = values.year;
    const instant = (date || new Date()).getTime();
    const pillarYear = year - (instant < solarTerm(year, 2) ? 1 : 0);
    return {
      ...sexagenary(pillarYear - 4, pillarYear - 4),
      year: pillarYear
    };
  }

  function salSigns(chart) {
    const groups = [
      { branches: [8, 0, 4], peach: 9, travel: 2, canopy: 4 },
      { branches: [2, 6, 10], peach: 3, travel: 8, canopy: 10 },
      { branches: [5, 9, 1], peach: 6, travel: 11, canopy: 1 },
      { branches: [11, 3, 7], peach: 0, travel: 5, canopy: 7 }
    ];
    const referenceGroups = [
      groups.find((group) => group.branches.includes(chart.yearPillar.branchIndex)),
      groups.find((group) => group.branches.includes(chart.dayPillar.branchIndex))
    ].filter((group, index, all) => group && all.indexOf(group) === index);
    const branchesInChart = chart.pillars.map(({ pillar }) => pillar.branchIndex);
    const signs = [
      { key: "peach", name: "도화살", index: "peach", title: "호감과 표현력", description: "사람들의 시선을 모으고 매력을 표현하는 힘을 상징해. 존재감이 있다는 뜻으로 받아들이고, 다른 사람의 기대에 맞추느라 너를 잃지 않는 게 중요해." },
      { key: "travel", name: "역마살", index: "travel", title: "이동과 변화의 힘", description: "익숙한 곳을 벗어나 배우고 움직이는 기운을 상징해. 변화가 꼭 불안정함을 뜻하진 않아. 새로운 환경에서 기회를 찾는 추진력으로 활용해봐." },
      { key: "canopy", name: "화개살", index: "canopy", title: "깊이와 몰입", description: "한 가지를 깊이 생각하고 자기만의 세계를 가꾸는 기운을 상징해. 혼자만의 시간이 창작과 공부의 힘이 될 수 있어. 다만 마음을 나눌 사람도 곁에 두면 좋아." }
    ];
    return signs.map((sign) => {
      const branchIndexes = [...new Set(referenceGroups.map((group) => group[sign.index]))];
      const foundAt = chart.pillars
        .filter(({ pillar }) => branchIndexes.includes(pillar.branchIndex))
        .map(({ label }) => label);
      const matchedBranchIndex = branchesInChart.find((branchIndex) => branchIndexes.includes(branchIndex));
      return {
        ...sign,
        branchIndexes,
        branches: branchIndexes.map((branchIndex) => branches[branchIndex]),
        branch: branches[matchedBranchIndex === undefined ? branchIndexes[0] : matchedBranchIndex],
        present: foundAt.length > 0,
        foundAt
      };
    });
  }

  // 대운: 성별(남/여)과 년간의 음양으로 순행·역행을 정하고, 태어난 시각에서 가장 가까운 절(節)까지의 시간을
  // '3일 = 1년'으로 환산해 시작 나이를 구한다. 만 나이 기준이며 이 사이트의 계산 규칙이다.
  function daewoon(chart, gender, nowInstant) {
    if (gender !== "male" && gender !== "female") return null;
    const yearYang = chart.yearPillar.stem.polarity === "양";
    const forward = (gender === "male") === yearYang;
    const terms = [chart.solarDate.year - 1, chart.solarDate.year, chart.solarDate.year + 1]
      .flatMap((year) => jieTerms.map((index) => solarTerm(year, index)))
      .sort((a, b) => a - b);
    const target = forward
      ? terms.find((time) => time > chart.birthInstant)
      : [...terms].reverse().find((time) => time <= chart.birthInstant);
    const minutes = Math.round(Math.abs(target - chart.birthInstant) / 60000);
    let rest = minutes;
    const years = Math.floor(rest / 4320); rest -= years * 4320;
    const months = Math.floor(rest / 360); rest -= months * 360;
    const days = Math.floor(rest / 12);
    const birth = new Date(Date.UTC(chart.solarDate.year, chart.solarDate.month - 1, chart.solarDate.day));
    const startDate = new Date(birth);
    startDate.setUTCFullYear(startDate.getUTCFullYear() + years);
    startDate.setUTCMonth(startDate.getUTCMonth() + months);
    startDate.setUTCDate(startDate.getUTCDate() + days);
    const base = chart.monthPillar;
    const direction = forward ? 1 : -1;
    const now = new Date((nowInstant || Date.now()) + 9 * 3600000);
    const steps = Array.from({ length: 10 }, (_, index) => {
      const pillar = sexagenary(base.stemIndex + direction * (index + 1), base.branchIndex + direction * (index + 1));
      const from = new Date(startDate);
      from.setUTCFullYear(from.getUTCFullYear() + index * 10);
      const to = new Date(startDate);
      to.setUTCFullYear(to.getUTCFullYear() + index * 10 + 10);
      return { index, pillar, startAge: years + index * 10, startYear: from.getUTCFullYear(), from, to };
    });
    const current = steps.find((step) => step.from <= now && now < step.to) || null;
    return {
      forward, years, months, days, startDate, steps, current,
      beforeStart: now < startDate,
      approximate: !chart.hasTime
    };
  }

  window.SajuCore = Object.freeze({
    calculate,
    daewoon,
    interpretations,
    annualPillar,
    salSigns,
    solarTerm,
    sexagenary,
    tenGod,
    jieNames,
    stems,
    branches,
    elements,
    elementNames
  });
}());
