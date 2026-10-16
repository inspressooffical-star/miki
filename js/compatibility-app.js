(function () {
  "use strict";

  const root = document.querySelector("[data-compatibility-app]");
  if (!root) return;

  const message = document.getElementById("compatibility-message");
  const empty = document.getElementById("compatibility-empty");
  const panel = document.getElementById("compatibility-panel");
  const result = document.getElementById("compatibility-result");
  const client = window.MikiSupabase.client;
  if (!window.MikiSupabase.configured || !client) {
    empty.hidden = false;
    empty.querySelector("h2").textContent = "먼저 Supabase를 연결해줘";
    empty.querySelector("p").textContent = window.MikiSupabase.setupMessage;
    showMessage(window.MikiSupabase.setupMessage, "error");
    return;
  }

  client.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      if (session) loadProfiles();
      else showLoginRequired();
    }, 0);
  });
  client.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    if (data.session) loadProfiles();
    else showLoginRequired();
  }).catch((error) => showMessage(error.message || "로그인 정보를 확인하지 못했어.", "error"));

  document.getElementById("compatibility-submit").addEventListener("click", () => {
    const firstId = document.getElementById("compatibility-first").value;
    const secondId = document.getElementById("compatibility-second").value;
    if (!firstId || !secondId) {
      showMessage("궁합을 볼 명식 두 개를 선택해줘.", "error");
      return;
    }
    if (firstId === secondId) {
      showMessage("서로 다른 명식 두 개를 골라줘.", "error");
      return;
    }
    const first = profiles.find((profile) => profile.id === firstId);
    const second = profiles.find((profile) => profile.id === secondId);
    if (!first || !second) {
      showMessage("선택한 명식을 찾지 못했어. 목록을 새로고침해줘.", "error");
      return;
    }
    render(window.MikiCompatibility.interpret(first, second));
  });

  let profiles = [];
  async function loadProfiles() {
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        showLoginRequired();
        return;
      }
      const { data, error } = await client.from("saju_profiles")
        .select("id,user_id,name,gender,birth_date,calendar,leap_month,birth_time,is_default")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      profiles = data;
      if (profiles.length < 2) {
        empty.hidden = false;
        panel.hidden = true;
        empty.querySelector("h2").textContent = "명식 두 개가 필요해";
        empty.querySelector("p").textContent = "내 명식과 궁합을 볼 상대의 명식을 먼저 등록해줘.";
        empty.querySelector("a").textContent = profiles.length ? "상대 명식 추가하기" : "로그인하고 명식 등록하기";
        empty.querySelector("a").href = "member.html";
        return;
      }
      empty.hidden = true;
      panel.hidden = false;
      const defaultIndex = Math.max(0, profiles.findIndex((profile) => profile.is_default));
      populateSelect(document.getElementById("compatibility-first"), profiles, defaultIndex);
      populateSelect(document.getElementById("compatibility-second"), profiles, defaultIndex === 0 ? 1 : 0);
    } catch (error) {
      showMessage(error.code === "42P01" || error.code === "PGRST205"
        ? "명식 저장 테이블을 찾지 못했어. Supabase에서 supabase/schema.sql을 실행해줘."
        : error.message || "명식을 불러오지 못했어.", "error");
    }
  }

  function populateSelect(select, items, selectedIndex) {
    select.replaceChildren();
    items.forEach((profile, index) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = `${profile.name}${profile.is_default ? " · 기본 명식" : ""}`;
      option.selected = index === selectedIndex;
      select.append(option);
    });
  }

  function render(reading) {
    result.replaceChildren();
    result.hidden = false;
    result.append(make("section", "service-reading-hero"));
    const intro = result.querySelector(".service-reading-hero");
    intro.append(make("span", "mini-kicker", "두 사람의 일간으로 살펴본 관계"));
    intro.append(make("h2", "", `${reading.first.profile.name} 님과 ${reading.second.profile.name} 님 · ${reading.relationship}`));
    intro.append(make("p", "", reading.relationshipText));

    const pillars = make("div", "compatibility-pillar-grid");
    [reading.first, reading.second].forEach((person) => {
      const card = make("article", "compatibility-person-card");
      card.append(make("span", "reading-kicker", person.profile.name));
      card.append(make("strong", "compatibility-person-pillar",
        `${person.dayStem.hanja} (${person.dayStem.name})`));
      card.append(make("p", "", person.dayStem.description));
      pillars.append(card);
    });
    result.append(pillars);

    const topics = make("div", "service-topic-grid compatibility-topics");
    appendTopic(topics, "두 사람의 차이", "서로의 기운", reading.relationshipText);
    appendTopic(topics, "함께 가진 점", "오행의 공통점", reading.balance);
    appendTopic(topics, "대화의 힌트", "마음을 전하는 방법", reading.communication);
    appendTopic(topics, "함께 기억할 점", "좋은 관계를 위한 제안", reading.advice);
    result.append(topics);
    const note = make("p", "service-disclaimer",
      "이 풀이는 두 명식의 일간과 겉으로 드러난 오행을 바탕으로 한 전통적 참고 이야기야. 점수나 궁합의 좋고 나쁨을 단정하지 않으며, 성별을 이유로 관계를 예측하지 않아. 실제 관계는 서로의 대화와 선택이 가장 중요해.");
    result.append(note);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    showMessage("", "");
  }

  function appendTopic(parent, kicker, title, text) {
    const card = make("article", "service-topic-card");
    card.append(make("span", "reading-kicker", kicker));
    card.append(make("h3", "", title));
    card.append(make("p", "", text));
    parent.append(card);
  }

  function showLoginRequired() {
    empty.hidden = false;
    panel.hidden = true;
    empty.querySelector("h2").textContent = "로그인 후 궁합을 볼 수 있어";
    empty.querySelector("p").textContent = "계정에 저장한 명식 두 개를 선택하면 두 사람의 기운을 함께 살펴볼게.";
    empty.querySelector("a").textContent = "로그인하고 명식 등록하기";
    empty.querySelector("a").href = "member.html";
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = type ? `member-message is-${type}` : "member-message";
  }
}());
