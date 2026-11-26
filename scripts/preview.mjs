import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.env.PREVIEW_DIR || 'out');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

createServer((request, response) => {
  let status = 200;
  let filename;
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const base = process.env.PREVIEW_BASE_PATH || '';
    if (base && pathname !== base && !pathname.startsWith(base + '/')) throw new Error('Outside preview base');
    filename = resolve(root, '.' + (pathname.slice(base.length) || '/'));
    if (filename !== root && !filename.startsWith(root + sep)) throw new Error('Invalid path');
    if (statSync(filename).isDirectory()) {
      if (!pathname.endsWith('/')) return response.writeHead(308, { Location: pathname + '/' }).end();
      filename = resolve(filename, 'index.html');
    }
    if (!statSync(filename).isFile()) throw new Error('Unknown file');
  } catch { filename = resolve(root, '404.html'); status = 404; }
  response.writeHead(status, { 'Content-Type': types[extname(filename)] || 'application/octet-stream' });
  createReadStream(filename).on('error', () => response.end()).pipe(response);
}).listen(port, process.env.PREVIEW_BIND || '127.0.0.1', () => console.log('Serving %s on port %s', root, port));
