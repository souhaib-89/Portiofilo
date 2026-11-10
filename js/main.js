/* ==========================================================================
   Souhaib Abdulaal Portfolio — behaviour
   Reads window.PORTFOLIO (js/content.js), builds the page, then adds motion.
   Libraries (loaded in index.html): GSAP + ScrollTrigger, Lenis.
   Everything degrades gracefully: without them the page is still complete.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const C = window.PORTFOLIO;
  if (!C) { root.classList.remove('pre'); return; }

  /* ---------------------------------------------------------------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: ignore */ } }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const draft = !!(C.meta && C.meta.draft);
  let lenis = null;

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
  const refresh = debounce(() => {
    if (lenis) lenis.resize();
    if (hasGsap) ScrollTrigger.refresh();
  }, 120);

  /* "Some *highlighted* words" -> one clipped box per word (for reveal animations) */
  function words(str) {
    let i = 0;
    const out = [];
    String(str).split(/(\*[^*]+\*)/).filter(Boolean).forEach((seg) => {
      const hl = /^\*.+\*$/.test(seg);
      (hl ? seg.slice(1, -1) : seg).split(/\s+/).filter(Boolean).forEach((w) => {
        out.push(`<span class="w"><span class="wi${hl ? ' hl' : ''}" style="--i:${i++}">${esc(w)}</span></span>`);
      });
    });
    return out.join(' ');
  }

  /* a real link, or (while drafting) a look-alike that says what is missing */
  function link(url, cls, inner) {
    if (url) {
      const ext = /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : '';
      return `<a class="${cls}" href="${esc(url)}"${ext}>${inner}</a>`;
    }
    return draft ? `<span class="${cls} is-placeholder" title="Add this link in js/content.js">${inner}</span>` : '';
  }

  /* ================================================================= render */
  function render() {
    const M = C.meta || {};

    $$('[data-t]').forEach((el) => { const v = get(el.dataset.t); if (v != null) el.textContent = v; });
    $$('[data-words]').forEach((el) => { const v = get(el.dataset.words); if (v != null) el.innerHTML = words(v); });
    $$('.ghost').forEach((g) => g.style.setProperty('--len', Math.max(4, g.textContent.trim().length)));

    /* navigation */
    const nav = C.nav || [];
    $('#nav').insertAdjacentHTML('beforeend', nav.map((n) => `<a class="pill" href="#${esc(n.id)}">${esc(n.label)}</a>`).join(''));
    $('#menuNav').innerHTML = nav.map((n, i) => `<a class="menu__a" href="#${esc(n.id)}" style="--i:${i}"><small>${pad(i + 1)}</small><span>${esc(n.label)}</span></a>`).join('');
    $('#ftrNav').innerHTML = nav.map((n) => `<a class="lnk" href="#${esc(n.id)}">${esc(n.label)}</a>`).join('');

    const cta = $('#hdrCta');
    if (M.resumeUrl) {
      cta.href = M.resumeUrl; cta.target = '_blank'; cta.rel = 'noopener';
      $('span', cta).textContent = 'Resume';
    }

    $$('[data-socials]').forEach((ul) => {
      const pills = ul.classList.contains('soc--pills');
      ul.innerHTML = (C.socials || []).map((s) => {
        const a = link(s.url, pills ? 'soc__a' : 'soc__a lnk', `${esc(s.label)}${icon('ur')}`);
        return a ? `<li>${a}</li>` : '';
      }).join('');
    });
    $$('[data-mail]').forEach((a) => { a.textContent = M.email || ''; a.href = `mailto:${M.email || ''}`; });

    /* hero */
    const H = C.hero || {};
    $('#heroTitle').innerHTML = (H.title || []).map((line) => {
      const ws = [];
      String(line).split(/(\*[^*]+\*)/).filter(Boolean).forEach((seg) => {
        const o = /^\*.+\*$/.test(seg);
        (o ? seg.slice(1, -1) : seg).split(/\s+/).filter(Boolean).forEach((w) => ws.push(`<span class="w"><span class="wi${o ? ' o' : ''}">${esc(w)}</span></span>`));
      });
      return `<span class="ln">${ws.join(' ')}</span>`;
    }).join(' ');
    const photos = H.photos || [];
    const alt = `Portrait of ${M.fullName || M.name || ''}`;
    [['#heroPhotoA', photos[0]], ['#heroPhotoB', photos[1] || photos[0]], ['#heroAvatar', photos[0]]].forEach(([sel, src], i) => {
      const img = $(sel); if (!img || !src) return;
      img.src = src; img.alt = i < 2 ? alt : '';
    });
    $('#heroCta').innerHTML = (H.cta || []).map((b, i) =>
      `<a class="btn btn--${b.style === 'ghost' ? 'ghost' : 'accent'}" href="${esc(b.href)}"${i === 0 ? ' data-magnetic=".25"' : ''}><span>${esc(b.label)}</span>${i === 0 ? icon('ur') : ''}</a>`).join('');

    /* ribbons */
    $$('[data-ribbon]').forEach((t) => {
      const items = (C.ribbons || [])[+t.dataset.ribbon] || [];
      t.innerHTML = `<div class="ribbon__set">${items.map((s) => `<span>${esc(s)}</span>${icon('spark')}`).join('')}</div>`;
    });

    /* about */
    const A = C.about || {};
    $('#badgeText').textContent = A.badge || '';
    const ap = $('#aboutPhoto'); if (A.photo) { ap.src = A.photo; ap.alt = alt; }
    $('#rot').innerHTML = (A.roles || []).map((r, i) => `<span${i === 0 ? ' class="is-on"' : ''}>${esc(r)}</span>`).join('');
    $('#aboutText').innerHTML = (A.text || []).map((p) => `<p>${esc(p)}</p>`).join('');
    $('#stats').innerHTML = (A.stats || []).map((s) =>
      `<div class="stat" data-reveal><dt class="stat__l">${esc(s.label)}</dt><dd class="stat__n"><span data-count="${+s.value || 0}">${+s.value || 0}</span><em>${esc(s.suffix || '')}</em></dd></div>`).join('');
    const langs = A.languages || [];
    $('#aboutLangs').innerHTML = langs.map((l) => `<li class="chip">${esc(l)}</li>`).join('');
    $('#aboutLangsWrap').hidden = !langs.length;

    /* stack */
    const S = C.stack || {};
    $('#legend').insertAdjacentHTML('beforeend', ['All'].concat(S.groups || []).map((g, i) =>
      `<button class="pill" type="button" data-group="${i ? esc(g) : ''}" aria-pressed="${!i}">${esc(g)}</button>`).join(''));
    $('#tiles').innerHTML = (S.items || []).map((t, i) =>
      `<li data-reveal><div class="tile" tabindex="0" data-group="${esc(t.group)}"><span class="tile__n"><span>${pad(i + 1)}</span></span><span class="tile__sym" aria-hidden="true">${esc(t.sym)}</span><span><span class="tile__name">${esc(t.name)}</span><span class="tile__g">${esc(t.group)}</span></span></div></li>`).join('');

    /* services + process */
    $('#svcCards').innerHTML = ((C.services || {}).items || []).map((s, i) =>
      `<div data-reveal><article class="svc${i === 0 ? ' is-active' : ''}" tabindex="0"><i class="svc__rule"></i><h3 class="svc__t">${esc(s.title)}</h3><p class="svc__d">${esc(s.text)}</p><div class="svc__foot"><p class="svc__tags">${(s.tags || []).map(esc).join(' · ')}</p><span class="svc__go">${icon('ur')}</span></div></article></div>`).join('');
    $('#steps').innerHTML = ((C.process || {}).steps || []).map((s, i) =>
      `<button class="step" type="button" role="tab" aria-selected="false" data-i="${i}" aria-label="Step ${i + 1}: ${esc(s.title)}"><span class="step__w">Step </span>${pad(i + 1)}</button>`).join('');

    /* experience */
    $('#xpList').innerHTML = ((C.experience || {}).items || []).map((x, i) => `
      <li data-reveal><div class="xp__row${i === 0 ? ' is-open' : ''}">
        <button class="xp__head" type="button" aria-expanded="${i === 0}" aria-controls="xp-${i}">
          <span class="xp__n">${pad(i + 1)}</span>
          <span class="xp__cell"><small>${esc(x.period)}</small><b>${esc(x.role)}</b></span>
          <span class="xp__cell xp__cell--where"><small>Location</small><b>${icon('pin')}${esc(x.place)}</b></span>
          <span class="xp__cell xp__cell--type"><small>Type</small><b>${esc(x.type)}</b></span>
          <span class="xp__toggle"><span class="xp__tl">${i === 0 ? 'Hide' : 'Show'}</span>${icon('chev')}</span>
        </button>
        <div class="xp__panel" id="xp-${i}"><div class="xp__in"><div class="xp__grid">
          <span></span>
          <div><small>Focus</small><ul class="chips">${(x.stack || []).map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul></div>
          <div><small>Details</small><p>${esc(x.text)}</p><ul class="ticks">${(x.points || []).map((p) => `<li>${icon('spark')}<span>${esc(p)}</span></li>`).join('')}</ul></div>
        </div></div></div>
      </div></li>`).join('');

    /* courses */
    const courses = (C.experience || {}).courses || [];
    $('#certs').innerHTML = courses.map((c) => `
      <div data-reveal><article class="cert">
        <p class="cert__by">${esc(c.by || '')}</p>
        <h4 class="cert__t">${esc(c.title)}</h4>
        <p class="cert__d">${esc(c.text || '')}</p>
        ${c.link ? link(c.link.url, 'cert__a lnk', `${esc(c.link.label)} ${icon('ur')}`) : ''}
      </article></div>`).join('');
    $('#certsWrap').hidden = !courses.length;

    /* contact + footer */
    $('#interestList').innerHTML = ((C.contact || {}).interests || []).map((t, i) =>
      `<label><input type="checkbox" id="cf-int-${i}" name="interest" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('');
    $('#ftrWord').innerHTML = `<span class="ftr__w">${Array.from(String(M.name || '')).map((ch) => `<span>${esc(ch)}</span>`).join('')}</span>`;
    $('#copyright').textContent = `© ${new Date().getFullYear()} ${M.fullName || M.name || ''}. All rights reserved.`;
  }

  /* ========================================================= colour system */
  const ACCENTS = [
    { id: 'signal', name: 'Signal yellow', hex: '#ffe01b' },
    { id: 'ember', name: 'Ember orange', hex: '#ff5a1f' },
    { id: 'volt', name: 'Electric blue', hex: '#3d6dff' },
    { id: 'mint', name: 'Mint', hex: '#3df0a2' },
    { id: 'lilac', name: 'Lilac', hex: '#b9a3ff' }
  ];
  const INK = [17, 17, 15];
  const PAPER = [246, 245, 241];
  const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = (c) => {
    const [r, g, b] = c.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

  let mode = root.dataset.mode === 'light' ? 'light' : 'dark';
  let accentId = store.get('pf-accent');            // null until the visitor picks one
  const accent = () => ACCENTS.find((a) => a.id === (accentId || (mode === 'light' ? 'ember' : 'signal'))) || ACCENTS[0];

  function applyAccent() {
    const a = accent();
    const c = toRgb(a.hex);
    // text that sits on the accent: whichever of ink / white reads better
    const ink = contrast(c, INK) >= contrast(c, [255, 255, 255]) ? '#11110f' : '#ffffff';
    // a deeper cut of the accent for small text on the light ground
    let d = c.slice();
    for (let k = 0; k < 24 && contrast(d, PAPER) < 4.2; k++) d = d.map((v) => Math.round(v * .94));
    root.style.setProperty('--accent', a.hex);
    root.style.setProperty('--accent-ink', ink);
    root.style.setProperty('--accent-deep', `rgb(${d.join(' ')})`);
    $$('.sw').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === a.id)));
    document.dispatchEvent(new CustomEvent('pf:theme'));
  }

  function setMode(next, origin) {
    const apply = () => {
      mode = next;
      root.dataset.mode = next;
      store.set('pf-mode', next);
      const tc = $('meta[name="theme-color"]'); if (tc) tc.content = next === 'light' ? '#f6f5f1' : '#0e0e0d';
      $('#modeBtn').setAttribute('aria-label', next === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      applyAccent();
    };
    if (!origin || reduce || !document.startViewTransition) { apply(); return; }
    const { x, y } = origin;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  }

  function initTheme() {
    const box = $('#accent'), btn = $('#accentBtn');
    // the swatches live in two places: the floating palette (desktop) and the menu (small screens)
    $$('[data-accents]').forEach((list) => {
      list.innerHTML = ACCENTS.map((a) => `<button class="sw" type="button" role="radio" aria-checked="false" data-id="${a.id}" style="--c:${a.hex}" aria-label="${a.name}" title="${a.name}"></button>`).join('');
    });
    const open = (v) => { box.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', String(v)); };
    btn.addEventListener('click', () => open(!box.classList.contains('is-open')));
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.sw');
      if (b) { accentId = b.dataset.id; store.set('pf-accent', accentId); applyAccent(); return; }
      if (!e.target.closest('#accent')) open(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });

    $('#modeBtn').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setMode(mode === 'light' ? 'dark' : 'light', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
    $('#modeBtn').setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    applyAccent();

    // when embedded in a host that sets data-theme, follow it until the visitor picks a mode here
    new MutationObserver(() => {
      const t = root.getAttribute('data-theme');
      if ((t === 'light' || t === 'dark') && t !== mode && !store.get('pf-mode')) { mode = t; root.dataset.mode = t; applyAccent(); }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ========================================================== smooth scroll */
  function initScroll() {
    if (!reduce && window.Lenis) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6
      });
      if (hasGsap) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    }

    // in-page links glide instead of jumping
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null; if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(id === 'home' ? 0 : target, { duration: 1.5 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ================================================================ header */
  const menu = $('#menu'), burger = $('#burger');
  function setMenu(open) {
    if (!menu || menu.classList.contains('is-open') === open) return;
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    else document.body.style.overflow = open ? 'hidden' : '';
  }

  /* a row of pills with one marker that slides to the hovered / active pill */
  function pillTrack(track) {
    const ind = $('.pillind', track);
    let active = null, hover = null;
    const place = (el) => {
      if (!el || !el.offsetWidth) return;
      ind.style.width = `${el.offsetWidth}px`;
      ind.style.height = `${el.offsetHeight}px`;
      ind.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
      $$('.pill', track).forEach((p) => p.classList.toggle('is-lit', p === el));
      if (!track.classList.contains('is-ready')) requestAnimationFrame(() => requestAnimationFrame(() => track.classList.add('is-ready')));
    };
    const sync = () => place(hover || active);
    track.addEventListener('pointerover', (e) => { const p = e.target.closest('.pill'); if (p && e.pointerType === 'mouse') { hover = p; place(p); } });
    track.addEventListener('pointerleave', () => { hover = null; place(active); });
    addEventListener('resize', debounce(sync, 100));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    return { set(el) { active = el; if (!hover) place(el); }, sync };
  }

  function initHeader() {
    const hdr = $('#hdr'), bar = $('#progress');
    const onScroll = () => {
      const y = window.scrollY;
      hdr.classList.toggle('is-scrolled', y > 24);
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();

    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width: 64.01rem)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

    // highlight the section under the middle of the screen
    const navTrack = pillTrack($('#nav'));
    const setCurrent = (id) => {
      const pill = $(`#nav .pill[href="#${id}"]`); if (pill) navTrack.set(pill);
      $$('.menu__a').forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
    };
    setCurrent('home');
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.dataset.spy || e.target.id); }), { rootMargin: '-45% 0px -54% 0px' });
    $$('[data-spy]').forEach((s) => spy.observe(s));
  }

  /* ========================================= greeting in many languages */
  function initHello() {
    const el = $('#helloWord'), list = C.greetings || [];
    if (!el || !list.length) return;
    const set = (g) => { el.textContent = g.text; el.lang = g.lang || ''; el.dir = 'auto'; };
    set(list[0]);
    if (reduce || list.length < 2 || !el.animate) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const out = el.animate(
        [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-110%)', opacity: 0 }],
        { duration: 260, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
      out.onfinish = () => {
        i = (i + 1) % list.length;
        set(list[i]);
        out.cancel();
        el.animate(
          [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 520, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      };
    }, 1700);
  }

  /* ========================================================= reveal engine */
  function initReveal() {
    if (reduce) return;
    root.classList.add('anim');
    const io = new IntersectionObserver((entries) => {
      const batch = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
      batch.forEach((e, k) => {
        const el = e.target;
        el.style.setProperty('--d', `${(Math.min(k, 12) * .07).toFixed(2)}s`);
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach((el) => io.observe(el));
  }

  /* ================================================================== hero */
  function initHero() {
    root.classList.remove('pre');            // from here on the script owns the hero's visibility
    if (!hasGsap || reduce) return;
    const hero = $('.hero');

    // entrance
    gsap.timeline({ defaults: { ease: 'expo.out' }, delay: .1 })
      .from('.hdr__in', { y: -36, opacity: 0, duration: 1.1, clearProps: 'transform' }, 0)
      .from('.hero .ghost span', { xPercent: 12, opacity: 0, duration: 2.2, ease: 'power4.out' }, 0)
      .from('.hero__hi', { y: 18, opacity: 0, duration: .9 }, .15)
      .from('.hero__title .wi', { yPercent: 125, rotation: 6, duration: 1.3, stagger: .075 }, .2)
      .from('.hero__card-m', { scale: .3, rotation: (i) => (i ? 42 : -42), opacity: 0, duration: 1.35, ease: 'back.out(1.6)', stagger: .13 }, .7)
      .from('.spark__m', { scale: 0, rotation: -150, opacity: 0, duration: 1.2, ease: 'back.out(2.4)', stagger: .09 }, .85)
      .from('.hero__tag-in', { scale: 0, rotation: -16, opacity: 0, duration: .9, ease: 'back.out(2)' }, 1.05)
      .from('.hero__intro, .hero__cta, .hero__foot > *', { y: 24, opacity: 0, duration: 1, stagger: .07 }, 1.05);

    // depth on scroll: every layer leaves at its own speed
    const st = (o) => Object.assign({ trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }, o);
    gsap.to('.hero__block', { yPercent: -14, ease: 'none', scrollTrigger: st() });
    gsap.to('.hero__card--a', { yPercent: -95, rotation: -16, ease: 'none', scrollTrigger: st() });
    gsap.to('.hero__card--b', { yPercent: 75, rotation: 14, ease: 'none', scrollTrigger: st() });
    gsap.to('.hero__tag', { yPercent: 170, ease: 'none', scrollTrigger: st() });
    gsap.to('.spark', { yPercent: (i) => [-240, -150, 230, -190][i % 4], rotation: (i) => [200, -140, 160, -220][i % 4], ease: 'none', scrollTrigger: st() });
    gsap.to('.hero .ghost', { xPercent: -14, ease: 'none', scrollTrigger: st({ scrub: 1.4 }) });
    gsap.to('.hero__stage', { opacity: 0, ease: 'none', scrollTrigger: st({ start: '14% top', end: '78% top' }) });
    gsap.to('.hero__foot', { opacity: 0, ease: 'none', scrollTrigger: st({ end: '20% top' }) });

    // depth on pointer: layers lean away from the cursor
    if (fine) {
      const layers = $$('[data-depth]', hero).map((el) => ({
        d: parseFloat(el.dataset.depth) || 0,
        x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3' })
      }));
      const ghostX = gsap.quickTo('.hero .ghost span', 'x', { duration: 1.3, ease: 'power2' });
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        layers.forEach((l) => { l.x(nx * l.d * 46); l.y(ny * l.d * 34); });
        ghostX(nx * -46);
      });
      hero.addEventListener('pointerleave', () => { layers.forEach((l) => { l.x(0); l.y(0); }); ghostX(0); });
    }
  }

  /* ========================================================== scroll motion */
  function initScrollMotion() {
    if (!hasGsap || reduce) return;

    // ghost words drift sideways as their section passes
    $$('.sec .ghost').forEach((g) => {
      const dir = parseFloat(g.dataset.ghost) || 1;
      gsap.fromTo(g, { xPercent: 9 * dir }, { xPercent: -9 * dir, ease: 'none', scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    });

    // decorative shapes float past at their own pace
    $$('[data-float]').forEach((el) => {
      const v = parseFloat(el.dataset.float) || 60;
      gsap.fromTo(el, { y: -v }, { y: v, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.3 } });
    });

    // photos move slightly slower than their frames
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // the about statement lights up word by word while you read
    const ws = $$('#aboutStatement .wi');
    if (ws.length) {
      gsap.fromTo(ws, { opacity: .16 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '#aboutStatement', start: 'top 86%', end: 'bottom 52%', scrub: .5 } });
    }

    // the spinning badge speeds up with the scroll
    const ring = $('.badge__ring');
    if (ring && ring.getAnimations) {
      let t;
      ScrollTrigger.create({
        onUpdate(self) {
          const a = ring.getAnimations()[0]; if (!a) return;
          a.playbackRate = 1 + Math.min(8, Math.abs(self.getVelocity()) / 260);
          clearTimeout(t); t = setTimeout(() => { a.playbackRate = 1; }, 180);
        }
      });
    }

    // footer wordmark rises letter by letter
    gsap.from('.ftr__w > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '#ftrWord', start: 'top 96%' } });
  }

  /* =============================================================== ribbons */
  function initRibbons() {
    const rows = $$('.ribbon__track').map((track, idx) => {
      const set = track.firstElementChild; if (!set) return null;
      const fill = () => {
        while (track.children.length > 1) track.lastElementChild.remove();
        const sw = set.getBoundingClientRect().width; if (!sw) return 0;
        const need = Math.ceil((track.parentElement.offsetWidth * 1.15) / sw) + 1;
        for (let k = 0; k < need; k++) track.appendChild(set.cloneNode(true));
        return sw;
      };
      return { track, dir: idx % 2 ? 1 : -1, x: 0, sw: fill(), fill };
    }).filter(Boolean);
    if (!rows.length) return;
    const refill = () => rows.forEach((r) => { r.sw = r.fill(); });
    addEventListener('resize', debounce(refill, 200));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refill);
    if (reduce) return;

    let seen = true, last = performance.now(), prevY = window.scrollY, sdir = 1;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe($('.ribbons'));
    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = Math.min(50, now - last) / 16.67; last = now;
      const y = window.scrollY, v = y - prevY; prevY = y;
      if (!seen || document.hidden) return;
      if (Math.abs(v) > .5) sdir = v > 0 ? 1 : -1;            // scrolling up reverses the ribbons
      const boost = Math.min(Math.abs(v), 70) * .22;
      rows.forEach((r) => {
        if (!r.sw) return;
        r.x += r.dir * sdir * (.7 + boost) * dt;
        r.x = (((r.x % r.sw) + r.sw) % r.sw) - r.sw;
        r.track.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
      });
    };
    requestAnimationFrame(tick);
  }

  /* ================================================================= about */
  function initAbout() {
    // rotating role
    const rs = $$('#rot span');
    if (rs.length > 1 && !reduce) {
      let i = 0, seen = false;
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe($('#rot'));
      setInterval(() => {
        if (!seen || document.hidden) return;
        const cur = rs[i]; i = (i + 1) % rs.length; const nxt = rs[i];
        cur.classList.remove('is-on'); cur.classList.add('is-off');
        nxt.classList.remove('is-off'); nxt.classList.add('is-on');
        setTimeout(() => cur.classList.remove('is-off'), 750);
      }, 2400);
    }

    // numbers count up once, when they scroll into view
    if (!reduce) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, end = +el.dataset.count || 0, t0 = performance.now(), dur = 1700;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(2, -10 * p)) / (1 - Math.pow(2, -10)));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      }), { threshold: .6 });
      $$('[data-count]').forEach((el) => io.observe(el));
    }
  }

  /* ================================================================= stack */
  function initStack() {
    const legend = $('#legend'), tiles = $('#tiles'); if (!legend) return;
    const track = pillTrack(legend);
    track.set($('.pill', legend));
    legend.addEventListener('click', (e) => {
      const b = e.target.closest('.pill'); if (!b) return;
      const g = b.dataset.group;
      track.set(b);
      $$('.pill', legend).forEach((p) => p.setAttribute('aria-pressed', String(p === b)));
      tiles.classList.toggle('is-filtered', !!g);
      $$('.tile', tiles).forEach((t) => t.classList.toggle('is-match', !!g && t.dataset.group === g));
    });
  }

  /* ============================================================== services */
  function initServices() {
    const cards = $$('.svc');
    const on = (c) => cards.forEach((x) => x.classList.toggle('is-active', x === c));
    cards.forEach((c) => {
      c.addEventListener('pointerenter', () => on(c));
      c.addEventListener('focus', () => on(c));
      c.addEventListener('click', () => on(c));
    });

    // "how I work": one step at a time, advancing on its own while in view
    const S = (C.process || {}).steps || [], box = $('#process'), body = $('#processBody');
    if (!S.length || !box) return;
    let i = -1;
    const show = (n) => {
      i = (n + S.length) % S.length;
      $('#processNum').textContent = pad(i + 1);
      $('#processTitle').textContent = S[i].title;
      $('#processText').textContent = S[i].text;
      $('#processCount').textContent = `${pad(i + 1)} / ${pad(S.length)}`;
      $$('.step', box).forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', String(k === i)); });
      body.classList.remove('is-swap'); void body.offsetWidth; body.classList.add('is-swap');
    };
    show(0);
    $('#steps').addEventListener('click', (e) => { const b = e.target.closest('.step'); if (b) show(+b.dataset.i); });
    $('#steps').addEventListener('animationend', (e) => { if (e.animationName === 'stepfill') show(i + 1); });
    if (!reduce) new IntersectionObserver(([e]) => box.classList.toggle('is-live', e.isIntersecting), { threshold: .35 }).observe(box);
  }

  /* ============================================================== projects */
  /* The list comes from the dashboard (GET /api/projects). If that is unavailable,
     or nothing has been saved there yet, the starter projects in content.js are used. */
  let PROJECTS = [];
  const slugify = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const safeUrl = (u) => (/^(https?:\/\/|mailto:)/i.test(u || '') ? u : '');
  const safeImg = (u) => (/^(https?:\/\/|\/?assets\/|\/_store\/)/i.test(u || '') ? u : '');

  function normalizeProjects(list) {
    const used = new Set();
    return (Array.isArray(list) ? list : []).filter((x) => x && x.title).map((x) => {
      const base = slugify(x.id || x.title) || 'project';
      let id = base, n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      return {
        id, title: String(x.title), category: x.category || '', year: String(x.year || ''), role: x.role || '',
        text: x.text || '', body: x.body || '', tags: Array.isArray(x.tags) ? x.tags : [],
        image: safeImg(x.image), gallery: (Array.isArray(x.gallery) ? x.gallery : []).map(safeImg).filter(Boolean),
        links: (Array.isArray(x.links) ? x.links : []).filter((l) => l && l.label && safeUrl(l.url))
      };
    });
  }

  function loadProjects() {
    const builtin = normalizeProjects((C.work || {}).projects);
    if (location.protocol === 'file:' || !window.fetch || window.PF_STATIC) return Promise.resolve(builtin);   // no server to ask
    const ctl = window.AbortController ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 3500);
    // right after a save in the dashboard, this browser skips the 5-minute cache so the owner sees the change at once
    let stamp = '';
    try {
      const last = JSON.parse(localStorage.getItem('pf-admin-last') || 'null');
      if (last && Date.now() - last.updatedAt < 15 * 60 * 1000) stamp = `?t=${last.updatedAt}`;
    } catch (e) { /* no storage: use the cached list */ }
    return fetch('/api/projects' + stamp, { signal: ctl ? ctl.signal : undefined, headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && Array.isArray(d.projects) ? normalizeProjects(d.projects) : builtin))
      .catch(() => builtin)
      .finally(() => clearTimeout(timer));
  }

  function renderWork() {
    const W = C.work || {}, P = PROJECTS, by = W.filterBy || 'year';
    let filters = W.filters;
    if (!Array.isArray(filters)) {
      filters = Array.from(new Set(P.map((x) => x[by]).filter(Boolean)));
      if (by === 'year') filters.sort((x, y) => y.localeCompare(x, undefined, { numeric: true }));
    }
    const fbox = $('#filters');
    $$('.pill', fbox).forEach((x) => x.remove());
    fbox.hidden = filters.length < 2;
    fbox.insertAdjacentHTML('beforeend', ['All'].concat(filters).map((f, i) =>
      `<button class="pill" type="button" data-filter="${i ? esc(f) : ''}" aria-pressed="${!i}">${esc(f)}</button>`).join(''));

    const acc = $('#acc');
    acc.style.setProperty('--n', Math.max(1, P.length));
    acc.classList.toggle('is-empty', !P.length);
    acc.innerHTML = P.length ? P.map((x, i) => `
      <article class="acc__item${i === 0 ? ' is-active' : ''}" data-cat="${esc(x[by])}" tabindex="0" aria-label="${esc(x.title)}">
        ${x.image ? `<img class="acc__img" src="${esc(x.image)}" alt="" decoding="async">` : '<div class="acc__img acc__img--none"></div>'}
        <div class="acc__shade"></div>
        <div class="acc__spine" aria-hidden="true"><span class="acc__num">${pad(i + 1)}</span><span class="acc__vt">${esc(x.title)}</span></div>
        <div class="acc__body">
          <p class="acc__meta">${[`${pad(i + 1)} / ${pad(P.length)}`, x.category, x.year, x.role].filter(Boolean).map(esc).join(' · ')}</p>
          <h3 class="acc__title">${esc(x.title)}</h3>
          <p class="acc__desc">${esc(x.text)}</p>
          <ul class="chips">${x.tags.slice(0, 4).map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>
          <div class="acc__links">
            <a class="btn btn--accent btn--sm" href="#project-${esc(x.id)}"><span>Read details</span>${icon('ur')}</a>
            ${x.links.slice(0, 1).map((l) => link(safeUrl(l.url), 'btn btn--onimg btn--sm', `<span>${esc(l.label)}</span>`)).join('')}
          </div>
        </div>
      </article>`).join('') : '<p class="acc__empty">New projects are on their way.</p>';
    $('#workMore').innerHTML = link(W.moreUrl, 'lnk', `${esc(W.moreLabel || 'More work')} ${icon('ur')}`);
  }

  function initWork() {
    const acc = $('#acc'), filters = $('#filters'); if (!acc) return;
    const items = $$('.acc__item', acc);
    const wide = matchMedia('(min-width: 56.01rem)');
    const activate = (it) => { if (it) items.forEach((x) => x.classList.toggle('is-active', x === it)); };

    items.forEach((it) => {
      it.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && wide.matches) activate(it); });
      it.addEventListener('click', () => { if (wide.matches) activate(it); });
      it.addEventListener('focus', () => { if (wide.matches) activate(it); });
      it.addEventListener('keydown', (e) => {
        if (e.target !== it || !wide.matches) return;
        const vis = items.filter((x) => !x.hidden), k = vis.indexOf(it);
        const to = e.key === 'ArrowRight' ? vis[k + 1] : e.key === 'ArrowLeft' ? vis[k - 1] : null;
        if (to) { e.preventDefault(); to.focus(); }
      });
    });

    const track = pillTrack(filters);
    track.set($('.pill', filters));
    let busy;
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('.pill'); if (!b) return;
      const f = b.dataset.filter;
      track.set(b);
      $$('.pill', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      acc.classList.add('is-switching');
      clearTimeout(busy);
      busy = setTimeout(() => {
        const vis = items.filter((it) => { const ok = !f || it.dataset.cat === f; it.hidden = !ok; return ok; });
        acc.style.setProperty('--n', Math.max(1, vis.length));
        activate(vis[0]);
        acc.scrollLeft = 0;
        acc.classList.remove('is-switching');
      }, reduce ? 0 : 300);
    });
  }

  /* ======================================================= project details */
  /* A sheet that slides up over the page. Its address is #project-<id>, so a
     project can be linked to directly and the Back button closes it. */
  const sheet = $('#sheet');
  let sheetOpen = false, sheetPushed = false, sheetFocus = null;

  /* plain text -> paragraphs; lines starting with "- " become a bullet list */
  function rich(text) {
    const out = [];
    String(text || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/).forEach((block) => {
      let bullets = [], para = [];
      const flush = () => {
        if (bullets.length) out.push(`<ul class="ticks">${bullets.map((l) => `<li>${icon('spark')}<span>${esc(l)}</span></li>`).join('')}</ul>`);
        if (para.length) out.push(`<p>${para.map(esc).join('<br>')}</p>`);
        bullets = []; para = [];
      };
      block.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
        const m = /^[-•*]\s+(.*)$/.exec(l);
        if (m) { if (para.length) flush(); bullets.push(m[1]); }
        else { if (bullets.length) flush(); para.push(l); }
      });
      flush();
    });
    return out.join('');
  }

  function fillSheet(x) {
    const i = PROJECTS.indexOf(x), n = PROJECTS.length;
    const prev = PROJECTS[(i - 1 + n) % n], next = PROJECTS[(i + 1) % n];
    $('#sheetCount').textContent = `Project ${pad(i + 1)} / ${pad(n)}`;
    $('#sheetBody').innerHTML = `
      <header class="sheet__head">
        <p class="label">${icon('spark')}<span>${[x.category, x.year, x.role].filter(Boolean).map(esc).join(' · ')}</span></p>
        <h2 class="sheet__title" id="sheetTitle">${esc(x.title)}</h2>
        ${x.text ? `<p class="sheet__lead">${esc(x.text)}</p>` : ''}
        ${x.tags.length ? `<ul class="chips">${x.tags.map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>` : ''}
        ${x.links.length ? `<div class="sheet__links">${x.links.map((l, k) => link(safeUrl(l.url), `btn btn--${k ? 'ghost' : 'accent'}`, `<span>${esc(l.label)}</span>${icon('ur')}`)).join('')}</div>` : ''}
      </header>
      ${x.image ? `<figure class="sheet__cover"><img src="${esc(x.image)}" alt="${esc(x.title)}"></figure>` : ''}
      ${x.body ? `<section class="sheet__text"><h3 class="minilabel">What I did</h3>${rich(x.body)}</section>` : ''}
      ${x.gallery.length ? `<div class="sheet__gallery">${x.gallery.map((u, k) => `<figure><img src="${esc(u)}" alt="${esc(x.title)}, screen ${k + 1}" loading="lazy"></figure>`).join('')}</div>` : ''}
      ${n > 1 ? `<nav class="sheet__nav" aria-label="More projects">
        <a class="sheet__go" href="#project-${esc(prev.id)}" data-go="${esc(prev.id)}"><small>Previous</small><b>${esc(prev.title)}</b></a>
        <a class="sheet__go" href="#project-${esc(next.id)}" data-go="${esc(next.id)}"><small>Next</small><b>${esc(next.title)}</b></a>
      </nav>` : ''}`;
    $('#sheetPanel').scrollTop = 0;
  }

  function showSheet(x) {
    fillSheet(x);
    if (sheetOpen) return;
    sheetOpen = true;
    sheetFocus = document.activeElement;
    sheet.inert = false;
    sheet.classList.add('is-open');
    $$('#hdr, #main, .ftr, #accent').forEach((el) => { el.inert = true; });
    if (lenis) lenis.stop(); else root.style.overflow = 'hidden';
    $('#sheetClose').focus({ preventScroll: true });
  }

  function hideSheet() {
    if (!sheetOpen) return;
    sheetOpen = false; sheetPushed = false;
    sheet.classList.remove('is-open');
    sheet.inert = true;
    $$('#hdr, #main, .ftr, #accent').forEach((el) => { el.inert = false; });
    if (lenis) lenis.start(); else root.style.overflow = '';
    if (sheetFocus && sheetFocus.focus) sheetFocus.focus({ preventScroll: true });
  }

  /* make the sheet match the address bar */
  function syncSheet(viaNavigation) {
    const m = /^#project-(.+)$/.exec(location.hash);
    let id = m ? m[1] : '';
    try { id = decodeURIComponent(id); } catch (e) { /* keep as is */ }
    const x = id && PROJECTS.find((q) => q.id === id);
    if (x) { if (!sheetOpen) sheetPushed = !!viaNavigation; showSheet(x); }
    else hideSheet();
  }

  function dismissSheet() {
    if (!sheetOpen) return;
    const force = () => {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* sandboxed frame */ }
      hideSheet();
    };
    if (sheetPushed) { history.back(); setTimeout(() => { if (sheetOpen) force(); }, 300); }
    else force();
  }

  function initSheet() {
    if (!sheet) return;
    addEventListener('hashchange', () => syncSheet(true));
    sheet.addEventListener('click', (e) => {
      if (e.target.closest('[data-sheet-close]')) { dismissSheet(); return; }
      const go = e.target.closest('[data-go]');
      if (go) { e.preventDefault(); location.replace(`#project-${go.dataset.go}`); }   // swap, so Back still closes
    });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#project-"]');
      if (a && !a.dataset.go && a.getAttribute('href') === location.hash) { e.preventDefault(); syncSheet(false); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismissSheet(); });
  }

  /* ============================================================ experience */
  function initExperience() {
    const list = $('#xpList'); if (!list) return;
    const rows = $$('.xp__row', list);
    const set = (row, open) => {
      row.classList.toggle('is-open', open);
      $('.xp__head', row).setAttribute('aria-expanded', String(open));
      $('.xp__tl', row).textContent = open ? 'Hide' : 'Show';
    };
    list.addEventListener('click', (e) => {
      const head = e.target.closest('.xp__head'); if (!head) return;
      const row = head.parentElement, open = !row.classList.contains('is-open');
      rows.forEach((r) => set(r, r === row ? open : false));
      setTimeout(refresh, 760);              // heights changed: let the scroll triggers re-measure
    });
  }

  /* =============================================================== contact */
  function initContact() {
    const M = C.meta || {};

    // copy the email address
    const copy = $('#copyBtn');
    if (copy) copy.addEventListener('click', () => {
      const done = () => { copy.classList.add('is-done'); $('span', copy).textContent = 'Copied'; $('use', copy).setAttribute('href', '#i-check'); setTimeout(() => { copy.classList.remove('is-done'); $('span', copy).textContent = 'Copy'; $('use', copy).setAttribute('href', '#i-copy'); }, 1800); };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($('#mailA')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $('span', copy).textContent = 'Selected'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(M.email || '').then(done).catch(fallback);
      else fallback();
    });

    const form = $('#contactForm'); if (!form) return;
    const status = $('#formStatus'), btn = $('#formBtn');
    const say = (msg, kind) => { status.textContent = msg; status.className = `form__status${kind ? ` is-${kind}` : ''}`; };
    $$('.field :is(input, textarea)', form).forEach((f) => f.addEventListener('input', () => f.parentElement.classList.remove('is-bad')));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#cf-name'), email = $('#cf-email'), msg = $('#cf-message');
      const bad = [name, email, msg].filter((f) => {
        const ok = f.value.trim() && (f !== email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.parentElement.classList.toggle('is-bad', !ok);
        return !ok;
      });
      if (bad.length) { say('Add your name, a valid email and a short message, then send again.', 'err'); bad[0].focus(); return; }

      const picks = $$('input[name="interest"]:checked', form).map((c) => c.value);
      if (M.formEndpoint) {
        btn.disabled = true; say('Sending…');
        try {
          const data = new FormData(form);
          if (M.formKey) data.append('access_key', M.formKey);          // Web3Forms expects its key in the body
          const res = await fetch(M.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
          if (!res.ok) throw new Error(String(res.status));
          say(`Thanks, ${name.value.trim()}. Your message is on its way.`, 'ok');
          form.reset();
        } catch (err) {
          say(`That did not send. Please email ${M.email} instead.`, 'err');
        } finally { btn.disabled = false; }
      } else {
        // no form service connected: hand the message to the visitor's own email app
        const body = `${msg.value.trim()}\n\n${picks.length ? `Interested in: ${picks.join(', ')}\n` : ''}From: ${name.value.trim()} <${email.value.trim()}>`;
        location.href = `mailto:${M.email || ''}?subject=${encodeURIComponent(`Project enquiry from ${name.value.trim()}`)}&body=${encodeURIComponent(body)}`;
        say(`Your email app should open with the message ready. If it does not, write to ${M.email}.`);
      }
    });
  }

  /* ================================================================ footer */
  function initFooter() {
    const box = $('#ftrWord'), w = $('.ftr__w', box); if (!w) return;
    const fit = () => {
      box.style.fontSize = '100px';
      const ww = w.getBoundingClientRect().width;
      if (ww) box.style.fontSize = `${(100 * box.clientWidth / ww) * .985}px`;
    };
    fit();
    addEventListener('resize', debounce(fit, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* ================================================== cursor + magnetism */
  function initPointer() {
    if (!fine || reduce || !hasGsap) return;

    const cur = $('#cur'), lab = $('span', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: .4, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: .4, ease: 'power3' });
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; cx(e.clientX); cy(e.clientY); cur.classList.add('is-on'); }, { passive: true });
    root.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target; if (!t || !t.closest) return;
      const l = t.closest('[data-cursor]');
      const typing = t.closest('input, textarea');
      const hot = !l && !typing && t.closest('a, button, label, .tile, .svc, .acc__item:not(.is-active)');
      cur.classList.toggle('is-label', !!l);
      cur.classList.toggle('is-link', !!hot);
      cur.classList.toggle('is-hide', !!typing);
      lab.textContent = l ? l.dataset.cursor : '';
    });

    $$('[data-magnetic]').forEach((el) => {
      const s = parseFloat(el.dataset.magnetic) || .3;
      const x = gsap.quickTo(el, 'x', { duration: .7, ease: 'elastic.out(1, .45)' });
      const y = gsap.quickTo(el, 'y', { duration: .7, ease: 'elastic.out(1, .45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * s);
        y((e.clientY - (r.top + r.height / 2)) * s);
      });
      el.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }

  /* ============================================ background: sparkle field */
  function initField() {
    const cv = $('#sky'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, ps = [], t = 0, last = 0, mx = -9999, my = -9999;
    let fg = '244,242,236', hot = '255,224,27';
    const colours = () => { fg = mode === 'light' ? '20,20,18' : '244,242,236'; hot = toRgb(accent().hex).join(','); };

    const seed = () => {
      const n = Math.round(Math.min(110, (W * H) / 15000) * (W < 700 ? .5 : 1));
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * (H + 40), z: .25 + Math.random() * .75,
        r: .5 + Math.random() * 1.1, star: Math.random() < .22, hot: Math.random() < .14,
        ph: Math.random() * 6.283, vx: 0, vy: 0
      }));
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    const star = (x, y, s) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.quadraticCurveTo(x, y, x + s, y);
      ctx.quadraticCurveTo(x, y, x, y + s);
      ctx.quadraticCurveTo(x, y, x - s, y);
      ctx.quadraticCurveTo(x, y, x, y - s);
      ctx.fill();
    };
    const draw = (dt) => {
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY, span = H + 40;
      for (const p of ps) {
        // a slow flow field keeps everything drifting
        const a = (Math.sin(p.x * .0019 + t * .004) + Math.cos(p.y * .0023 - t * .0035)) * Math.PI;
        p.vx += Math.cos(a) * .011 * p.z * dt; p.vy += Math.sin(a) * .011 * p.z * dt;
        // nearer sparks slide faster against the scroll
        const py = ((((p.y - sy * p.z * .16) % span) + span) % span) - 20;
        const dx = p.x - mx, dy = py - my, d = Math.hypot(dx, dy);
        let near = 0;
        if (d < 150 && d > 0) { near = 1 - d / 150; const f = near * near * 1.6 * dt; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= .95; p.vy *= .95;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        const alpha = (p.star ? .5 : .3) * p.z * (.55 + .45 * Math.sin(t * .03 + p.ph)) + near * .35;
        ctx.fillStyle = `rgba(${p.hot ? hot : fg},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
        if (p.star) star(p.x, py, p.r * 3.4 * (p.z + .45));
        else { ctx.beginPath(); ctx.arc(p.x, py, p.r * (p.z + .3), 0, 6.283); ctx.fill(); }
      }
    };
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(48, now - (last || now)) / 16.67 || 1; last = now; t += dt;
      draw(dt);
    };

    colours(); size();
    document.addEventListener('pf:theme', () => { colours(); if (reduce) draw(0); });
    addEventListener('resize', debounce(() => { size(); if (reduce) draw(0); }, 150));
    if (reduce) { draw(0); return; }
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } }, { passive: true });
    root.addEventListener('pointerleave', () => { mx = my = -9999; });
    requestAnimationFrame(frame);
  }

  /* ================================================== contact: dotted globe */
  function initGlobe() {
    const cv = $('#globe'); if (!cv) return;
    const ctx = cv.getContext('2d');
    const N = innerWidth < 700 ? 420 : 780;
    const pts = [];
    for (let i = 0; i < N; i++) {                      // evenly spread points on a sphere
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    const pin = [Math.cos(.52) * Math.cos(.6), Math.sin(.52), Math.cos(.52) * Math.sin(.6)];
    const tilt = -.36, ct = Math.cos(tilt), stl = Math.sin(tilt);
    let S = 0, rot = 0, seen = false, t = 0, hot = '255,224,27';
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      S = cv.clientWidth;
      cv.width = cv.height = Math.round(S * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const project = ([x0, y0, z0], cr, sr) => {
      const x = x0 * cr + z0 * sr, z1 = -x0 * sr + z0 * cr;
      return [x, y0 * ct - z1 * stl, y0 * stl + z1 * ct];
    };
    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      const R = S * .4, c = S / 2, cr = Math.cos(rot), sr = Math.sin(rot);
      ctx.strokeStyle = 'rgba(244,242,236,.09)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(c, c, R * 1.2, R * .36, -.36, 0, 6.283); ctx.stroke();
      for (const p of pts) {
        const [x, y, z] = project(p, cr, sr), k = (z + 1) / 2;
        ctx.fillStyle = `rgba(244,242,236,${(.05 + k * k * .5).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(c + x * R, c + y * R, .5 + k * 1.5, 0, 6.283); ctx.fill();
      }
      const [px, py, pz] = project(pin, cr, sr);
      if (pz > -.1) {
        const pulse = (t % 90) / 90;
        ctx.fillStyle = `rgba(${hot},1)`; ctx.beginPath(); ctx.arc(c + px * R, c + py * R, 4.5, 0, 6.283); ctx.fill();
        ctx.strokeStyle = `rgba(${hot},${(1 - pulse).toFixed(3)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(c + px * R, c + py * R, 5 + pulse * 22, 0, 6.283); ctx.stroke();
      }
    };
    const frame = () => {
      requestAnimationFrame(frame);
      if (!seen || document.hidden) return;
      t++; rot += .0022;
      draw();
    };
    const theme = () => { hot = toRgb(accent().hex).join(','); if (reduce) draw(); };
    size(); theme(); draw();
    document.addEventListener('pf:theme', theme);
    addEventListener('resize', debounce(() => { size(); draw(); }, 150));
    if (reduce) return;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(cv);
    requestAnimationFrame(frame);
  }

  /* ================================================================== boot */
  render();
  initTheme();
  initScroll();
  initHeader();
  initHello();
  initReveal();
  initHero();
  initScrollMotion();
  initRibbons();
  initAbout();
  initStack();
  initServices();
  initSheet();
  loadProjects().then((list) => {
    PROJECTS = list;
    renderWork();
    initWork();
    syncSheet(false);        // opens the right project when the page was loaded from a #project-… link
    refresh();
  });
  initExperience();
  initContact();
  initFooter();
  initPointer();
  initField();
  initGlobe();

  addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
