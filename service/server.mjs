import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const contentNames = ['profile', 'projects', 'skills', 'journey', 'books', 'notes'];
const bind = process.env.PORTFOLIO_ADMIN_BIND || '127.0.0.1';
const port = Number(process.env.PORTFOLIO_ADMIN_PORT || 8787);
const adminOrigin = process.env.PORTFOLIO_ADMIN_ORIGIN || 'http://127.0.0.1:' + port;
const publicOrigin = process.env.PORTFOLIO_PUBLIC_ORIGIN || 'https://moatasem75291.github.io';
const databasePath = resolve(process.env.PORTFOLIO_DB || 'service/data/portfolio.sqlite');
const password = process.env.PORTFOLIO_ADMIN_PASSWORD;
if (!password || password.length < 16) throw new Error('Set PORTFOLIO_ADMIN_PASSWORD with at least 16 characters.');

mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
const database = new DatabaseSync(databasePath);
database.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
database.exec(readFileSync(new URL('./migrations/001-initial.sql', import.meta.url), 'utf8'));
const seed = database.prepare('INSERT OR IGNORE INTO documents(name, draft, release) VALUES (?, ?, ?)');
for (const name of contentNames) {
  const raw = readFileSync(new URL('../content/' + name + '.json', import.meta.url), 'utf8');
  seed.run(name, raw, raw);
}
const adminPage = readFileSync(new URL('./admin.html', import.meta.url));
const adminScript = readFileSync(new URL('./admin.js', import.meta.url));
const hash = value => createHash('sha256').update(value).digest();
const expected = hash('Basic ' + Buffer.from('owner:' + password).toString('base64'));
const limits = new Map();
function allow(key, maximum, windowMs) {
  const now = Date.now();
  if (limits.size > 2048) for (const [id, entry] of limits) if (entry.expires <= now) limits.delete(id);
  if (limits.size > 4096 && !limits.has(key)) return false;
  const entry = limits.get(key);
  if (!entry || entry.expires <= now) { limits.set(key, { count: 1, expires: now + windowMs }); return true; }
  return ++entry.count <= maximum;
}
function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(value));
}
async function body(request, maxBytes) {
  const buffers = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > maxBytes) throw new Error('Body exceeds the size limit.');
    buffers.push(chunk);
  }
  return Buffer.concat(buffers).toString('utf8');
}
const string = value => typeof value === 'string' ? value.trim() : '';
const topics = new Set(['AI engineering', 'Data science', 'Technical collaboration', 'Consulting', 'Professional opportunities', 'Something else']);

async function handle(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  const path = new URL(request.url || '/', adminOrigin).pathname;
  const { method } = request;
  const ip = request.socket.remoteAddress || 'local';
  const origin = request.headers.origin;

  if (path === '/contact' || path === '/performance') {
    if (origin !== publicOrigin) return json(response, 403, { error: 'Origin is unavailable.' });
    response.setHeader('Access-Control-Allow-Origin', publicOrigin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (method === 'OPTIONS') return response.writeHead(204).end();
    if (method !== 'POST') return json(response, 405, { error: 'Use POST.' });
    if (!allow(ip + path, path === '/contact' ? 5 : 60, 600000)) return json(response, 429, { error: 'Please wait before retrying.' });
    if (path === '/performance') {
      const params = new URLSearchParams(await body(request, 512));
      const ms = Number(params.get('ms'));
      const route = params.get('route');
      if (params.get('metric') !== 'LCP' || !Number.isInteger(ms) || ms <= 0 || ms > 120000 || !/^\/[a-z0-9/-]{0,160}$/.test(route || '')) return json(response, 400, { error: 'Invalid measurement.' });
      database.prepare('INSERT INTO performance_daily VALUES (date(\'now\'), ?, 1, ?) ON CONFLICT(day, route) DO UPDATE SET samples = samples + 1, total_ms = total_ms + excluded.total_ms').run(route, ms);
      return response.writeHead(204).end();
    }
    if (!request.headers['content-type']?.startsWith('application/json')) return json(response, 415, { error: 'Expected JSON.' });
    const data = JSON.parse(await body(request, 8192));
    const [name, email, topic, message] = ['name', 'email', 'topic', 'message'].map(key => string(data?.[key]));
    if (data?.website) return json(response, 202, { received: true });
    if (!name || name.length > 100 || email.length > 250 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !topics.has(topic) || message.length < 10 || message.length > 3000) return json(response, 400, { error: 'Check required fields.' });
    database.prepare('INSERT INTO inquiries(name, email, topic, message) VALUES (?, ?, ?, ?)').run(name, email, topic, message);
    return json(response, 202, { received: true });
  }

  if (!['/', '/admin.js', '/documents', '/inbox', '/measurements'].includes(path) && !/^\/documents\/[a-z]+(?:\/release)?$/.test(path)) return json(response, 404, { error: 'Unknown route.' });
  if (!timingSafeEqual(hash(request.headers.authorization || ''), expected)) {
    if (!allow('auth:' + ip, 15, 600000)) return json(response, 429, { error: 'Please wait before retrying.' });
    response.setHeader('WWW-Authenticate', 'Basic realm="Portfolio authoring", charset="UTF-8"');
    return json(response, 401, { error: 'Sign in as owner.' });
  }
  if (method !== 'GET' && origin !== adminOrigin) return json(response, 403, { error: 'The request must come from the authoring dashboard.' });
  if (method === 'GET' && path === '/') return response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(adminPage);
  if (method === 'GET' && path === '/admin.js') return response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(adminScript);
  if (method === 'GET' && path === '/documents') return json(response, 200, database.prepare('SELECT name, revision, updated_at FROM documents ORDER BY name').all());
  if (method === 'GET' && path === '/inbox') return json(response, 200, database.prepare('SELECT * FROM inquiries ORDER BY id DESC LIMIT 100').all());
  if (method === 'GET' && path === '/measurements') return json(response, 200, database.prepare('SELECT day, route, samples, ROUND(1.0 * total_ms / samples) AS average_ms FROM performance_daily ORDER BY day DESC LIMIT 100').all());
  const [, , name, operation] = path.split('/');
  if (!contentNames.includes(name)) return json(response, 404, { error: 'Unknown content collection.' });
  const current = database.prepare('SELECT * FROM documents WHERE name = ?').get(name);
  if (method === 'GET') return json(response, 200, operation ? { value: JSON.parse(current.release) } : { value: JSON.parse(current.draft), revision: current.revision });
  if (method !== 'PUT' || !request.headers['content-type']?.startsWith('application/json')) return json(response, 405, { error: 'Use PUT with JSON.' });
  const submitted = JSON.parse(await body(request, 128 * 1024));
  if (submitted.revision !== current.revision) return json(response, 409, { error: 'Another edit was saved. Reload this collection.' });
  if (operation) {
    const draft = JSON.parse(current.draft);
    const release = Array.isArray(draft) ? draft.filter(item => item?.published === true && item?.visible !== false) : draft;
    database.prepare('UPDATE documents SET release = ? WHERE name = ?').run(JSON.stringify(release), name);
    return json(response, 200, { value: release, revision: current.revision });
  }
  const value = submitted.value;
  const valid = name === 'profile' ? value && !Array.isArray(value) && typeof value.name === 'string' && Array.isArray(value.principles) && value.principles.length > 0 : Array.isArray(value) && value.every(item => item && typeof item.published === 'boolean' && Number.isFinite(item.order));
  if (!valid) return json(response, 400, { error: 'Expected a profile or an ordered collection with published flags.' });
  database.prepare('UPDATE documents SET draft = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE name = ?').run(JSON.stringify(value), name);
  return json(response, 200, { value, revision: current.revision + 1 });
}

const server = createServer((request, response) => {
  handle(request, response).catch(error => {
    if (response.headersSent || response.destroyed) return;
    if (error instanceof SyntaxError || error.message === 'Body exceeds the size limit.') return json(response, 400, { error: 'Invalid request body.' });
    console.error('Portfolio service request failed:', error.code || error.name);
    json(response, 500, { error: 'The request could not be completed.' });
  });
});
server.listen(port, bind, () => console.log('Portfolio authoring service listening on %s:%s', bind, server.address().port));
