/* ==========================================================================
   Dashboard: add, edit, reorder and remove the projects shown on the site.
   Talks to /api/session, /api/projects and /api/upload.
   Every change is saved straight away; there is no separate "publish" step.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const src = (u) => (/^(https?:|\/)/.test(u) ? u : '/' + u);          // site files are stored as "assets/…"
  const slug = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const LAST = 'pf-admin-last';

  const state = { projects: [], updatedAt: 0, starter: false, busy: false };
  let draft = null;            // the project being edited
  let editIndex = -1;          // its place in the list, or -1 for a new one
  let pending = new Set();     // images uploaded in this editing session and not saved yet
  let uploads = 0;

  /* ------------------------------------------------------------------ api */
  async function api(path, opts = {}) {
    const headers = Object.assign({ Accept: 'application/json', 'X-Requested-With': 'pf-admin' }, opts.headers || {});
    let body = opts.body;
    if (body && !(body instanceof Blob) && typeof body !== 'string') { body = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
    let res;
    try {
      res = await fetch(path, { method: opts.method || 'GET', headers, body, credentials: 'same-origin', cache: 'no-store' });
    } catch (e) {
      throw Object.assign(new Error('No connection to the server. Check your internet and try again.'), { status: 0 });
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) {
      const fallback = res.status === 404 ? 'The dashboard service is not available at this address.' : `The server answered with an error (${res.status}).`;
      throw Object.assign(new Error((data && data.error) || fallback), { status: res.status });
    }
    return data || {};
  }

  /* ---------------------------------------------------------------- views */
  function show(id) {
    ['viewLoading', 'viewSetup', 'viewLogin', 'viewApp'].forEach((v) => { $('#' + v).hidden = v !== id; });
  }

  let toastTimer;
  function toast(msg, bad) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('is-bad', !!bad);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), bad ? 6000 : 3200);
  }

  async function boot() {
    show('viewLoading');
    let s;
    try { s = await api('/api/session'); } catch (e) {
      $('#viewLoading').innerHTML = `<div class="card"><h1 class="h1">The dashboard could not load</h1><p class="muted">${esc(e.message)}</p><div class="card__end"><button class="btn btn--accent" type="button" onclick="location.reload()">Try again</button></div></div>`;
      return;
    }
    const c = s.configured || {};
    if (!c.password || !c.storage) {
      $('#stepStorage').classList.toggle('is-done', !!c.storage);
      $('#stepPassword').classList.toggle('is-done', !!c.password);
      show('viewSetup');
      return;
    }
    if (!s.authed) { show('viewLogin'); $('#password').focus(); return; }
    await loadApp();
  }

  /* --------------------------------------------------------------- sign in */
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = $('#password'), err = $('#loginError'), btn = $('#loginBtn');
    err.textContent = '';
    if (!pw.value) { err.textContent = 'Type your password.'; pw.focus(); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      await api('/api/session', { method: 'POST', body: { password: pw.value } });
      pw.value = '';
      await loadApp();
    } catch (ex) {
      err.textContent = ex.message;
      pw.select();
    } finally { btn.disabled = false; btn.textContent = 'Sign in'; }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try { await api('/api/session', { method: 'DELETE' }); } catch (e) { /* signing out locally is enough */ }
    show('viewLogin');
  });
  $('#setupRetry').addEventListener('click', boot);

  /* ------------------------------------------------------------- projects */
  function normalize(list) {
    const used = new Set();
    return (Array.isArray(list) ? list : []).filter((p) => p && p.title).map((p) => {
      const base = slug(p.id || p.title) || 'project';
      let id = base, n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      return {
        id, title: String(p.title), category: p.category || '', year: String(p.year || ''), role: p.role || '',
        text: p.text || '', body: p.body || '', tags: Array.isArray(p.tags) ? p.tags.slice() : [],
        image: p.image || '', gallery: Array.isArray(p.gallery) ? p.gallery.slice() : [],
        links: (Array.isArray(p.links) ? p.links : []).map((l) => ({ label: (l && l.label) || '', url: (l && l.url) || '' }))
      };
    });
  }

  async function loadApp() {
    show('viewLoading');
    let data;
    try { data = await api('/api/projects?t=' + Date.now()); } catch (e) {
      if (e.status === 401) { show('viewLogin'); return; }
      // stop here: showing a list we could not read would let a save overwrite the real one
      $('#viewLoading').innerHTML = `<div class="card"><h1 class="h1">Your projects could not be loaded</h1><p class="muted">${esc(e.message)}</p><p class="muted">Nothing was changed.</p><div class="card__end"><button class="btn btn--accent" type="button" onclick="location.reload()">Try again</button></div></div>`;
      return;
    }
    let projects = data.projects, updatedAt = data.updatedAt || 0;
    // if this browser saved something newer than what the server just returned, keep the newer copy
    try {
      const last = JSON.parse(localStorage.getItem(LAST) || 'null');
      if (last && Array.isArray(last.projects) && last.updatedAt > updatedAt && Date.now() - last.updatedAt < 10 * 60 * 1000) {
        projects = last.projects; updatedAt = last.updatedAt;
      }
    } catch (e) { /* storage unavailable */ }

    state.starter = !Array.isArray(projects);
    state.projects = normalize(state.starter ? ((window.PORTFOLIO || {}).work || {}).projects : projects);
    state.updatedAt = updatedAt;
    renderList();
    show('viewApp');
  }

  function renderList() {
    const P = state.projects, list = $('#list');
    $('#starterNote').hidden = !state.starter || !P.length;
    $('#empty').hidden = P.length > 0;
    $('#summary').textContent = P.length
      ? `${P.length} ${P.length === 1 ? 'project' : 'projects'}, shown on the site in this order.`
      : 'Nothing on the site yet.';
    list.classList.toggle('is-busy', state.busy);
    list.innerHTML = P.map((p, i) => `
      <li class="row" data-i="${i}">
        <div class="row__order">
          <button class="iconbtn iconbtn--sm" type="button" data-act="up" aria-label="Move ${esc(p.title)} up"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
          <button class="iconbtn iconbtn--sm" type="button" data-act="down" aria-label="Move ${esc(p.title)} down"${i === P.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
        </div>
        <div class="row__thumb">${p.image ? `<img src="${esc(src(p.image))}" alt="" loading="lazy">` : icon('image')}</div>
        <div class="row__main">
          <p class="row__title">${esc(p.title)}</p>
          <p class="row__meta">${[p.year, p.category, p.role].filter(Boolean).map(esc).join(' · ') || 'No year or category yet'}</p>
          <p class="row__sum">${esc(p.text)}</p>
        </div>
        <div class="row__act">
          <a class="btn btn--ghost btn--sm" href="/#project-${esc(p.id)}" target="_blank" rel="noopener">View</a>
          <button class="btn btn--ghost btn--sm" type="button" data-act="edit">Edit</button>
          <button class="btn btn--ghost btn--sm" type="button" data-act="ask">Delete</button>
        </div>
      </li>`).join('');
  }

  /* send the whole list; on success the server's cleaned copy becomes the truth */
  async function save(next, okMessage) {
    if (state.busy) return false;
    state.busy = true; $('#list').classList.add('is-busy');
    try {
      const r = await api('/api/projects', { method: 'PUT', body: { projects: next } });
      state.projects = normalize(r.projects);
      state.updatedAt = r.updatedAt || Date.now();
      state.starter = false;
      try { localStorage.setItem(LAST, JSON.stringify({ updatedAt: state.updatedAt, projects: state.projects })); } catch (e) { /* fine without it */ }
      toast(okMessage + ' The site updates within a minute.');
      return true;
    } catch (e) {
      if (e.status === 401) { toast('You were signed out. Sign in and try again.', true); show('viewLogin'); }
      else toast(`Not saved. ${e.message}`, true);
      return false;
    } finally {
      state.busy = false;
      renderList();
    }
  }

  $('#list').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]'); if (!btn || state.busy) return;
    const row = btn.closest('.row'), i = Number(row.dataset.i), P = state.projects, act = btn.dataset.act;
    if (act === 'edit') return openEditor(i);
    if (act === 'up' || act === 'down') {
      const j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= P.length) return;
      const next = P.slice(); [next[i], next[j]] = [next[j], next[i]];
      await save(next, 'Order saved.');
      const again = $(`.row[data-i="${j}"] [data-act="${act}"]`);
      if (again) (again.disabled ? $(`.row[data-i="${j}"] [data-act="edit"]`) : again).focus();
      return;
    }
    if (act === 'ask') {   // confirm in place instead of a browser dialog
      $('.row__act', row).innerHTML = `<span class="row__ask">Delete this project?</span><button class="btn btn--danger btn--sm" type="button" data-act="delete">Delete</button><button class="btn btn--ghost btn--sm" type="button" data-act="keep">Keep</button>`;
      $('[data-act="keep"]', row).focus();
      return;
    }
    if (act === 'keep') return renderList();
    if (act === 'delete') {
      const title = P[i].title;
      await save(P.filter((_, k) => k !== i), `“${title}” was deleted.`);
    }
  });

  $('#addBtn').addEventListener('click', () => openEditor(-1));

  /* --------------------------------------------------------------- editor */
  const drawer = $('#drawer'), form = $('#form');
  const F = { title: $('#f-title'), year: $('#f-year'), category: $('#f-category'), role: $('#f-role'), text: $('#f-text'), body: $('#f-body'), tags: $('#f-tags') };

  function openEditor(i) {
    editIndex = i;
    const p = i >= 0 ? state.projects[i] : null;
    draft = p ? JSON.parse(JSON.stringify(p)) : { id: '', title: '', category: '', year: String(new Date().getFullYear()), role: '', text: '', body: '', tags: [], image: '', gallery: [], links: [] };
    pending = new Set(); uploads = 0;
    $('#formTitle').textContent = p ? 'Edit project' : 'Add project';
    $('#saveBtn').textContent = p ? 'Save changes' : 'Add project';
    $('#formError').textContent = '';
    $$('.field', form).forEach((f) => f.classList.remove('is-bad'));
    F.title.value = draft.title; F.year.value = draft.year; F.category.value = draft.category; F.role.value = draft.role;
    F.text.value = draft.text; F.body.value = draft.body; F.tags.value = draft.tags.join(', ');
    renderCover(); renderGallery(); renderLinks();
    drawer.inert = false; drawer.classList.add('is-open');
    $('.drawer__body').scrollTop = 0;
    $('#viewApp').inert = true;
    setTimeout(() => F.title.focus(), 60);
  }

  function hideEditor() {
    drawer.classList.remove('is-open'); drawer.inert = true;
    $('#viewApp').inert = false;
    draft = null;
  }

  /* closing without saving removes whatever was uploaded during this edit */
  function cancelEditor() {
    if (!draft) return;
    const orphans = Array.from(pending);
    hideEditor();
    orphans.forEach((u) => api('/api/upload?url=' + encodeURIComponent(u), { method: 'DELETE' }).catch(() => {}));
    $('#addBtn').focus();
  }
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) cancelEditor(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && draft) cancelEditor(); });

  /* ---- images */
  function renderCover(busy) {
    const box = $('#cover');
    box.classList.toggle('has-image', !!draft.image);
    box.innerHTML = (draft.image
      ? `<img src="${esc(src(draft.image))}" alt="Cover image preview"><div class="cover__bar"><button class="btn btn--ghost btn--sm" type="button" data-cover="pick">Replace</button><button class="btn btn--ghost btn--sm" type="button" data-cover="remove">Remove</button></div>`
      : `<div class="cover__empty">${icon('image')}<button class="btn btn--ghost btn--sm" type="button" data-cover="pick">Upload a cover image</button></div>`)
      + (busy ? '<div class="busy">Uploading…</div>' : '');
  }

  function renderGallery(busyCount) {
    const g = draft.gallery;
    $('#gallery').innerHTML = g.map((u, i) => `
      <figure class="shot">
        <img src="${esc(src(u))}" alt="Image ${i + 1}">
        <div class="shot__bar">
          <span style="display:flex;gap:.25rem">
            <button class="iconbtn iconbtn--sm" type="button" data-shot="left" data-i="${i}" aria-label="Move image ${i + 1} earlier"${i === 0 ? ' disabled' : ''}>${icon('left')}</button>
            <button class="iconbtn iconbtn--sm" type="button" data-shot="right" data-i="${i}" aria-label="Move image ${i + 1} later"${i === g.length - 1 ? ' disabled' : ''}>${icon('right')}</button>
          </span>
          <button class="iconbtn iconbtn--sm" type="button" data-shot="remove" data-i="${i}" aria-label="Remove image ${i + 1}">${icon('x')}</button>
        </div>
      </figure>`).join('')
      + (busyCount ? `<div class="shot"><div class="busy">Uploading ${busyCount}…</div></div>` : '')
      + `<button class="shot shot--add" type="button" data-shot="pick">${icon('plus')}<span>Add images</span></button>`;
  }

  /* shrink big photos in the browser so uploads stay small and the site stays fast */
  async function prepare(file) {
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) throw new Error(`“${file.name}” is not a JPG, PNG, WebP, GIF or AVIF image.`);
    const LIMIT = 4 * 1024 * 1024;
    if (file.type === 'image/gif') {
      if (file.size > LIMIT) throw new Error(`“${file.name}” is larger than 4 MB.`);
      return file;
    }
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { bmp = null; }
    if (!bmp) {
      if (file.size > LIMIT) throw new Error(`“${file.name}” is larger than 4 MB and could not be resized.`);
      return file;
    }
    const MAX = 2200, k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size < 700 * 1024) return file;   // already small: keep the original untouched
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    const encode = (type, q) => new Promise((ok) => cv.toBlob(ok, type, q));
    let out = await encode('image/webp', .86);
    if (!out || out.type !== 'image/webp') out = await encode('image/jpeg', .88);
    if (!out) throw new Error(`“${file.name}” could not be processed.`);
    if (out.size > LIMIT) throw new Error(`“${file.name}” is still larger than 4 MB after resizing.`);
    return out.size < file.size ? out : (file.size <= LIMIT ? file : out);
  }

  async function upload(file) {
    const blob = await prepare(file);
    const q = `name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(blob.type)}`;
    const r = await api('/api/upload?' + q, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: blob });
    pending.add(r.url);
    return r.url;
  }

  function discard(url) {   // an image dropped before it was ever saved can go right away
    if (!pending.has(url)) return;
    pending.delete(url);
    api('/api/upload?url=' + encodeURIComponent(url), { method: 'DELETE' }).catch(() => {});
  }

  const setUploading = (n) => { uploads += n; $('#saveBtn').disabled = uploads > 0; };

  $('#cover').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cover]'); if (!b || !draft) return;
    if (b.dataset.cover === 'pick') $('#f-cover').click();
    else { discard(draft.image); draft.image = ''; renderCover(); }
  });
  $('#f-cover').addEventListener('change', async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file || !draft) return;
    const mine = draft;
    setUploading(1); renderCover(true); $('#formError').textContent = '';
    try {
      const url = await upload(file);
      if (draft !== mine) { discard(url); return; }
      discard(mine.image); mine.image = url;
    } catch (ex) { if (draft === mine) $('#formError').textContent = ex.message; }
    finally { setUploading(-1); if (draft === mine) renderCover(); }
  });

  $('#gallery').addEventListener('click', (e) => {
    const b = e.target.closest('[data-shot]'); if (!b || !draft) return;
    const i = Number(b.dataset.i), g = draft.gallery, act = b.dataset.shot;
    if (act === 'pick') return $('#f-gallery').click();
    if (act === 'remove') { discard(g[i]); g.splice(i, 1); }
    if (act === 'left' && i > 0) [g[i - 1], g[i]] = [g[i], g[i - 1]];
    if (act === 'right' && i < g.length - 1) [g[i + 1], g[i]] = [g[i], g[i + 1]];
    renderGallery();
  });
  $('#f-gallery').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files); e.target.value = '';
    if (!files.length || !draft) return;
    const mine = draft;
    let left = files.length;
    setUploading(1); renderGallery(left); $('#formError').textContent = '';
    for (const file of files) {
      try {
        if (mine.gallery.length >= 24) throw new Error('A project can have up to 24 extra images.');
        const url = await upload(file);
        if (draft !== mine) { discard(url); break; }
        mine.gallery.push(url);
      } catch (ex) { if (draft === mine) $('#formError').textContent = ex.message; }
      left--;
      if (draft === mine) renderGallery(left);
    }
    setUploading(-1);
  });

  /* ---- links */
  function renderLinks() {
    $('#links').innerHTML = draft.links.map((l, i) => `
      <div class="link">
        <input type="text" id="f-link-label-${i}" data-link="label" data-i="${i}" value="${esc(l.label)}" placeholder="Button text" maxlength="40" aria-label="Link ${i + 1} button text" autocomplete="off">
        <input type="url" id="f-link-url-${i}" data-link="url" data-i="${i}" value="${esc(l.url)}" placeholder="https://…" maxlength="600" aria-label="Link ${i + 1} address" autocomplete="off">
        <button class="iconbtn" type="button" data-link="remove" data-i="${i}" aria-label="Remove link ${i + 1}">${icon('x')}</button>
      </div>`).join('');
    $('#addLink').hidden = draft.links.length >= 6;
  }
  $('#links').addEventListener('input', (e) => {
    const el = e.target.closest('input[data-link]'); if (!el || !draft) return;
    draft.links[Number(el.dataset.i)][el.dataset.link] = el.value;
  });
  $('#links').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-link="remove"]'); if (!b || !draft) return;
    draft.links.splice(Number(b.dataset.i), 1); renderLinks();
  });
  $('#addLink').addEventListener('click', () => {
    if (!draft) return;
    draft.links.push({ label: draft.links.length ? '' : 'View case study', url: '' });
    renderLinks();
    $(`#f-link-url-${draft.links.length - 1}`).focus();
  });

  /* ---- save */
  Object.values(F).forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('is-bad')));
  form.addEventListener('input', () => { $('#formError').textContent = ''; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!draft || uploads > 0) return;
    const err = $('#formError'); err.textContent = '';
    const title = F.title.value.trim(), text = F.text.value.trim();
    const bad = [];
    if (!title) bad.push([F.title, 'Give the project a title.']);
    if (!text) bad.push([F.text, 'Write a short summary for the project card.']);
    const links = draft.links.map((l) => ({ label: l.label.trim(), url: l.url.trim() })).filter((l) => l.label || l.url);
    const wrong = links.find((l) => !l.label || !/^(https?:\/\/|mailto:)\S+$/i.test(l.url));
    if (bad.length) {
      bad.forEach(([el]) => el.closest('.field').classList.add('is-bad'));
      err.textContent = bad[0][1]; bad[0][0].focus(); return;
    }
    if (wrong) { err.textContent = 'Each link needs button text and an address that starts with https://'; return; }

    const p = Object.assign({}, draft, {
      title, text,
      year: F.year.value.trim(), category: F.category.value.trim(), role: F.role.value.trim(), body: F.body.value.trim(),
      tags: F.tags.value.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12),
      links
    });
    if (editIndex < 0) p.id = '';   // the server derives the address from the title
    const next = state.projects.slice();
    if (editIndex >= 0) next[editIndex] = p; else next.unshift(p);   // new projects go first

    const btn = $('#saveBtn'), label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Saving…';
    const ok = await save(next, editIndex >= 0 ? 'Changes saved.' : `“${title}” was added.`);
    btn.disabled = false; btn.textContent = label;
    if (ok) { pending = new Set(); hideEditor(); }
    else if (draft) err.textContent = 'This was not saved. Check the message below and try again.';
  });

  boot();
})();
