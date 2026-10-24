// Mobiilimenüü
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// ---------- Piltide suurendus (üks pilt või galerii) ----------
const lb = document.getElementById('lb');
const canDialog = lb && typeof lb.showModal === 'function';
let lbItems = [], lbIndex = 0;

function lbShow(i) {
  lbIndex = (i + lbItems.length) % lbItems.length;
  const it = lbItems[lbIndex];
  const img = lb.querySelector('img');
  img.src = it.src;
  img.alt = it.alt || '';
  lb.querySelector('.stage').classList.toggle('cut', !!it.cut);
  lb.querySelector('.cap').textContent = it.cap || '';
  lb.querySelector('.ctr').textContent = (lbIndex + 1) + ' / ' + lbItems.length;
  // järgmine ja eelmine ette laadida
  [lbIndex + 1, lbIndex - 1].forEach(j => {
    const n = lbItems[(j + lbItems.length) % lbItems.length];
    if (n) { const p = new Image(); p.src = n.src; }
  });
}

function openLightbox(items, i) {
  if (!canDialog) { window.open(items[i].src, '_blank', 'noopener'); return; }
  lbItems = items;
  lb.classList.toggle('single', items.length < 2);
  lbShow(i || 0);
  if (!lb.open) lb.showModal();
}

if (canDialog) {
  lb.querySelector('.close').addEventListener('click', () => lb.close());
  lb.querySelector('.prev').addEventListener('click', () => lbShow(lbIndex - 1));
  lb.querySelector('.next').addEventListener('click', () => lbShow(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (lbItems.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(lbIndex - 1); }
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null || lbItems.length < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  lb.addEventListener('close', () => { lb.querySelector('img').src = ''; });
}

// Laborite ekraanipildid
document.querySelectorAll('.shot button[data-full]').forEach(btn => {
  btn.addEventListener('click', () => {
    const small = btn.querySelector('img');
    const fc = btn.closest('figure').querySelector('figcaption');
    openLightbox([{ src: btn.dataset.full, alt: small ? small.alt : '', cap: fc ? fc.textContent : '' }], 0);
  });
});

// ---------- Fotod kaustadest (nimekirja teeb GitHubi Action: img/pildid.json) ----------
function el(tag, attrs) {
  const e = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'text') e.textContent = v; else e.setAttribute(k, v); });
  return e;
}

function toItems(list, name) {
  return list.map((p, i) => ({
    src: p.src,
    thumb: p.thumb,
    cut: !!p.alpha,
    cap: p.cap || (name + ', pilt ' + (i + 1)),
    alt: p.cap ? name + ': ' + p.cap : name + ', pilt ' + (i + 1),
  }));
}

// Kaanepilt (hero) ja profiilifoto (Minust): esimene pilt kaustast
function renderSingle(fig, list) {
  if (!fig || !list || !list.length) return;
  const name = fig.dataset.alt || 'Roger-Romeo Arm';
  const items = toItems(list, name);
  const img = el('img', { src: list[0].thumb, alt: items[0].alt, width: list[0].w, height: list[0].h });
  img.addEventListener('load', () => fig.classList.add('has-img'));
  img.addEventListener('error', () => img.remove());
  fig.hidden = false;
  fig.prepend(img);
  fig.style.cursor = 'zoom-in';
  fig.addEventListener('click', () => openLightbox(items, 0));
}

// Ehituse kaart: suur pilt + eelvaated
function renderGallery(box, list) {
  if (!list || !list.length) return;
  const name = box.dataset.alt || 'Arvutiehitus';
  const items = toItems(list, name);

  box.classList.toggle('cut', items[0].cut);
  const cover = el('button', { type: 'button', class: 'cover', 'aria-label': name + ': ava pildid (' + list.length + ')' });
  const cimg = el('img', { src: list[0].thumb, alt: items[0].alt, loading: 'lazy', decoding: 'async' });
  cimg.addEventListener('load', () => box.classList.add('has-img'));
  cover.append(cimg);
  cover.addEventListener('click', () => openLightbox(items, 0));
  box.append(cover);

  if (list.length > 1) {
    box.append(el('span', { class: 'count', text: list.length + ' pilti' }));
    const MAX = 6;
    const strip = el('div', { class: 'thumbs' });
    const shown = Math.min(MAX, list.length);
    for (let i = 0; i < shown; i++) {
      const b = el('button', { type: 'button', 'aria-label': items[i].alt });
      if (items[i].cut) b.classList.add('cut');
      b.append(el('img', { src: list[i].thumb, alt: '', loading: 'lazy', decoding: 'async' }));
      if (i === MAX - 1 && list.length > MAX) b.append(el('span', { class: 'more', text: '+' + (list.length - MAX + 1) }));
      b.addEventListener('click', () => openLightbox(items, i));
      strip.append(b);
    }
    box.after(strip);
  }
}

// Galerii ruudustik: iga pilt eraldi ruuduna koos allkirjaga
function renderGrid(box, list) {
  if (!list || !list.length) return;
  const name = box.dataset.alt || 'Arvutiehitus';
  const items = toItems(list, name);
  items.forEach((it, i) => {
    const t = el('button', { type: 'button', class: 'gtile' + (it.cut ? ' cut' : ''), 'aria-label': it.alt });
    const fig = el('span', { class: 'gimg' });
    fig.append(el('img', { src: it.thumb, alt: '', loading: 'lazy', decoding: 'async' }));
    const cap = el('span', { class: 'gcap' });
    cap.append(el('b', { text: String(i + 1).padStart(2, '0') }), document.createTextNode(list[i].cap || name));
    t.append(fig, cap);
    t.addEventListener('click', () => openLightbox(items, i));
    box.append(t);
  });
}

fetch('img/pildid.json', { cache: 'no-cache' })
  .then(r => (r.ok ? r.json() : {}))
  .catch(() => ({}))
  .then(m => {
    renderSingle(document.querySelector('.photo[data-folder]'), m[document.querySelector('.photo[data-folder]')?.dataset.folder]);
    renderSingle(document.querySelector('.portrait[data-folder]'), m['profiil']);
    document.querySelectorAll('.gallery[data-folder]').forEach(box => renderGallery(box, m['ehitused/' + box.dataset.folder]));
    // Galerii võib koguda pilte mitmest kaustast: data-folder="kaust1 kaust2"
    document.querySelectorAll('.grid-gallery[data-folder]').forEach(box => renderGrid(box, box.dataset.folder.split(/\s+/).flatMap(f => m['ehitused/' + f] || [])));
  });
