'use strict';
/* Local preview: serves the site and runs the /api functions the way Vercel does.
   Without a Blob token, projects and uploads are kept in ./.data instead.

     ADMIN_PASSWORD=choose-one node scripts/dev-server.js [port]            */

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2]) || 3000;

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.PF_LOCAL_STORE) process.env.PF_LOCAL_STORE = path.join(root, '.data');
if (!process.env.ADMIN_PASSWORD) {
  console.log('ADMIN_PASSWORD is not set: the dashboard will show its setup screen.');
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.avif': 'image/avif', '.pdf': 'application/pdf', '.ico': 'image/x-icon'
};

function file(res, target) {
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch (e) { res.writeHead(400); res.end(); return; }

  const api = /^\/api\/([\w-]+)\/?$/.exec(p);
  if (api) {
    const mod = path.join(root, 'api', api[1] + '.js');
    if (!fs.existsSync(mod)) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{"error":"Not found"}'); return; }
    Promise.resolve(require(mod)(req, res)).catch((e) => { console.error(e); if (!res.headersSent) { res.writeHead(500); res.end(); } });
    return;
  }

  if (p.startsWith('/_store/')) {   // locally stored uploads
    const dir = path.join(process.env.PF_LOCAL_STORE || '', 'store');
    return file(res, path.join(dir, path.basename(p)));
  }

  if (p.endsWith('/')) p += 'index.html';
  let target = path.join(root, p);
  if (!target.startsWith(root) || /(^|\/)(\.data|\.git|node_modules|api|scripts)(\/|$)/.test(p.slice(1))) { res.writeHead(404); res.end('Not found'); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  file(res, target);
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}  (dashboard: /admin)`));
