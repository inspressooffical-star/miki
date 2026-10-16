// 브라우저 검사 전용 가짜 Supabase 클라이언트 (배포 파일 아님)
(function () {
  const KEY = "__fakeDb";
  const load = () => JSON.parse(localStorage.getItem(KEY) || '{"users":[],"session":null,"tables":{"saju_profiles":[],"member_profiles":[]}}');
  const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
  const listeners = [];
  const emit = (event, session) => listeners.forEach((fn) => fn(event, session));
  const uid = () => "u-" + Math.random().toString(36).slice(2, 10);
  const err = (message, extra) => ({ message, ...extra });
  const sessionOf = (user) => ({ user: { id: user.id, email: user.email, user_metadata: user.meta || {} } });

  function builder(table) {
    const state = { op: "select", filters: [], payload: null, single: false, maybe: false, orderBy: null, returning: false };
    const api = {
      select() { if (state.op !== "select") state.returning = true; return api; },
      insert(p) { state.op = "insert"; state.payload = p; return api; },
      update(p) { state.op = "update"; state.payload = p; return api; },
      upsert(p) { state.op = "upsert"; state.payload = p; return api; },
      delete() { state.op = "delete"; return api; },
      eq(k, v) { state.filters.push([k, v]); return api; },
      order(k, o) { state.orderBy = [k, o && o.ascending]; return api; },
      single() { state.single = true; return api; },
      maybeSingle() { state.maybe = true; return api; },
      then(res, rej) { return run().then(res, rej); }
    };
    async function run() {
      await new Promise((r) => setTimeout(r, window.__fakeDelay || 30));
      if (window.__fakeFail && window.__fakeFail[table + ":" + state.op]) {
        return { data: null, error: err(window.__fakeFail[table + ":" + state.op], { code: "XX000" }) };
      }
      const db = load();
      const rows = db.tables[table] || (db.tables[table] = []);
      const match = (r) => state.filters.every(([k, v]) => r[k] === v);
      const sess = db.session;
      if (!sess) return { data: null, error: err("no session", { code: "42501" }) };
      let out;
      if (state.op === "select") out = rows.filter(match);
      else if (state.op === "insert") {
        const row = { id: uid(), created_at: new Date().toISOString(), ...state.payload };
        if (table === "saju_profiles" && row.user_id !== sess.user.id) return { data: null, error: err("rls", { code: "42501" }) };
        if (row.client_key && rows.some((r) => r.user_id === row.user_id && r.client_key === row.client_key)) {
          return { data: null, error: err('duplicate key value violates unique constraint "saju_profiles_user_client_key"', { code: "23505" }) };
        }
        rows.push(row); out = [row];
      } else if (state.op === "update") {
        out = rows.filter(match); out.forEach((r) => Object.assign(r, state.payload));
      } else if (state.op === "delete") {
        out = rows.filter(match); db.tables[table] = rows.filter((r) => !match(r));
      } else if (state.op === "upsert") {
        const ex = rows.find((r) => r.user_id === state.payload.user_id);
        if (ex) Object.assign(ex, state.payload); else rows.push({ ...state.payload });
        out = [state.payload];
      }
      save(db);
      if (state.orderBy) out = out.slice().sort((a, b) => String(a[state.orderBy[0]]).localeCompare(String(b[state.orderBy[0]])));
      if (state.single) return out.length === 1 ? { data: out[0], error: null } : { data: null, error: err("expected one row") };
      if (state.maybe) return { data: out[0] || null, error: null };
      return { data: out, error: null };
    }
    return api;
  }

  const auth = {
    async getSession() { const db = load(); return { data: { session: db.session }, error: null }; },
    async getUser() { const db = load(); return { data: { user: db.session && db.session.user }, error: db.session ? null : err("no") }; },
    onAuthStateChange(fn) {
      listeners.push(fn);
      setTimeout(() => fn("INITIAL_SESSION", load().session), 0);
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signInWithPassword({ email, password }) {
      await new Promise((r) => setTimeout(r, 30));
      const db = load();
      const user = db.users.find((u) => u.email === email && u.password === password && u.verified);
      if (!user) return { data: {}, error: err("Invalid login credentials", { status: 400 }) };
      db.session = sessionOf(user); save(db); emit("SIGNED_IN", db.session);
      return { data: { session: db.session }, error: null };
    },
    async signUp({ email, password, options }) {
      await new Promise((r) => setTimeout(r, 30));
      const db = load();
      if (db.users.some((u) => u.email === email)) return { data: { user: { identities: [] }, session: null }, error: null };
      const user = { id: uid(), email, password, meta: (options && options.data) || {}, verified: !/verify/.test(email) };
      db.users.push(user);
      if (user.verified) {
        db.session = sessionOf(user); save(db); emit("SIGNED_IN", db.session);
        return { data: { user: { identities: [{}] }, session: db.session }, error: null };
      }
      save(db);
      return { data: { user: { identities: [{}] }, session: null }, error: null };
    },
    async signOut() { const db = load(); db.session = null; save(db); emit("SIGNED_OUT", null); return { error: null }; },
    async updateUser({ data }) {
      const db = load(); if (!db.session) return { error: err("no") };
      const user = db.users.find((u) => u.id === db.session.user.id);
      user.meta = { ...user.meta, ...data }; db.session = sessionOf(user); save(db);
      return { data: {}, error: null };
    }
  };
  // 이메일 인증 링크를 눌러 돌아온 상황을 흉내 낸다.
  window.__fakeVerify = (email) => {
    const db = load(); const user = db.users.find((u) => u.email === email);
    user.verified = true; db.session = sessionOf(user); save(db);
  };
  window.supabase = { createClient: () => ({ auth, from: builder }) };
}());
