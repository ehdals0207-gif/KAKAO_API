# 실사용 검증 기록

기록 기준: 2026-10-25. **사용자가 제공한 Windows PowerShell 로그와 카카오톡 수신 화면/진술**을 근거로 작성했습니다. 이 저장소의 작성자가 사용자의 PC 또는 카카오톡 계정에서 직접 테스트한 것은 아닙니다.

## 검증된 단계

1. 개발 도구: Node.js v24.18.0 / npm 11.16.0 / git 2.55.0.windows.3 출력 확인.
2. 작업 경로: E:\Kakao_LOCO_LAB.
3. git clone https://github.com/play2fly/KakaoForge.git 완료.
4. npm install 완료: 37 packages added, audited 38, reported 0 vulnerabilities.
5. npm run build 완료: TypeScript tsc -p tsconfig.json 실행 후 오류 출력 없음.
6. Test-Path .\dist\index.js → True.
7. 01-login.cjs 실행: [AUTH_OK] auth.json 저장 완료.
8. 02-test.cjs listen: [ROOM_NAME] / [IS_OPEN_CHAT] true / [ROOM_ID] 출력. 실제 ID 및 방 이름은 공개 저장소에 기록하지 않음.
9. 02-test.cjs send "방ID": 사용자 제공 카카오톡 채팅 화면에 '[TEST] 카카오톡 LOCO 능동 발송 테스트 (실제 매매 아님)' 메시지가 표시됨.
10. 사용자가 **다른 휴대폰에서도 실제 메시지 수신 확인**.

## 판정

- **PASS: 테스트 계정 로그인 및 LOCO 연결/수신**
- **PASS: 사용자 명령어를 받지 않고 오픈채팅방으로 단일 메시지 능동 송신**
- **PASS: 실제 수신 화면 및 별도 폰 수신 확인**
- **NOT TESTED: 연속 3건 + 평단 1건 전송** — scripts/03-burst-test.cjs는 제공되었으나 실행 결과가 공유되지 않음.
- **NOT TESTED: 24시간 무인 실행, 프로세스 재시작 후 재인증 불필요성, 장기 재연결 안정성**
- **NOT IMPLEMENTED: Tapbit 실시간 체결 수집, 포지션 이벤트 분류, 실데이터 메시지 생성**
- **NOT TESTED: 팀채팅/일반 단톡방 발송**

## 실제 성공 테스트 재현 방법

~~~powershell
Set-Location E:\Kakao_LOCO_LAB\KakaoForge
node .\02-test.cjs listen
# 다른 계정으로 테스트방에 ROOM-ID-TEST 작성
# [ROOM_ID] 확인 후 Ctrl+C
node .\02-test.cjs send "테스트방ID"
~~~

검증 시점에는 chat.sendText(roomId, text)의 요청 완료 로그와 **다른 기기 실제 수신**을 별도로 확인합니다. 로그의 성공 표시는 최종 수신을 보장하지 않습니다.

## 공개하지 않은 정보

- 채팅방 숫자 ID 및 이름
- auth.json 내용과 로그인 세션
- 테스트 화면 캡처 (인물/방 식별 정보 포함 가능)

증빙 이미지는 사용자 대화에만 남겨두며 Public GitHub에는 배포하지 않습니다.
