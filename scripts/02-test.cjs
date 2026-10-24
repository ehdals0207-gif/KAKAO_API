'use strict';
const path = require('node:path');
const { createClient } = require('./dist');

const mode = process.argv[2];
const roomId = process.argv[3];
if (mode !== 'listen' && mode !== 'send') {
  console.error('사용법: node 02-test.cjs listen | node 02-test.cjs send "채팅방ID"');
  process.exit(1);
}
if (mode === 'send' && (!roomId || !/^\d+$/.test(roomId))) {
  console.error('채팅방 ID는 02-test.cjs listen에서 확인한 숫자를 그대로 입력하세요.');
  process.exit(1);
}

const client = createClient({
  authPath: path.join(__dirname, 'auth.json'),
  autoConnect: false,
  autoReconnect: false,
  debug: false,
});
let attempted = false;

client.onReady(async (chat) => {
  console.log('[READY] 카카오톡 연결 준비 완료');
  if (mode === 'listen') {
    console.log('별도 계정으로 테스트방에 ROOM-ID-TEST 문구를 한 번 보내세요.');
    return;
  }
  if (attempted) return;
  attempted = true;
  const message = '[TEST] 카카오톡 LOCO 능동 발송 테스트 (실제 매매 아님)';
  try {
    const result = await chat.sendText(roomId, message);
    console.log('[SEND_RESOLVED] 송신 함수 완료:', result);
    console.log('실제 수신 여부는 카카오톡 테스트방에서 별도로 확인해야 합니다.');
  } catch (error) {
    console.error('[SEND_FAILED]', error);
  }
  console.log('테스트 종료는 Ctrl+C');
});

if (mode === 'listen') {
  client.onMessage((chat, msg) => {
    const text = String(msg?.message?.text ?? '');
    if (!text.includes('ROOM-ID-TEST')) return;
    console.log('[ROOM_NAME]', msg?.room?.name);
    console.log('[IS_OPEN_CHAT]', msg?.room?.isOpenChat);
    console.log('[ROOM_ID]', String(msg?.room?.id));
    console.log('ROOM_ID를 복사한 뒤 Ctrl+C로 종료하세요.');
  });
}

client.connect().catch((error) => {
  console.error('[CONNECT_FAILED]', error);
  process.exitCode = 1;
});
