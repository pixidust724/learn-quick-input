// 速成 (Quick) = first + last key of the full Cangjie (3rd generation) code.
const RADICALS = {
  a: '日', b: '月', c: '金', d: '木', e: '水', f: '火', g: '土', h: '竹', i: '戈',
  j: '十', k: '大', l: '中', m: '一', n: '弓', o: '人', p: '心', q: '手', r: '口',
  s: '尸', t: '廿', u: '山', v: '女', w: '田', x: '難', y: '卜', z: '重',
};
const quickOf = (code) => (code.length <= 1 ? code : code[0] + code[code.length - 1]);
const toRadicals = (code) => [...code].map((l) => RADICALS[l]).join('');

function lookup(ch) {
  const s = CJ[ch];
  if (!s) return null;
  const [full, ...alts] = s.split(' ');
  return { full, quick: quickOf(full), alts };
}

const $ = (id) => document.getElementById(id);
const q = $('q');
const result = $('result');
const layer = $('layer');
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- Toolbar ----------

const store = {
  get(k, d) { try { const v = localStorage.getItem('quick:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('quick:' + k, JSON.stringify(v)); } catch {} },
};
// Light / dark toggle: follows the system until the person picks one
const themeBtn = document.createElement('button');
themeBtn.className = 'theme';
const root = document.documentElement;
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
const renderTheme = () => {
  themeBtn.textContent = isDark() ? '☀︎' : '☾';
  themeBtn.title = isDark() ? 'Switch to light mode' : 'Switch to dark mode';
};
const savedTheme = store.get('theme', null);
if (savedTheme) root.dataset.theme = savedTheme;
themeBtn.onclick = () => { root.dataset.theme = isDark() ? 'light' : 'dark'; store.set('theme', root.dataset.theme); renderTheme(); };
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderTheme);
renderTheme();

const tools = document.createElement('div');
tools.className = 'tools';
const gh = document.createElement('a');
gh.className = 'gh';
gh.href = 'https://github.com/pixidust724';
gh.target = '_blank';
gh.rel = 'noopener';
gh.title = 'pixidust724 on GitHub';
gh.setAttribute('aria-label', 'GitHub');
gh.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
tools.append(themeBtn, gh);
document.body.appendChild(tools);

// ---------- Physics pile ----------

const { Engine, Runner, Bodies, Body, Composite, Constraint, Events } = Matter;
const engine = Engine.create({ gravity: { y: 1.2 } });
const world = engine.world;
const G = Math.round(Math.max(32, Math.min(48, innerWidth * 0.034)));
document.documentElement.style.setProperty('--g', G + 'px');
const SLOT = Math.round(G * 0.72); // radicals shrink to this size when they land in a card
const K = SLOT / G;
document.documentElement.style.setProperty('--slot', SLOT + 'px');

const glyphs = new Set();
let walls = [];
const CAP = innerWidth < 700 ? 40 : 80;

function buildWalls() {
  Composite.remove(world, walls);
  const w = innerWidth, h = innerHeight, t = 400, top = -3000;
  const opts = { isStatic: true, friction: 0.8 };
  walls = [
    Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts),
    Bodies.rectangle(-t / 2, (top + h) / 2, t, h - top + t, opts),
    Bodies.rectangle(w + t / 2, (top + h) / 2, t, h - top + t, opts),
  ];
  Composite.add(world, walls);
}

function makeGlyph(letter, x, y, addToWorld = true) {
  const el = document.createElement('div');
  el.className = 'glyph';
  el.textContent = RADICALS[letter];
  el.dataset.key = letter.toUpperCase();
  layer.appendChild(el);
  const s = G * 0.86;
  const body = Bodies.rectangle(x, y, s, s, {
    chamfer: { radius: G * 0.14 }, friction: 0.6, frictionStatic: 1, restitution: 0.15, density: 0.002,
  });
  Body.setAngle(body, rand(-0.6, 0.6));
  const g = { el, body, letter, picked: false, dragging: false, born: performance.now() };
  glyphs.add(g);
  if (addToWorld) Composite.add(world, body);
  place(g, x, y, body.angle);
  enableDrag(g);
  return g;
}

const place = (g, x, y, a) => (g.el.style.transform = `translate(${x - G / 2}px, ${y - G / 2}px) rotate(${a}rad)`);

Events.on(engine, 'afterUpdate', () => {
  for (const g of glyphs) {
    if (g.picked) continue;
    const { position: p, angle } = g.body;
    if (p.y > innerHeight + 300) { Body.setPosition(g.body, { x: innerWidth / 2, y: -G }); Body.setVelocity(g.body, { x: 0, y: 0 }); }
    place(g, p.x, p.y, angle);
  }
});

function enableDrag(g) {
  g.el.addEventListener('pointerdown', (e) => {
    if (g.picked) return;
    e.preventDefault();
    g.el.setPointerCapture(e.pointerId);
    const start = { x: e.clientX, y: e.clientY };
    const c = Constraint.create({
      pointA: { ...start }, bodyB: g.body,
      pointB: { x: start.x - g.body.position.x, y: start.y - g.body.position.y },
      stiffness: 0.15, damping: 0.1, length: 0,
    });
    Composite.add(world, c);
    g.dragging = true;
    g.el.classList.add('dragging');
    const move = (ev) => { c.pointA = { x: ev.clientX, y: ev.clientY }; };
    const up = () => {
      Composite.remove(world, c);
      g.dragging = false;
      g.el.classList.remove('dragging');
      g.el.removeEventListener('pointermove', move);
    };
    g.el.addEventListener('pointermove', move);
    g.el.addEventListener('pointerup', up, { once: true });
    g.el.addEventListener('pointercancel', up, { once: true });
  });
}

// Lift a radical out of the pile (or conjure one from below) and fly it to its slot.
// On landing, the flying piece hides and the slot shows the radical as plain text,
// so landed radicals scroll and clip with the results like normal content.
function pick(letter, slot, target, delay) {
  const pool = [...glyphs].filter((g) => !g.picked && !g.dragging && g.letter === letter);
  let g = pool.sort((a, b) => a.body.position.y - b.body.position.y)[0];
  if (g) Composite.remove(world, g.body);
  else g = makeGlyph(letter, rand(G, innerWidth - G), innerHeight + G, false);
  g.picked = true;
  g.slot = slot;
  g.el.classList.add('picked');
  const anim = flyTo(g, target, delay, 750);
  anim.onfinish = () => {
    if (g.slot !== slot) return; // released mid-flight
    g.el.style.visibility = 'hidden';
    slot.textContent = RADICALS[letter];
  };
  return g;
}

function flyTo(g, t, delay = 0, duration = 350) {
  const { x, y } = g.body.position;
  const a = g.body.angle;
  const lift = Math.min(y, t.y) - 90;
  const to = `translate(${t.x - G / 2}px, ${t.y - G / 2}px) rotate(0rad) scale(${K})`;
  g.el.getAnimations().forEach((an) => an.cancel());
  const anim = g.el.animate([
    { transform: `translate(${x - G / 2}px, ${y - G / 2}px) rotate(${a}rad) scale(1)` },
    { transform: `translate(${(x + t.x) / 2 - G / 2}px, ${lift - G / 2}px) rotate(${a * 0.3 + rand(-0.5, 0.5)}rad) scale(${(1 + K) / 2})`, offset: 0.45 },
    { transform: to },
  ], { duration, delay, easing: 'cubic-bezier(.3,.6,.25,1)', fill: 'backwards' });
  g.el.style.transform = to;
  g.home = t;
  return anim;
}

// Drop a radical back onto the pile from where its slot was last seen.
function release(g, from) {
  g.el.getAnimations().forEach((an) => an.cancel());
  g.picked = false;
  g.slot = null;
  g.el.classList.remove('picked');
  g.el.style.visibility = '';
  Body.setPosition(g.body, from || g.home);
  Body.setAngle(g.body, 0);
  Body.setVelocity(g.body, { x: rand(-3, 3), y: rand(-5, -1) });
  Body.setAngularVelocity(g.body, rand(-0.12, 0.12));
  g.home = null;
  Composite.add(world, g.body);
  trimPile();
}

function trimPile() {
  const free = [...glyphs].filter((g) => !g.picked && !g.dragging).sort((a, b) => a.born - b.born);
  while (free.length > CAP) {
    const g = free.shift();
    glyphs.delete(g);
    Composite.remove(world, g.body);
    g.el.classList.add('gone');
    setTimeout(() => g.el.remove(), 450);
  }
}

// ---------- Lookup UI ----------

let slots = new Map(); // key -> glyph sitting in that slot
let groups = new Map(); // key -> group element, reused so only new characters animate in
const hint = document.createElement('p');
hint.className = 'hint';
hint.innerHTML = '輸入任何中文字，睇速成碼<br>Type any Chinese word to see its Quick (速成) code';

function makeGroup(ch, info) {
  const grp = document.createElement('div');
  grp.className = 'group enter';
  grp.addEventListener('animationend', () => grp.classList.remove('enter'), { once: true });
  const row = document.createElement('div');
  row.className = 'slots';
  const cap = document.createElement('div');
  cap.className = 'cap';
  if (info) {
    grp.slotEls = [...info.quick].map((l) => {
      const s = document.createElement('span');
      s.className = 'slot';
      s.dataset.letter = l;
      row.appendChild(s);
      return s;
    });
    const keys = [...info.quick.toUpperCase()].map((l) => `<kbd>${l}</kbd>`).join('');
    cap.innerHTML = `<span class="ch">${ch}</span><span class="keys">${keys}</span><span class="full">倉頡 ${toRadicals(info.full)}</span>`;
    const alts = info.alts.length
      ? ` · 亦可 ${info.alts.map((a) => `${toRadicals(quickOf(a))} ${quickOf(a).toUpperCase()}`).join(' / ')}`
      : '';
    grp.title = `${ch} — 速成 ${toRadicals(info.quick)} (${info.quick.toUpperCase()}) · 倉頡 ${toRadicals(info.full)} (${info.full.toUpperCase()})${alts}`;
  } else {
    grp.slotEls = [];
    grp.classList.add('miss');
    cap.innerHTML = `<span class="ch">${ch}</span><span class="full">搵唔到</span>`;
  }
  grp.append(row, cap);
  return grp;
}

// Position of el inside ancestor, ignoring transforms. Chrome makes a transformed
// (animating) element the offsetParent, so sum offsets up the whole chain.
function offsetWithin(el, ancestor) {
  let x = 0, y = 0;
  while (el && el !== ancestor) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
  return { x, y };
}

// Screen centre of a slot, clamped to the visible part of the scrolling results
function slotCenter(el) {
  const r = el.getBoundingClientRect();
  const box = result.getBoundingClientRect();
  return {
    x: r.left + r.width / 2,
    y: Math.min(Math.max(r.top + r.height / 2, box.top), box.bottom),
  };
}

// Keep the results above the pile; they scroll inside when there's a lot
function fitResult() {
  const top = result.getBoundingClientRect().top;
  result.style.maxHeight = Math.max(SLOT * 2, innerHeight - top - G * 2.4) + 'px';
}

function render() {
  const chars = Array.from(q.value).filter((c) => c.trim()).slice(0, 60);

  // Remember where current radicals are before the DOM changes, for the ones that will drop
  const lastSeen = new Map();
  for (const [skey, g] of slots) if (g.slot?.isConnected) lastSeen.set(skey, slotCenter(g.slot));

  const nextGroups = new Map();
  const ordered = chars.map((ch, i) => {
    const key = `${i}${ch}`;
    const grp = groups.get(key) || makeGroup(ch, lookup(ch));
    nextGroups.set(key, grp);
    return grp;
  });
  const grew = [...nextGroups.keys()].some((k) => !groups.has(k));
  groups = nextGroups;
  result.replaceChildren(...(ordered.length ? ordered : [hint]));
  if (grew) result.scrollTop = result.scrollHeight; // follow the newest character

  // Measure with offsets (not getBoundingClientRect) so the slide-in transform doesn't skew targets
  const box = result.getBoundingClientRect();
  const next = new Map();
  let fresh = 0;
  for (const [key, grp] of groups) {
    grp.slotEls.forEach((el, j) => {
      const letter = el.dataset.letter;
      const skey = `${key}:${j}${letter}`;
      let g = slots.get(skey);
      if (g) {
        slots.delete(skey);
      } else {
        const o = offsetWithin(el, result);
        const t = {
          x: box.left + o.x + el.offsetWidth / 2,
          y: box.top + o.y - result.scrollTop + el.offsetHeight / 2,
        };
        g = pick(letter, el, t, fresh++ * 70);
      }
      next.set(skey, g);
    });
  }
  for (const [skey, g] of slots) release(g, lastSeen.get(skey));
  slots = next;
}

let composing = false;
function onChange() {
  if (composing) return;
  render();
}

q.addEventListener('compositionstart', () => { composing = true; });
q.addEventListener('compositionend', () => { composing = false; onChange(); });
q.addEventListener('input', (e) => { if (!e.isComposing) onChange(); });
q.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { q.value = ''; onChange(); }
});
window.addEventListener('resize', () => { buildWalls(); fitResult(); });

// ---------- Start ----------

buildWalls();
Runner.run(Runner.create(), engine);

const letters = Object.keys(RADICALS);
const seed = [...letters, ...(innerWidth < 700 ? [] : letters)].sort(() => Math.random() - 0.5);
const rain = () => seed.forEach((l, i) => setTimeout(() => makeGlyph(l, rand(G, innerWidth - G), rand(-G * 4, -G)), 150 + i * 55));
// Let the radicals fall in the page font rather than swapping font mid-air (but don't wait long)
Promise.race([
  document.fonts.load(`400 ${G}px 'LXGW WenKai TC'`, Object.values(RADICALS).join('')),
  new Promise((r) => setTimeout(r, 1500)),
]).catch(() => {}).then(rain);

fitResult();
render();
q.focus();
