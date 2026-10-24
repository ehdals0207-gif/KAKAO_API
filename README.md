# KAKAO_API — 카카오톡 LOCO 매매 체결 알림 PoC

Tapbit 선물 계정의 **실제 수동 매매 체결**을 감지해 사용자 정의 템플릿을 생성하고, 카카오톡 오픈채팅방으로 **선행 명령 없이 능동 전송**하는 프로젝트입니다.

> 상태 (2026-10-25): **카카오톡 오픈채팅방으로의 1건 Headless 능동 발송은 사용자 실기기에서 검증 성공**. 3건 연속 발송과 Tapbit 체결 감지, 24시간 무인 운영은 아직 미검증/미구현입니다.

## 상태

| 항목 | 결과 |
| --- | --- |
| Windows 11 · Node.js 24.18.0 · npm 11.16.0 · Git 2.55.0 | 사용자 환경 확인 |
| KakaoForge 설치 / TypeScript 빌드 | 성공 (사용자 로그) |
| QR 계정 인증 / auth.json 생성 | 성공 (사용자 로그) |
| 오픈채팅방 이벤트 수신 / 방 ID 추출 | 성공 (사용자 로그) |
| 명령어 없이 지정 오픈채팅방에 1건 발송 | **실제 수신 성공** (사용자 화면 및 별도 휴대폰 확인) |
| 3건 연속 전송 + 평단 1건 | 스크립트 작성, **실제 전송 결과 미확인** |
| Tapbit 실제 체결 WebSocket / REST | 미구현 |
| 자동 신규진입·추가진입·부분/전량청산 분류 | 설계 단계 |
| 장시간 상주 / 재연결 / 재시작 중복방지 | 미검증 |

## 파일 안내

- scripts/01-login.cjs — 테스트 계정 QR 인증 및 로컬 세션 생성
- scripts/02-test.cjs — 오픈채팅방 식별, 선행 메시지 없는 1건 능동 송신
- scripts/03-burst-test.cjs — 테스트용 진입 메시지 3건 + 평단 1건 (기본 미리보기)
- docs/REQUIREMENTS.md — 확정 요구사항 / 메시지 규칙
- docs/VALIDATION.md — 실측 증거와 검증 범위
- docs/ARCHITECTURE.md — 구조 및 실패 방지 설계
- docs/NEXT_STEPS.md — 남은 작업 및 인수인계
- .gitignore — 인증정보 및 대용량/빌드 파일 제외

## Windows 11 실행 (E드라이브)

KakaoForge는 별도 개발자의 **비공식 LOCO 라이브러리**입니다. 이 저장소에는 타사 원본을 복제하지 않았습니다.

~~~powershell
$Lab = 'E:\Kakao_LOCO_LAB'
New-Item -ItemType Directory -Force -Path "$Lab\npm-cache", "$Lab\tmp" | Out-Null
$env:npm_config_cache = "$Lab\npm-cache"
$env:TEMP = "$Lab\tmp"
$env:TMP = "$Lab\tmp"

Set-Location $Lab
git clone https://github.com/play2fly/KakaoForge.git
git clone https://github.com/ehdals0207-gif/KAKAO_API.git
Set-Location "$Lab\KakaoForge"
npm install
npm run build

Copy-Item "$Lab\KAKAO_API\scripts\*.cjs" -Destination "$Lab\KakaoForge" -Force
~~~

이미 KakaoForge를 설치했다면 위 clone/build는 다시 할 필요 없이 **스크립트 파일만 복사**하면 됩니다.

~~~powershell
Set-Location E:\Kakao_LOCO_LAB\KakaoForge
node .\01-login.cjs
node .\02-test.cjs listen
# 별도 계정에서 ROOM-ID-TEST를 테스트방에 한 번 보내고 [ROOM_ID]를 확인한 후 Ctrl+C
node .\02-test.cjs send "방ID"
~~~

로그인 성공 시 생성되는 auth.json은 **절대 GitHub에 올리거나 외부에 공유하지 마세요.** 이미 인증되어 있으면 재로그인하지 않아도 됩니다.

연속 전송 테스트는 기본 미리보기 모드이며, 실제 전송 시 반드시 테스트방 ID를 **환경 변수로 지정**합니다.

~~~powershell
node .\03-burst-test.cjs --preview
$env:KAKAO_ROOM_ID = '테스트방ID'
node .\03-burst-test.cjs --send
~~~

테스트 시 출력에 [SEND_RESOLVED]가 있더라도 실제 메시지가 수신되지 않았다면 최종 성공이 아닙니다.

## 보안 및 라이선스

- GitHub 저장소는 **Public**입니다. 실제 채팅방 ID, 계정 비밀번호, API Key, auth.json, .env 등을 업로드하지 마세요.
- 조회 전용 Tapbit 키를 우선 사용합니다. 주문/출금 권한은 필요 없습니다.
- KakaoForge는 제3자 프로젝트이며 [Non-Commercial / No Abuse 라이선스](https://github.com/play2fly/KakaoForge/blob/main/LICENSE)가 적용됩니다. **상업적 운영·유료 서비스 사용 전 별도 허가/대체 구현 확인이 필요**합니다.
- 카카오의 공식 API가 아니므로 이용 제한·프로토콜 변경 위험이 있습니다.
- 대량 메시지 전송, 스팸 또는 타인의 채팅방 무단 발송 용도로 사용하지 않습니다.

## 출처

- KakaoForge: https://github.com/play2fly/KakaoForge
- 본 저장소는 KakaoForge의 공식 배포판이 아니며 **테스트 스크립트, 요구사항, 검증 기록**을 별도 보존합니다.
