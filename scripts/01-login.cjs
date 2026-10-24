'use strict';
const path = require('node:path');
const { createAuthByQR } = require('./dist');

(async () => {
  console.log('[START] 카카오톡 테스트 계정 QR 인증');
  await createAuthByQR({ authPath: path.join(__dirname, 'auth.json') });
  console.log('[AUTH_OK] auth.json 저장 완료 (절대 공유하지 마세요)');
})().catch((error) => {
  console.error('[AUTH_FAILED]', error);
  process.exitCode = 1;
});
