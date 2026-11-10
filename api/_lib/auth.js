'use strict';
/* Password login for the dashboard. The password lives in the ADMIN_PASSWORD
   environment variable. A successful login sets a signed, HttpOnly cookie;
   nothing is stored on the server, and changing the password signs everyone out. */

const crypto = require('crypto');
const { cookies, httpError } = require('./http');

const COOKIE = 'pf_admin';
const MAX_AGE = 60 * 60 * 24 * 14;   // 14 days, in seconds

const password = () => String(process.env.ADMIN_PASSWORD || '');
const configured = () => password().length > 0;
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const sign = (exp) => crypto.createHmac('sha256', sha('pf-session:' + password())).update(String(exp)).digest('base64url');

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function checkPassword(candidate) {
  return configured() && crypto.timingSafeEqual(sha(candidate), sha(password()));
}

function issueToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  return exp + '.' + sign(exp);
}

function validToken(token) {
  if (!configured() || !token) return false;
  const [exp, sig] = String(token).split('.');
  if (!/^\d+$/.test(exp || '') || Number(exp) < Date.now()) return false;
  return same(sig || '', sign(exp));
}

function isAuthed(req) {
  return validToken(cookies(req)[COOKIE]);
}

function sessionCookie(req, token) {
  const host = String(req.headers.host || '');
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  return [
    `${COOKIE}=${token ? encodeURIComponent(token) : ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    local ? '' : 'Secure',
    `Max-Age=${token ? MAX_AGE : 0}`
  ].filter(Boolean).join('; ');
}

/* Guard for anything that changes data: must be signed in, and the request must
   carry the header the dashboard sends (other sites cannot add it to a request). */
function requireAdmin(req) {
  if (req.headers['x-requested-with'] !== 'pf-admin') throw httpError(403, 'This request did not come from the dashboard.');
  if (!configured()) throw httpError(503, 'ADMIN_PASSWORD is not set for this project.');
  if (!isAuthed(req)) throw httpError(401, 'Sign in again to continue.');
}

module.exports = { configured, checkPassword, issueToken, isAuthed, sessionCookie, requireAdmin };
