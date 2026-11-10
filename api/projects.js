'use strict';
/* GET /api/projects   the project list (public; the site and the dashboard read it)
   PUT /api/projects   replace the whole list (dashboard only)   { projects: [...] }

   `projects` is null until the dashboard has saved once; the site then shows the
   starter projects from js/content.js. */

const { send, readJson, route, httpError } = require('./_lib/http');
const auth = require('./_lib/auth');
const store = require('./_lib/store');
const validate = require('./_lib/validate');

module.exports = route({
  async GET(req, res) {
    const data = store.configured() ? await store.read() : null;
    // visitors may get a copy up to a minute old; the dashboard always reads fresh
    const cache = auth.isAuthed(req) ? 'private, no-store' : 'public, max-age=0, s-maxage=60';
    send(res, 200, {
      projects: data ? data.projects : null,
      updatedAt: data ? data.updatedAt : null
    }, { 'Cache-Control': cache });
  },

  async PUT(req, res) {
    auth.requireAdmin(req);
    if (!store.configured()) throw httpError(503, 'Storage is not connected to this project yet.');
    const body = await readJson(req);
    const projects = validate.projects(body && body.projects);

    const before = await store.read();
    const data = { projects, updatedAt: Date.now() };
    await store.write(data);

    // remove uploaded images that no project uses any more
    let removed = 0;
    if (before) {
      const keep = new Set(validate.images(projects));
      const gone = validate.images(before.projects).filter((u) => !keep.has(u));
      try { removed = await store.deleteImages(gone); } catch (e) { console.error('image cleanup failed', e); }
    }
    send(res, 200, { projects, updatedAt: data.updatedAt, removedImages: removed });
  }
});
