# 인수인계 및 다음 단계

## 작업 상태

- 현재 대상 저장소: https://github.com/ehdals0207-gif/KAKAO_API
- 사용자 PC의 기존 작업: E:\Kakao_LOCO_LAB\KakaoForge
- 인증 파일: 기존 PC 로컬 KakaoForge 폴더에 존재. **절대 업로드/공유하지 않음.**
- 사용자 로그 기준 QR 로그인과 단일 오픈채팅방 Headless 능동 송신까지 성공.
- 이 저장소의 scripts/03-burst-test.cjs는 공개용으로 방 ID 하드코딩을 제거하고 KAKAO_ROOM_ID 환경변수로 변경.

## 다음 테스트 (Tapbit 연동 전에)

1. [ ] scripts/03-burst-test.cjs --preview 내용 확인 (실제 송신 없음).
2. [ ] 별도 테스트방의 ID를 KAKAO_ROOM_ID로 설정하고 --send 실행.
3. [ ] 카카오톡 3개의 동일한 진입 템플릿 + 테스트용 평단 1개 총 4건의 도착 순서 확인.
4. [ ] 과도한 속도로 막히는지 오류 코드/지연 측정 (불필요한 반복 시험 금지).
5. [ ] 프로세스 종료·재시작 후 단건 송신 재검증.
6. [ ] 실제 계정 제재/프로토콜 호환성 위험 점검.

~~~powershell
Set-Location E:\Kakao_LOCO_LAB\KakaoForge
Copy-Item E:\Kakao_LOCO_LAB\KAKAO_API\scripts\*.cjs . -Force
node .\03-burst-test.cjs --preview
$env:KAKAO_ROOM_ID = '테스트방ID'
node .\03-burst-test.cjs --send
~~~

아직 KAKAO_API 로컬 clone이 없다면 E:\Kakao_LOCO_LAB 에서 git clone https://github.com/ehdals0207-gif/KAKAO_API.git 실행. 기존 KakaoForge 디렉터리를 덮어쓰지 말 것.

## 이후 개발

1. [ ] Tapbit 공식 API 문서에서 개인 선물 체결/포지션/배율/마진 모드 필드 검증 (추측 금지).
2. [ ] 조회 전용 API 인증 구성. 로그나 GitHub에 키 출력 금지.
3. [ ] 실제 체결과 포지션 변화에 대한 상태 머신 + 테스트 픽스처 작성.
4. [ ] 템플릿 엔진: LONG/SHORT·ENTRY/ADD/PARTIAL/FULL, 평단, 산식 명확한 비중.
5. [ ] Outbox 기반 안전한 발송 보장과 장애 시 UNKNOWN/중복 처리.
6. [ ] KakaoTransport 모듈 연결 및 샌드박스·수동매매 실제 이벤트 테스트.
7. [ ] 24시간 백그라운드 상주, 재연결/재시작, 모니터링·정지 스위치 검증.
8. [ ] 상업적 사용 허용 여부 및 이용정책 확인.

## 주의

- 봇이 **메시지를 직접 전송하는 것**만 증명됨. 서버에서 24시간 무중단 구동은 아직 증명되지 않음.
- 03번 테스트는 실제 Tapbit 체결을 읽지 않으며, 화면에 나오는 가격은 가짜 테스트 값.
- 사용자 계정/채팅방 ID/방 이름/스크린샷은 공개 문서에 보존하지 않음.
