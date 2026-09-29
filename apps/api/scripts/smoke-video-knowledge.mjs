import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Local demo API only. This checks real routing, auth, body limits and queue
// persistence without an AI key. The sample source is removed in finally.
const api = 'http://localhost:4000/v1';
async function login(email) {
  const response = await fetch(`${api}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Demo@12345' }) });
  assert.equal(response.status, 201, `Login failed for ${email}`);
  return (await response.json()).accessToken;
}
const token = await login('admin@demo.local');
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const marker = randomUUID();
const script = `Temporary fixture ${marker}. ` + 'Nội dung kiểm thử học tiếng Việt. '.repeat(2800);
const video = { url: `https://youtu.be/${marker.replace(/-/g, '').slice(0, 11)}`, title: 'Kiểm thử API tạm thời', script, targetRoles: ['ADMIN'], rightsType: 'OWNED', rightsBasis: 'Nội dung kiểm thử tự tạo, sẽ tự dọn sau khi chạy.', rightsConfirmed: true };
let sourceId;
try {
  assert.equal((await fetch(`${api}/ai-contexts`)).status, 401);
  const student = await login('student@demo.local');
  assert.equal((await fetch(`${api}/ai-contexts`, { headers: { Authorization: `Bearer ${student}` } })).status, 403);
  const body = JSON.stringify({ videos: [video, { ...video, url: 'not a URL', script: 'Another temporary transcript with enough content.' }] });
  assert.ok(Buffer.byteLength(body) > 100 * 1024, 'Fixture must exercise the UTF-8 request limit');
  const response = await fetch(`${api}/ai-contexts/youtube/batch`, { method: 'POST', headers, body });
  assert.equal(response.status, 201, await response.clone().text());
  const batch = await response.json();
  sourceId = batch.results[0]?.source?.id;
  assert.equal(batch.accepted, 1); assert.equal(batch.failed, 1); assert.ok(sourceId);
  const invalidSelection = await fetch(`${api}/ai-contexts/ask`, { method: 'POST', headers, body: JSON.stringify({ sourceIds: [sourceId], question: 'What is this about?' }) });
  assert.equal(invalidSelection.status, 409);
  let exported;
  for (let attempt = 0; attempt < 20; attempt++) {
    exported = await (await fetch(`${api}/ai-contexts/${sourceId}/export`, { headers })).json();
    if (exported.processingStatus !== 'PROCESSING') break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.equal(exported.processingStatus, 'FAILED', 'Run this smoke with AI_PROVIDER=disabled');
  assert.equal(Object.hasOwn(exported, 'rawTranscript'), false);
  const duplicate = await (await fetch(`${api}/ai-contexts/youtube`, { method: 'POST', headers, body: JSON.stringify({ ...video, script: undefined }) })).json();
  assert.equal(duplicate.reused, true); assert.equal(duplicate.source.id, sourceId);
  assert.equal((await fetch(`${api}/ai-contexts/documents`, { headers })).status, 200);
  console.log(JSON.stringify({ result: 'passed', checks: ['unauthenticated 401', 'student 403', 'UTF-8 body >100KB', 'partial batch acceptance', 'unfinished Q&A 409', 'export excludes script', 'canonical cache reuse', 'documents endpoint'], sourceId }));
} finally {
  if (sourceId) {
    const removed = await fetch(`${api}/ai-contexts/${sourceId}`, { method: 'DELETE', headers });
    assert.equal(removed.status, 200, 'Temporary source cleanup failed');
  }
}
