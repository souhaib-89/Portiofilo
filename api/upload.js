'use strict';
/* POST   /api/upload?name=cover.webp&type=image/webp   body: the image bytes
          (sent as application/octet-stream)  ->  { url }
   DELETE /api/upload?url=...                            remove an image that was
          uploaded but never saved in a project
   Dashboard only. */

const { send, query, readBuffer, route, httpError } = require('./_lib/http');
const auth = require('./_lib/auth');
const store = require('./_lib/store');
const { slug } = require('./_lib/validate');

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

module.exports = route({
  async POST(req, res) {
    auth.requireAdmin(req);
    if (!store.configured()) throw httpError(503, 'Storage is not connected to this project yet.');
    const q = query(req);
    const type = String(q.get('type') || '').toLowerCase();
    const ext = TYPES[type];
    if (!ext) throw httpError(415, 'Use a JPG, PNG, WebP, GIF or AVIF image.');
    const buffer = await readBuffer(req);
    if (!buffer.length) throw httpError(400, 'The image arrived empty. Try again.');
    const base = slug(String(q.get('name') || '').replace(/\.[a-z0-9]+$/i, '')) || 'image';
    const url = await store.putImage(`${base}.${ext}`, buffer, type);
    send(res, 200, { url });
  },

  async DELETE(req, res) {
    auth.requireAdmin(req);
    const url = String(query(req).get('url') || '');
    if (!store.isOwnImage(url)) throw httpError(400, 'That is not an image uploaded from this dashboard.');
    // never remove an image a saved project still uses
    const data = store.configured() ? await store.read() : null;
    const used = data ? data.projects.some((p) => p.image === url || (p.gallery || []).includes(url)) : false;
    if (!used) await store.deleteImages([url]);
    send(res, 200, { removed: !used });
  }
});
