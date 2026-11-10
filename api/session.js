'use strict';
/* GET    /api/session   is the dashboard set up, and is this browser signed in?
   POST   /api/session   sign in   { password }
   DELETE /api/session   sign out */

const { send, readJson, route, httpError } = require('./_lib/http');
const auth = require('./_lib/auth');
const store = require('./_lib/store');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = route({
  async GET(req, res) {
    send(res, 200, {
      configured: { password: auth.configured(), storage: store.configured() },
      authed: auth.isAuthed(req)
    });
  },

  async POST(req, res) {
    if (req.headers['x-requested-with'] !== 'pf-admin') throw httpError(403, 'This request did not come from the dashboard.');
    if (!auth.configured()) throw httpError(503, 'ADMIN_PASSWORD is not set for this project.');
    const body = await readJson(req);
    if (!auth.checkPassword(body && body.password)) {
      await wait(800);   // slows down password guessing
      throw httpError(401, 'That password is not correct.');
    }
    send(res, 200, { authed: true }, { 'Set-Cookie': auth.sessionCookie(req, auth.issueToken()) });
  },

  async DELETE(req, res) {
    send(res, 200, { authed: false }, { 'Set-Cookie': auth.sessionCookie(req, '') });
  }
});
