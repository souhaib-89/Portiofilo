'use strict';
/* Cleans the project list that the dashboard sends before it is stored.
   Everything is trimmed and length-limited, and only web addresses that are safe
   to put in a link or an <img> are kept. */

const { httpError } = require('./http');

const LIMITS = { projects: 60, tags: 12, links: 6, gallery: 24 };

const text = (v, max) => String(v == null ? '' : v).replace(/\r\n?/g, '\n').trim().slice(0, max);
const line = (v, max) => text(v, max).replace(/\s*\n\s*/g, ' ');

function slug(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/* http(s) links only (mailto is allowed for buttons) */
function linkUrl(v) {
  const s = line(v, 600);
  return /^(https?:\/\/|mailto:)[^\s"'<>]+$/i.test(s) ? s : '';
}

/* images: an uploaded file, a full web address, or a file that ships with the site */
function imageUrl(v) {
  const s = line(v, 600);
  if (/^https?:\/\/[^\s"'<>]+$/i.test(s)) return s;
  if (/^(assets\/|\/assets\/|\/_store\/)[\w./-]+$/.test(s) && !s.includes('..')) return s;
  return '';
}

function project(raw, used) {
  if (!raw || typeof raw !== 'object') throw httpError(400, 'A project in the list is not valid.');
  const title = line(raw.title, 120);
  if (!title) throw httpError(400, 'Every project needs a title.');

  let id = slug(raw.id) || slug(title) || 'project';
  let unique = id, n = 2;
  while (used.has(unique)) unique = `${id}-${n++}`;
  used.add(unique);

  const list = (v, max) => (Array.isArray(v) ? v : []).slice(0, max);
  return {
    id: unique,
    title,
    category: line(raw.category, 60),
    year: line(raw.year, 12),
    role: line(raw.role, 60),
    text: text(raw.text, 400),
    body: text(raw.body, 8000),
    tags: list(raw.tags, LIMITS.tags).map((t) => line(t, 40)).filter(Boolean),
    image: imageUrl(raw.image),
    gallery: list(raw.gallery, LIMITS.gallery).map(imageUrl).filter(Boolean),
    links: list(raw.links, LIMITS.links)
      .map((l) => ({ label: line(l && l.label, 40), url: linkUrl(l && l.url) }))
      .filter((l) => l.label && l.url)
  };
}

function projects(input) {
  if (!Array.isArray(input)) throw httpError(400, 'Send the projects as a list.');
  if (input.length > LIMITS.projects) throw httpError(400, `That is more than ${LIMITS.projects} projects.`);
  const used = new Set();
  return input.map((p) => project(p, used));
}

const images = (list) => (list || []).flatMap((p) => [p.image].concat(p.gallery || [])).filter(Boolean);

module.exports = { projects, images, slug };
