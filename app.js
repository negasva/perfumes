/* AURVM. Pon aquí tu WhatsApp en formato internacional, sin el signo +. */
const WHATSAPP = '573000000000';

const SECTIONS = [
  { key: 'arabe', label: 'Perfumes árabes' },
  { key: 'disenador', label: 'Perfumes diseñador' },
  { key: 'nicho', label: 'Perfumes de nicho' }
];
const GENDERS = [
  { key: 'hombre', label: 'Hombre' },
  { key: 'mujer', label: 'Mujer' },
  { key: 'unisex', label: 'Unisex' }
];

/* Precios en pesos. Base: línea diseñador.
   Árabes x1.25 y nicho x1.4, siempre redondeando al mil de arriba. */
const BASE = { 30: 25000, 50: 35000, 100: 100000 };
const FACTOR = { disenador: 1, arabe: 1.25, nicho: 1.4 };
const SIZE_LABEL = { 30: 'Bolsillo', 50: 'Diario', 100: 'Colección' };

const priceOf = (section, ml) => Math.ceil((BASE[ml] * FACTOR[section]) / 1000) * 1000;
const money = (n) => '$' + n.toLocaleString('es-CO');

const state = { gender: 'all', section: 'all', q: '' };

const results = document.getElementById('results');
const countEl = document.getElementById('count');
const sheet = document.getElementById('sheet');
const input = document.getElementById('q');

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- estado en la direccion web, para compartir filtros ---- */

function readUrl() {
  const p = new URLSearchParams(location.search);
  if (['hombre', 'mujer', 'unisex'].includes(p.get('g'))) state.gender = p.get('g');
  if (['arabe', 'disenador', 'nicho'].includes(p.get('l'))) state.section = p.get('l');
  if (p.get('q')) { state.q = p.get('q'); input.value = state.q; }
  document.querySelectorAll('.chip').forEach((c) => {
    c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
  });
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.gender !== 'all') p.set('g', state.gender);
  if (state.section !== 'all') p.set('l', state.section);
  if (state.q) p.set('q', state.q);
  const qs = p.toString();
  history.replaceState(null, '', qs ? '?' + qs + location.hash : location.pathname + location.hash);
}

/* ---- filtrado ---- */

function matches(p) {
  if (state.gender !== 'all' && p.g !== state.gender) return false;
  if (state.section !== 'all' && p.s !== state.section) return false;
  if (state.q) {
    const hay = norm('aurum ' + p.n + ' ' + p.i);
    if (!norm(state.q).split(/\s+/).every((t) => hay.includes(t))) return false;
  }
  return true;
}

function cardHTML(p) {
  return '<button class="card reveal" data-num="' + esc(p.n) + '" data-section="' + esc(p.s) + '">' +
    '<span class="card__frame"><img src="' + esc(p.img) + '" alt="Aurum ' + esc(p.n) +
    '" loading="lazy" decoding="async" width="340" height="340"></span>' +
    '<span class="card__name">Aurum ' + esc(p.n) + '</span>' +
    '<span class="card__insp">Inspirado en ' + esc(p.i) + '</span>' +
    '<span class="card__price">Desde ' + money(priceOf(p.s, 30)) + '</span></button>';
}

function render() {
  const list = PRODUCTS.filter(matches);
  countEl.innerHTML = list.length
    ? '<b>' + list.length + '</b> ' + (list.length === 1 ? 'fragancia' : 'fragancias')
    : 'Sin resultados';

  if (!list.length) {
    results.innerHTML = '<div class="empty"><b>Nada por aquí</b>Prueba con otro número, o con el nombre del perfume que te gusta.</div>';
    writeUrl();
    return;
  }

  let html = '';
  SECTIONS.forEach((sec) => {
    const inSec = list.filter((p) => p.s === sec.key);
    if (!inSec.length) return;
    html += '<section><div class="section__head"><h2>' + sec.label + '</h2><span class="tally">' + inSec.length + '</span></div>';
    GENDERS.forEach((g) => {
      const inG = inSec.filter((p) => p.g === g.key);
      if (!inG.length) return;
      if (state.gender === 'all') html += '<h3 class="sub__head">' + g.label + '</h3>';
      html += '<div class="grid">' + inG.map(cardHTML).join('') + '</div>';
    });
    html += '</section>';
  });
  results.innerHTML = html;
  reveal();
  writeUrl();
}

/* ---- aparicion escalonada, sin escuchar el scroll ---- */

let io = null;
function reveal() {
  const cards = results.querySelectorAll('.card.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((c) => c.classList.remove('reveal'));
    return;
  }
  if (io) io.disconnect();
  io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = Math.min(i * 45, 270) + 'ms';
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '80px', threshold: 0.1 });
  cards.forEach((c) => io.observe(c));
}

/* ---- controles ---- */

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    state[chip.dataset.filter] = chip.dataset.value;
    document.querySelectorAll('.chip[data-filter="' + chip.dataset.filter + '"]').forEach((c) => {
      c.setAttribute('aria-pressed', String(c === chip));
    });
    render();
  });
});

document.querySelectorAll('[data-jump]').forEach((link) => {
  link.addEventListener('click', () => {
    const val = link.dataset.jump;
    state.section = val;
    document.querySelectorAll('.chip[data-filter="section"]').forEach((c) => {
      c.setAttribute('aria-pressed', String(c.dataset.value === val));
    });
    render();
  });
});

let t;
input.addEventListener('input', (e) => {
  clearTimeout(t);
  t = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 140);
});

/* ---- ficha ---- */

let lastFocus = null;

function openSheet(p) {
  lastFocus = document.activeElement;
  document.getElementById('sheetImg').src = p.img;
  document.getElementById('sheetImg').alt = 'Aurum ' + p.n;
  document.getElementById('sheetName').textContent = 'Aurum ' + p.n;
  document.getElementById('sheetInsp').textContent = 'Inspirado en ' + p.i;
  document.getElementById('sheetSizes').innerHTML = [30, 50, 100].map((ml) =>
    '<div class="size"><b>' + ml + ' ML</b><span>' + SIZE_LABEL[ml] + '</span>' +
    '<span class="price">' + money(priceOf(p.s, ml)) + '</span></div>').join('');
  document.getElementById('sheetTags').innerHTML =
    '<span class="tag">' + SECTIONS.find((s) => s.key === p.s).label + '</span>' +
    '<span class="tag">' + GENDERS.find((g) => g.key === p.g).label + '</span>';
  document.getElementById('sheetCta').href = 'https://wa.me/' + WHATSAPP + '?text=' +
    encodeURIComponent('Hola, me interesa Aurum ' + p.n + ' (inspirado en ' + p.i + '). ¿Disponibilidad?');
  sheet.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  document.getElementById('sheetClose').focus();
}

function closeSheet() {
  sheet.classList.remove('is-open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

results.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const p = PRODUCTS.find((x) => x.n === card.dataset.num && x.s === card.dataset.section);
  if (p) openSheet(p);
});

document.getElementById('sheetClose').addEventListener('click', closeSheet);
sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  if (e.key === 'Tab' && sheet.classList.contains('is-open')) {
    const f = sheet.querySelectorAll('button, a[href]');
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* tabla de precios por línea */
document.getElementById('pricing').innerHTML =
  '<div class="pricing__row"><b></b><span>30 ml</span><span>50 ml</span><span>100 ml</span></div>' +
  SECTIONS.map((sec) =>
    '<div class="pricing__row"><b>' + sec.label.replace('Perfumes ', '') + '</b>' +
    [30, 50, 100].map((ml) => '<span>' + money(priceOf(sec.key, ml)) + '</span>').join('') +
    '</div>').join('');

readUrl();
render();
