# Supabase 연결

프로젝트 주소와 Publishable key는 이미 `js/supabase-config.js`에 연결했어. Supabase 접속 확인도 됐어. 현재 프로젝트에는 `saju_profiles` 테이블이 아직 없어 보여.

1. [Supabase SQL 편집기](https://supabase.com/dashboard/project/thksrubhuimqxdpnfreu/sql/new)를 열어 이 폴더의 `schema.sql` 내용을 전부 붙여 넣고 Run을 눌러 `saju_profiles` 테이블과 계정별 행 단위 보안 정책을 만들어.
2. Supabase의 Authentication 설정에서 이메일 인증 사용 여부를 정해. 이메일 인증을 켜면 가입 확인 메일이 발송돼.
3. Authentication의 URL 설정에 실제 사이트 주소와 이메일 인증 후 이동할 `html/member.html` 주소를 허용 목록으로 등록해. 로컬 Live Server를 쓴다면 `http://127.0.0.1:5500`과 `http://127.0.0.1:5500/html/member.html`을 허용 목록에 추가해.
4. 사이트를 HTTPS 주소 또는 로컬 웹 서버로 열어. `file://`로 직접 연 페이지에서는 Supabase 세션 저장과 이메일 인증 이동이 제대로 동작하지 않을 수 있어.

브라우저 코드에는 Publishable/anon 공개 키만 둘 수 있어. Secret 또는 service_role 키는 절대 넣지 마.

이 사이트는 이메일과 비밀번호로 가입·로그인해. 프로젝트의 이메일 확인 설정에 따라 회원가입 직후 이메일 인증이 필요할 수 있어.
