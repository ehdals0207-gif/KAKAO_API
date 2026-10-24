'use strict';

// 기본 모드는 미리보기입니다. 실제 전송 시 KAKAO_ROOM_ID를 설정하세요.
// 3건의 진입 템플릿 + 1건의 테스트용 진입평단을 순차 발송합니다.
const path = require('node:path');

const roomId = process.env.KAKAO_ROOM_ID;
const trade = {
  symbol: 'BTC / USDT',
  entryPercent: 3,
  marginMode: 'CROSS',
  leverage: 40,
  orderType: '시장가',
  side: 'SHORT',
  averageEntryPrice: '100000.00', // 가상 평단
};
const BURST_COUNT = 3;
const DELAY_MS = 900;

function buildMessages(t) {
  if (!['LONG', 'SHORT'].includes(t.side)) {
    throw new Error('side는 LONG 또는 SHORT만 가능합니다.');
  }
  if (!['CROSS', 'ISOLATED'].includes(t.marginMode)) {
    throw new Error('marginMode는 CROSS 또는 ISOLATED만 가능합니다.');
  }
  if (!(Number.isFinite(t.entryPercent) && t.entryPercent > 0 && t.entryPercent <= 100)) {
    throw new Error('entryPercent는 0보다 크고 100 이하인 숫자여야 합니다.');
  }
  if (!(Number.isFinite(t.leverage) && t.leverage >= 1)) {
    throw new Error('leverage는 1 이상의 숫자여야 합니다.');
  }
  if (!String(t.averageEntryPrice).trim()) {
    throw new Error('averageEntryPrice가 필요합니다.');
  }

  const arrow = t.side === 'LONG' ? '▲▲' : '▼▼';
  const sideKo = t.side === 'LONG' ? '롱' : '숏';
  const marginKo = t.marginMode === 'CROSS' ? '교차' : '격리';
  const header = '[TEST / 실제 매매 아님]';
  const entryText = [
    header,
    '#비중 ' + t.entryPercent + '% ' + arrow,
    '> ' + t.symbol,
    '> ' + marginKo + '  X' + t.leverage,
    '> ' + t.orderType,
    ">'" + sideKo + "' 진입신호 " + arrow,
    '※ 제 포지션공유 입니다',
    '※ 참고하신 분들 평단 확인 차 공유해주셔도 좋습니다.',
    '※ 판단은 각자의 기준으로 부탁드립니다',
  ].join('\n');
  const averageText = [
    header,
    '#진입평단',
    '> ' + t.symbol,
    '> ' + sideKo + ' 평균 진입가: ' + t.averageEntryPrice + ' USDT',
    '※ 위 가격은 테스트용 가상 값입니다.',
  ].join('\n');
  return [...Array(BURST_COUNT).fill(entryText), averageText];
}

const messages = buildMessages(trade);
const mode = process.argv[2] || '--preview';

if (mode === '--preview') {
  messages.forEach((message, i) => {
    console.log('\n====== 미리보기 ' + (i + 1) + '/' + messages.length + ' ======\n' + message);
  });
  console.log('\n[PREVIEW_OK] 실제 카카오톡 메시지는 전송하지 않았습니다.');
} else if (mode === '--send') {
  if (!roomId || !/^\d+$/.test(roomId)) {
    throw new Error('KAKAO_ROOM_ID 환경 변수에 테스트방 숫자 ID를 문자열로 설정하세요.');
  }
  const { createClient } = require('./dist');
  const client = createClient({
    authPath: path.join(__dirname, 'auth.json'),
    autoConnect: false,
    autoReconnect: false,
    debug: false,
  });
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let attempted = false;

  client.onReady(async (chat) => {
    if (attempted) return;
    attempted = true;
    console.log('[READY] 테스트방에 총 4건을 순차 전송합니다.');
    try {
      for (let i = 0; i < messages.length; i += 1) {
        await chat.sendText(roomId, messages[i]);
        console.log('[SEND_RESOLVED] ' + (i + 1) + '/' + messages.length);
        if (i < messages.length - 1) await sleep(DELAY_MS);
      }
      console.log('[DONE] API 송신 호출 4건 완료. 실제 수신은 별도 휴대폰에서 확인하세요.');
    } catch (error) {
      console.error('[SEND_FAILED] 중단:', error);
      process.exitCode = 1;
    } finally {
      client.disconnect();
    }
  });

  client.on('error', (error) => {
    console.error('[CLIENT_ERROR]', error);
    process.exitCode = 1;
  });
  client.connect().catch((error) => {
    console.error('[CONNECT_FAILED]', error);
    process.exitCode = 1;
    client.disconnect();
  });
} else {
  console.error('사용법: node .\03-burst-test.cjs --preview 또는 --send');
  process.exitCode = 1;
}
