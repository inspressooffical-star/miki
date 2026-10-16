(function () {
  "use strict";

  const client = window.MikiSupabase && window.MikiSupabase.client;
  if (!client) return;

  const accountLink = document.getElementById("home-member-link");
  const actionLink = document.getElementById("home-profile-action");
  const state = document.getElementById("home-profile-state");
  const summary = document.getElementById("home-profile-summary");
  if (!accountLink || !actionLink || !state || !summary) return;

  client.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      if (session) loadMemberHome(session.user);
      else renderSignedOut();
    }, 0);
  });
  client.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    if (data.session) loadMemberHome(data.session.user);
    else renderSignedOut();
  }).catch(() => renderSignedOut());

  async function loadMemberHome(user) {
    accountLink.querySelector("span:last-child").textContent = "내 명식";
    actionLink.textContent = "명식 등록하기 ↗";
    const { data, error } = await client.from("saju_profiles")
      .select("id,name,gender,birth_date,calendar,leap_month,birth_time,is_default")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      state.textContent = "명식을 불러오지 못했어.";
      summary.textContent = error.code === "42P01" || error.code === "PGRST205"
        ? "Supabase에서 명식 저장 테이블을 설정해줘."
        : "계정 페이지에서 연결 상태를 확인해줘.";
      return;
    }
    if (!data.length) {
      window.Miki.clearInput(true);
      state.textContent = "명식 미등록";
      summary.textContent = "로그인한 뒤 명식을 등록하면 여기에 네 사주가 보여.";
      return;
    }
    const profile = data.find((item) => item.is_default) || data[0];
    try {
      const input = {
        birthDate: profile.birth_date,
        calendar: profile.calendar,
        leapMonth: profile.leap_month,
        birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : ""
      };
      const chart = window.SajuCore.calculate(input);
      window.Miki.setInput(input, { name: profile.name, gender: profile.gender, source: "account" });
      state.textContent = `${profile.name}${profile.is_default ? " · 기본 명식" : ""}`;
      summary.textContent = `저장된 명식 ${data.length}개 · ${profile.gender === "female" ? "여성" : profile.gender === "male" ? "남성" : "성별 선택 안 함"}`;
      const chartByKey = new Map(chart.pillars.map(({ key, pillar }) => [key, pillar]));
      ["year", "month", "day", "hour"].forEach((key) => {
        const pillar = chartByKey.get(key);
        document.querySelector(`[data-home-pillar="${key}"]`).textContent =
          pillar ? `${pillar.stem.hanja}${pillar.branch.hanja}` : "미상";
        document.querySelector(`[data-home-reading="${key}"]`).textContent =
          pillar ? `(${pillar.stem.name}${pillar.branch.name})` : "시간 미입력";
      });
      document.querySelector(".pillars-card").classList.add("has-registered-profile");
    } catch (calculationError) {
      state.textContent = `${profile.name} 명식`;
      summary.textContent = calculationError.message || "저장된 명식을 계산하지 못했어.";
    }
  }

  function renderSignedOut() {
    window.Miki.clearInput(true);
    accountLink.querySelector("span:last-child").textContent = "로그인";
    actionLink.textContent = "로그인하기 ↗";
    state.textContent = "로그인 후 명식 등록하기";
    summary.textContent = "회원가입 후 명식을 등록하면 언제든 다시 불러올 수 있어요.";
  }
}());
