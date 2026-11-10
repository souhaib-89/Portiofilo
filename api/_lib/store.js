'use strict';
/* Where projects and their images live.

   On Vercel: one Blob store. The project list is a single JSON file
   (data/projects.json); images go under projects/.

   For local development only, set PF_LOCAL_STORE to a folder and the same calls
   read and write files there instead (scripts/dev-server.js does this). */

const fs = require('fs');
const path = require('path');

const DATA_PATH = 'data/projects.json';
const localDir = () => process.env.PF_LOCAL_STORE || '';
// a connected Blob store gives the project either a read-write token or a store id (token-less sign-in)
const useBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const configured = () => useBlob() || !!localDir();

let sdk;
const blob = () => (sdk = sdk || require('@vercel/blob'));

/* ------------------------------------------------------------------- data */
async function read() {
  if (useBlob()) {
    const { get } = blob();
    let r;
    try {
      r = await get(DATA_PATH, { access: 'public', useCache: false });   // straight from storage, never a stale copy
    } catch (e) {
      if (/NotFound/.test(e.name || '')) return null;
      r = await get(DATA_PATH, { access: 'public' });
    }
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return parse(await new Response(r.stream).text());
  }
  if (localDir()) {
    try { return parse(fs.readFileSync(path.join(localDir(), 'projects.json'), 'utf8')); } catch (e) { return null; }
  }
  return null;
}

function parse(text) {
  try {
    const d = JSON.parse(text);
    return d && Array.isArray(d.projects) ? d : null;
  } catch (e) { return null; }
}

async function write(data) {
  const text = JSON.stringify(data);
  if (useBlob()) {
    await blob().put(DATA_PATH, text, {
      access: 'public', addRandomSuffix: false, allowOverwrite: true,
      contentType: 'application/json', cacheControlMaxAge: 60
    });
    return;
  }
  fs.mkdirSync(localDir(), { recursive: true });
  fs.writeFileSync(path.join(localDir(), 'projects.json'), text);
}

/* ----------------------------------------------------------------- images */
async function putImage(name, buffer, contentType) {
  if (useBlob()) {
    const r = await blob().put('projects/' + name, buffer, {
      access: 'public', addRandomSuffix: true, contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 365   // the random suffix makes every upload a new address
    });
    return r.url;
  }
  const dir = path.join(localDir(), 'store');
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(name);
  const file = path.basename(name, ext) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + ext;
  fs.writeFileSync(path.join(dir, file), buffer);
  return '/_store/' + file;
}

/* Only files this dashboard uploaded can be removed. */
function isOwnImage(url) {
  if (typeof url !== 'string') return false;
  if (url.startsWith('/_store/')) return !!localDir() && !url.includes('..');
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.blob.vercel-storage.com') && u.pathname.startsWith('/projects/');
  } catch (e) { return false; }
}

async function deleteImages(urls) {
  const own = [...new Set(urls)].filter(isOwnImage);
  if (!own.length) return 0;
  if (useBlob()) {
    await blob().del(own.filter((u) => !u.startsWith('/_store/')));
  } else {
    own.forEach((u) => { try { fs.unlinkSync(path.join(localDir(), 'store', path.basename(u))); } catch (e) { /* already gone */ } });
  }
  return own.length;
}

module.exports = { configured, read, write, putImage, deleteImages, isOwnImage };
