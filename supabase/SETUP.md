# Supabase 연결

프로젝트 주소와 Publishable key는 `js/supabase-config.js`에 연결돼 있어. 브라우저 코드에는 Publishable/anon 공개 키만 둘 수 있고, Secret·service_role 키는 절대 넣지 마.

## SQL 실행 순서

[Supabase SQL 편집기](https://supabase.com/dashboard/project/thksrubhuimqxdpnfreu/sql/new)에서 아래 순서로 실행해.

1. `supabase/schema.sql` — `saju_profiles` 테이블과 RLS. 이미 적용했다면 건너뛰어도 돼.
2. `supabase/migrations/20250101_member_profiles_and_client_key.sql` — 이름·성별을 저장하는 `member_profiles` 테이블(RLS 포함), 가입 시 이름·성별을 복사하는 트리거, 명식 중복 저장 방지용 `client_key` 컬럼.

두 파일 모두 기존 데이터를 지우지 않고, 여러 번 실행해도 안전해. 2번을 실행하기 전에도 사이트는 동작하지만(가입 정보는 계정 메타데이터에 임시로 남아), 이름·성별이 전용 테이블에 저장되려면 2번이 필요해.

## Authentication 설정

Authentication → URL Configuration

- Site URL: `https://miki-amber.vercel.app`
- Redirect URLs: `https://miki-amber.vercel.app/**` (이메일 인증 후 보고서 페이지로 돌아오려면 `**` 패턴이 필요해.)
- 로컬 테스트를 한다면 `http://127.0.0.1:5500/**`도 추가해.

이메일 인증을 켜 두면 회원가입 직후 확인 메일이 가고, 메일의 링크를 누르면 저장 대기 중이던 명식이 자동으로 저장돼.

## 확인 상태

이 저장소의 검사는 가짜 Supabase 클라이언트로 흐름을 시험한 것이야. 실제 Supabase 가입·로그인·이메일 인증·RLS 동작은 위 설정을 마친 뒤 직접 한 번 확인해줘.

사이트를 `file://`로 열면 세션 저장과 이메일 인증 이동이 제대로 동작하지 않으니 HTTPS 주소나 로컬 웹 서버로 열어.
