import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('authoring keeps drafts private and accepts contact into the protected inbox', { timeout: 15000 }, async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'portfolio-test-'));
  const adminOrigin = 'https://authoring.test';
  const publicOrigin = 'https://portfolio.test';
  const password = 'local-test-only-password';
  const service = spawn(process.execPath, ['service/server.mjs'], {
    env: {
      ...process.env,
      PORTFOLIO_ADMIN_BIND: '127.0.0.1',
      PORTFOLIO_ADMIN_PORT: '0',
      PORTFOLIO_ADMIN_ORIGIN: adminOrigin,
      PORTFOLIO_PUBLIC_ORIGIN: publicOrigin,
      PORTFOLIO_ADMIN_PASSWORD: password,
      PORTFOLIO_DB: join(scratch, 'test.sqlite'),
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const closed = once(service, 'close');
  try {
    const [ready] = await Promise.race([once(service.stdout, 'data'), closed.then(([code]) => { throw Error('Service exited ' + code); })]);
    const port = String(ready).match(/:(\d+)\s*$/)?.[1];
    assert.ok(port);
    const url = 'http://127.0.0.1:' + port;
    const auth = { Authorization: 'Basic ' + Buffer.from('owner:' + password).toString('base64') };
    const write = { ...auth, 'Content-Type': 'application/json', Origin: adminOrigin };
    assert.equal((await fetch(url + '/documents/notes')).status, 401);

    const draft = await (await fetch(url + '/documents/notes', { headers: auth })).json();
    draft.value.push({ title: 'Private draft', published: false, order: 10 });
    const input = { method: 'PUT', headers: write, body: JSON.stringify(draft) };
    const saved = await fetch(url + '/documents/notes', input);
    assert.equal(saved.status, 200);
    const { revision } = await saved.json();
    assert.equal((await fetch(url + '/documents/notes', input)).status, 409);

    const release = await (await fetch(url + '/documents/notes/release', {
      method: 'PUT', headers: write, body: JSON.stringify({ revision }),
    })).json();
    assert.ok(!release.value.some(row => row.title === 'Private draft'));

    const contact = { name: 'Test Visitor', email: 'test@example.com', topic: 'Data science', message: 'Testing the contact form.' };
    assert.equal((await fetch(url + '/contact', {
      method: 'POST', headers: { Origin: publicOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(contact),
    })).status, 202);
    assert.equal((await fetch(url + '/inbox')).status, 401);
    const inbox = await (await fetch(url + '/inbox', { headers: auth })).json();
    assert.equal(inbox[0].message, contact.message);
  } finally {
    service.kill();
    await closed;
    await rm(scratch, { recursive: true, force: true });
  }
});
