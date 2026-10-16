(function () {
  "use strict";

  const config = window.MIKI_SUPABASE_CONFIG;
  const configured = Boolean(
    config &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url) &&
    config.anonKey &&
    config.anonKey !== "YOUR_SUPABASE_ANON_KEY"
  );

  window.MikiSupabase = Object.freeze({
    configured,
    client: configured && window.supabase
      ? window.supabase.createClient(config.url, config.anonKey, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      })
      : null,
    setupMessage: "Supabase 설정이 아직 연결되지 않았어. js/supabase-config.js에 프로젝트 주소와 공개 키를 입력하고 supabase/schema.sql을 실행해줘."
  });
}());
