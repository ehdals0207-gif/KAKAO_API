# 아키텍처 초안

## 핵심 파이프라인

~~~text
Tapbit private trade / position data
    |
    v
ExchangeAdapter (인증/접속/재연결, 이벤트 정규화)
    |
    v
PositionStateEngine (기존 상태 ↔ 신규 상태 비교)
    |
    v
TradeEventClassifier (ENTRY / ADD / PARTIAL_EXIT / FULL_EXIT / REVERSAL)
    |
    v
MessageBuilder (롱 ▲▲ / 숏 ▼▼ / 교차·격리 / 배율 / 비중 / 가격)
    |
    v
Outbox (대기/전송중/성공/실패/확인불명, dedupe key)
    |
    v
KakaoTransport (KakaoForge LOCO sendText)
    |
    v
테스트 오픈채팅방 → 사용자 수신 확인
~~~

현재 구현된 것은 하단 KakaoTransport의 **단일 메시지 실사용 PoC**뿐입니다.

## 어댑터 인터페이스 방향

- ExchangeAdapter.fetchSnapshot(): 현재 포지션·평단·마진모드·레버리지·계정 기준 값
- ExchangeAdapter.subscribeFills(): 신규 실제 체결 이벤트 스트림
- Classifier.classify(before, fill, after): 매매 유형 분류
- MessageBuilder.render(event, snapshot): 지정 템플릿 생성
- Outbox.enqueue(group), deliver(): 순서/중복/재시도 제어
- KakaoTransport.send(roomId, message): 문자열 식별자를 그대로 전달

이 인터페이스는 **설계안**이며 현재 실제 코드에 존재하는 API가 아닙니다.

## 데이터 정합성

- 초기 시작 시 위치 스냅샷을 읽고, 누락 이벤트를 복구할 수 있도록 마지막 처리 커서를 유지.
- 체결 ID/주문 ID/포지션 전환 시점으로 dedupe. 분할 체결 집계 기준을 사용자와 확정.
- 반대 방향 체결 시 부분청산/전량청산/반전 여부는 포지션 전후 수량·방향으로 판단.
- 거래소 REST와 WebSocket의 이벤트 중복/누락, 일시적인 상태 불일치 처리.
- 메시지에는 체결 평균가와 포지션 평단의 의미를 분리 표기.
- '비중' 계산은 계정 데이터, 마진 정의, 레버리지/수수료 처리 확인 후 구현.

## 전송 안전성

- 동일 체결에 대한 중복 메시지를 방지하기 위해 Outbox에 고유 키와 영속 상태 저장.
- 네트워크 타임아웃 뒤 결과를 모르면 UNKNOWN으로 저장하고 무조건 자동 재발송하지 않음.
- 한 이벤트의 3+1 메시지는 순서를 고정. 일부만 성공한 경우에도 전체 그룹을 맹목적으로 재전송하지 않음.
- 송신 속도 제한, backoff, 카카오 계정 보호를 위한 정지 스위치 적용.
- 기존 auth.json은 로컬에만 두고, 다른 사용자의 봇 세션과 공유하지 않음.
- 교차/격리, 레버리지, 비중이 불명확하면 추정값으로 메시지를 발송하지 않음.
- 운영 단계에서 포지션 정보 유출/시그널 오해 가능성을 확인.

## 실행 환경

- 1차: Windows 11 / E:\Kakao_LOCO_LAB / Node.js 백그라운드 프로세스.
- 향후: 상시 구동 머신/서버 서비스. 서비스화는 별도 검증 이후.
- 카카오 UI 포커스나 메신저봇R 알림 답장 기능에 의존하지 않음.
- KakaoForge는 비공식 통신 라이브러리. 카카오 서버 프로토콜 변경·제재 위험.
- KakaoForge 라이선스는 **비상업적 사용만 허용**. 상업적 CASTLE 운영 시 사용 권한을 별도로 확보하거나 적법한 대체 구현 필요.
