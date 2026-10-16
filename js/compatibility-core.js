(function () {
  "use strict";

  const elements = window.SajuCore.elements;
  const generating = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  const controlling = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };

  function interpret(firstProfile, secondProfile) {
    const first = window.SajuCore.calculate(toInput(firstProfile));
    const second = window.SajuCore.calculate(toInput(secondProfile));
    const left = first.dayPillar.stem;
    const right = second.dayPillar.stem;
    const relationship = relationshipText(left.element, right.element);
    const firstStrength = dominantElements(first);
    const secondStrength = dominantElements(second);
    const shared = firstStrength.filter((element) => secondStrength.includes(element));

    const balance = shared.length
      ? `두 명식에 ${shared.join("·")} 기운이 함께 보여. 익숙한 감각을 공유하며 금방 가까워질 수 있고, 서로 같은 방식에만 기대지 않도록 새로운 관점도 함께 받아들이면 좋아.`
      : `두 명식에서 두드러지는 기운이 서로 달라. 각자 잘하는 방식이 달라 역할을 나누기 좋고, 다름을 틀림으로 받아들이지 않는 대화가 관계를 편하게 해줘.`;
    const communication = `${firstProfile.name}은 ${left.quality} 같은 ${left.name} 일간이고, ${secondProfile.name}은 ${right.quality} 같은 ${right.name} 일간이야. ${left.description.split(".")[0]} ${right.description.split(".")[0]} 서로의 표현 방식이 다를 수 있으니, 마음을 추측하기보다 원하는 걸 구체적으로 말해보자.`;
    const advice = `${relationship.advice} 궁합은 한 사람에게 맞추는 시험이 아니야. 각자의 속도와 경계를 존중하고, 중요한 결정은 둘이 나눈 대화와 현실적인 상황을 바탕으로 함께 정해봐.`;

    return {
      first: { profile: firstProfile, chart: first, dayStem: left },
      second: { profile: secondProfile, chart: second, dayStem: right },
      relationship: relationship.title,
      relationshipText: relationship.description,
      balance,
      communication,
      advice,
      sharedElements: shared
    };
  }

  function relationshipText(first, second) {
    if (first === second) {
      return {
        title: "비슷한 결을 나누는 사이",
        description: `${first} 기운이 같은 방향으로 흐르는 조합이야. 서로의 관심사와 속도를 이해하기 쉬운 만큼, 익숙한 방식만 고집하지 않고 새로운 선택도 함께 시도해봐.`,
        advice: "비슷한 점은 편안한 연결고리가 될 수 있어. 누가 더 잘하는지 겨루기보다 각자의 장점을 인정하고, 다른 의견도 안전하게 말할 시간을 만들어봐."
      };
    }
    if (generating[first] === second) {
      return {
        title: "한쪽이 다른 쪽을 북돋는 흐름",
        description: `${first}의 기운이 ${second}의 기운을 돕는 전통적인 상생 관계로 읽을 수 있어. 한 사람이 아이디어나 활력을 보태고 다른 사람이 그것을 키워가는 협력이 잘 어울려.`,
        advice: "도와주는 역할이 한쪽에만 고정되지 않게 서로의 기여를 확인해줘. 받는 사람도 고마움과 자기 생각을 표현하면 더 균형 잡힌 관계가 돼."
      };
    }
    if (generating[second] === first) {
      return {
        title: "서로의 가능성을 살려주는 흐름",
        description: `${second}의 기운이 ${first}의 기운을 돕는 상생 관계로 볼 수 있어. 서로 다른 재능을 연결하면 혼자서는 떠올리기 어려웠던 방법을 찾는 데 도움이 될 수 있어.`,
        advice: "도와주는 역할이 한쪽에만 고정되지 않게 서로의 기여를 확인해줘. 받는 사람도 고마움과 자기 생각을 표현하면 더 균형 잡힌 관계가 돼."
      };
    }
    if (controlling[first] === second || controlling[second] === first) {
      return {
        title: "서로의 기준을 조율하며 자라는 흐름",
          description: `${first}·${second} 기운 사이에는 전통적으로 조절과 균형을 뜻하는 관계도 있어. 관점 차이가 생길 수 있지만, 서로에게 없는 기준을 배우는 계기로 삼을 수도 있어.`,
        advice: "누가 옳은지 빨리 결론 내리기보다 무엇이 걱정되는지 먼저 들어봐. 부탁과 경계를 분명히 말하고, 둘 다 받아들일 수 있는 작은 합의부터 찾아보자."
      };
    }
    return {
      title: "서로 다른 리듬을 맞춰가는 사이",
      description: `${first}·${second} 기운이 바로 같은 방향으로 이어지진 않아. 함께 있을 때 새로운 관점을 배울 수 있고, 공통의 목표를 정하면 관계에 좋은 기준점이 생겨.`,
      advice: "서로의 방식을 바꾸려 하기보다 각자 편한 속도를 먼저 나눠봐. 함께할 일과 혼자 결정할 일을 구분하면 부담이 줄어들어."
    };
  }

  function dominantElements(chart) {
    const max = Math.max(...elements.map((element) => chart.counts[element]));
    return elements.filter((element) => chart.counts[element] === max);
  }

  function toInput(profile) {
    return {
      birthDate: profile.birth_date,
      calendar: profile.calendar,
      leapMonth: profile.leap_month,
      birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : ""
    };
  }

  window.MikiCompatibility = Object.freeze({ interpret });
}());
