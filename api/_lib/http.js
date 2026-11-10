'use strict';
/* Small request/response helpers. They use only Node's own request and response
   objects, so the same handlers run on Vercel and in scripts/dev-server.js. */

const MAX_BODY = 4.4 * 1024 * 1024;   // Vercel refuses request bodies above 4.5 MB

function send(res, status, data, headers) {
  const body = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!headers || !headers['Cache-Control']) res.setHeader('Cache-Control', 'no-store');
  Object.entries(headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.end(body);
}

function query(req) {
  return new URL(req.url || '/', 'http://local').searchParams;
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); } catch (e) { /* skip a malformed cookie */ }
  });
  return out;
}

/* Raw request body. On Vercel the platform has already read it and exposes it as
   req.body; locally we read the stream ourselves. */
async function readBody(req) {
  let ready;
  try { ready = req.body; } catch (e) { throw httpError(400, 'The request body could not be read.'); }
  if (ready !== undefined && ready !== null) return ready;
  if (req.readableEnded || req.complete) return undefined;
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(httpError(413, 'That file is too large. The limit is about 4 MB.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const b = await readBody(req);
  if (b === undefined) return {};
  if (Buffer.isBuffer(b) || typeof b === 'string') {
    const text = b.toString();
    if (!text.trim()) return {};
    try { return JSON.parse(text); } catch (e) { throw httpError(400, 'The request was not valid JSON.'); }
  }
  return b;   // already parsed by the platform
}

async function readBuffer(req) {
  const b = await readBody(req);
  if (b === undefined) return Buffer.alloc(0);
  if (Buffer.isBuffer(b)) return b;
  if (typeof b === 'string') return Buffer.from(b, 'binary');
  throw httpError(400, 'Send the file as raw bytes (application/octet-stream).');
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/* Wraps a handler: routes by method, turns thrown errors into JSON responses. */
function route(methods) {
  return async (req, res) => {
    const fn = methods[req.method];
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '));
      return send(res, 405, { error: 'Method not allowed.' });
    }
    try {
      await fn(req, res);
    } catch (e) {
      const status = e.status || 500;
      if (status >= 500) console.error(e);
      send(res, status, { error: e.status ? e.message : describe(e) });
    }
  };
}

/* Storage errors get a message the site owner can act on. */
function describe(e) {
  const name = (e && e.name) || '';
  const msg = (e && e.message) || 'Something went wrong.';
  if (/BlobAccessError|BlobStoreNotFound/.test(name) || /access/i.test(msg)) {
    return 'Vercel Blob refused the request. Check that the Blob store is connected to this project and was created with Public access. (' + msg + ')';
  }
  if (/BlobStoreSuspended/.test(name)) return 'The Vercel Blob store is suspended. Check its usage in the Vercel dashboard.';
  return msg;
}

module.exports = { send, query, cookies, readJson, readBuffer, httpError, route, MAX_BODY };
