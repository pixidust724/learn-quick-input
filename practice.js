// ---------- Stroke practice ----------
// Click a looked-up character: a numbered stroke-order guide on the left, and a pad
// on the right where you write it with a mouse, trackpad or finger, stroke by stroke.
// Stroke data: Make Me a Hanzi via Hanzi Writer (loaded from jsDelivr).

const bi = (zh, en) => `<span class="zh" lang="zh-Hant">${zh}</span><span class="en" lang="en">${en}</span>`;
const SVG_NS = 'http://www.w3.org/2000/svg';
const PAD = 18; // inner margin of each board, in px

const practice = document.getElementById('practice');
const sheet = practice.querySelector('.sheet');
const guideEl = practice.querySelector('.guide');
const padEl = practice.querySelector('.pad');
const statusEl = practice.querySelector('.status');
const pchEl = practice.querySelector('.pch');
const pickerEl = practice.querySelector('.picker');
let writer = null;
let current = null; // { ch, data, size }
let token = 0; // ignores data that arrives after the person has moved on

// The data follows mainland stroke order. Hong Kong writes 忄 left dot, vertical, right dot
// (mainland: dot, dot, vertical), so when a character opens with 忄 move the vertical up.
function hongKongOrder(data) {
  const [a, b, c] = data.medians;
  if (!c || data.radStrokes?.slice(0, 3).join() !== '0,1,2') return data;
  const span = (m) => Math.hypot(m[m.length - 1][0] - m[0][0], m[m.length - 1][1] - m[0][1]);
  const tallVertical = c[0][1] - c[c.length - 1][1] > 500 && Math.abs(c[0][0] - c[c.length - 1][0]) < 150;
  const dotsEitherSide = span(a) < 300 && span(b) < 300 && a[0][0] < c[0][0] && c[0][0] < b[0][0];
  if (!tallVertical || !dotsEitherSide) return data;
  const order = [0, 2, 1, ...data.strokes.keys()].filter((v, i, all) => all.indexOf(v) === i);
  return {
    strokes: order.map((i) => data.strokes[i]),
    medians: order.map((i) => data.medians[i]),
    radStrokes: data.radStrokes.map((i) => order.indexOf(i)).sort((x, y) => x - y),
  };
}

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Dashed 米 grid behind each board, like a practice book
function grid(size) {
  const m = size / 2;
  return `<svg class="grid" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <line x1="0" y1="${m}" x2="${size}" y2="${m}"/><line x1="${m}" y1="0" x2="${m}" y2="${size}"/>
    <line x1="0" y1="0" x2="${size}" y2="${size}" class="diag"/><line x1="${size}" y1="0" x2="0" y2="${size}" class="diag"/>
  </svg>`;
}

// Outlined strokes, each with a dashed arrow along its path and its number at the start.
// On phones there's one board: arrows and numbers (no outlines) go on top of the writing pad.
let guideHost = guideEl;
function drawGuide(data, size, host, outlines) {
  guideHost = host;
  const t = HanziWriter.getScalingTransform(size, size, PAD);
  const pt = ([x, y]) => [t.x + x * t.scale, size - t.y - y * t.scale]; // character space -> board pixels
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.classList.add('strokes');
  if (!outlines) svg.classList.add('overlay');
  let html = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0 1 L9 5 L0 9 z"/></marker></defs><g transform="${t.transform}">`;
  if (outlines) data.strokes.forEach((d, i) => { html += `<path class="s" data-i="${i}" d="${d}" vector-effect="non-scaling-stroke"/>`; });
  html += '</g>';
  data.medians.forEach((m, i) => {
    const pts = m.map(pt);
    html += `<polyline class="a" data-i="${i}" points="${pts.map((p) => p.join(',')).join(' ')}" marker-end="url(#arrow)"/>`;
  });
  // Numbers last so they sit on top; nudged back from the start, away from the stroke's direction
  data.medians.forEach((m, i) => {
    const [p0, p1] = [pt(m[0]), pt(m[Math.min(1, m.length - 1)])];
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    const x = p0[0] - ((p1[0] - p0[0]) / len) * 11;
    const y = p0[1] - ((p1[1] - p0[1]) / len) * 11;
    html += `<text class="n" data-i="${i}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${i + 1}</text>`;
  });
  svg.innerHTML = html;
  if (outlines) {
    host.replaceChildren(svg);
    host.insertAdjacentHTML('afterbegin', grid(size));
  } else {
    host.appendChild(svg); // above the pad, which ignores it for touches (pointer-events: none)
  }
}

// Strokes already written fill in on the guide; the next one is picked out
function markGuide(done) {
  for (const el of guideHost.querySelectorAll('[data-i]')) {
    const i = +el.dataset.i;
    el.classList.toggle('done', i < done);
    el.classList.toggle('next', i === done);
  }
}

const say = (zh, en) => { statusEl.innerHTML = bi(zh, en); };
const sayStroke = (n, total) => say(`寫第 ${n} 筆（共 ${total} 筆）`, `Stroke ${n} of ${total}`);

function startQuiz() {
  const { data } = current;
  const total = data.strokes.length;
  markGuide(0);
  sayStroke(1, total);
  writer.quiz({
    showHintAfterMisses: 2,
    onCorrectStroke: ({ strokeNum, strokesRemaining }) => {
      markGuide(strokeNum + 1);
      if (strokesRemaining) sayStroke(strokeNum + 2, total);
    },
    onMistake: ({ mistakesOnStroke }) => {
      if (mistakesOnStroke >= 2) say('跟住閃嘅筆畫寫', 'Follow the flashing stroke');
      else say('唔係呢筆，再試吓', 'Not quite, try again');
    },
    onComplete: ({ totalMistakes }) => {
      markGuide(total);
      if (totalMistakes === 0) say('全對！寫得好 👏', 'Perfect, not a single slip 👏');
      else say(`寫完喇！錯咗 ${totalMistakes} 次`, `Done! ${totalMistakes} slip${totalMistakes === 1 ? '' : 's'} along the way`);
    },
  });
}

function watch() {
  if (!writer) return;
  writer.cancelQuiz();
  markGuide(-1);
  say('睇住先…', 'Watch first…');
  writer.animateCharacter({ onComplete: () => { if (practice.hidden) return; startQuiz(); } });
}

async function show(ch) {
  const my = ++token;
  for (const b of pickerEl.children) b.classList.toggle('on', b.textContent === ch);
  pchEl.textContent = ch;
  writer?.cancelQuiz();
  writer = null;
  guideEl.replaceChildren();
  padEl.replaceChildren();
  sheet.classList.remove('missing');
  say('載入中…', 'Loading…');
  let data;
  try {
    data = hongKongOrder(await HanziWriter.loadCharacterData(ch));
  } catch {
    data = null;
  }
  if (my !== token) return;
  if (!data) {
    sheet.classList.add('missing');
    say('暫時未有呢個字嘅筆順資料', 'No stroke data for this character yet');
    return;
  }
  const compact = matchMedia('(max-width: 600px)').matches;
  sheet.classList.toggle('compact', compact);
  const size = Math.round(padEl.clientWidth);
  current = { ch, data, size };
  if (!compact) drawGuide(data, size, guideEl, true);
  padEl.innerHTML = grid(size);
  const host = document.createElement('div');
  host.className = 'writer';
  padEl.appendChild(host);
  if (compact) drawGuide(data, size, padEl, false);
  writer = HanziWriter.create(host, ch, {
    width: size, height: size, padding: PAD,
    showCharacter: false, showOutline: true,
    charDataLoader: (_c, onLoad) => onLoad(data),
    strokeColor: css('--ink'), outlineColor: css('--line'), drawingColor: css('--ink'),
    highlightColor: css('--accent'), drawingWidth: Math.max(10, size / 22),
    strokeAnimationSpeed: 1.2, delayBetweenStrokes: 250,
  });
  startQuiz();
}

let lastFocus = null;
function openPractice(ch, chars = [ch]) {
  // The other characters from the search, to hop between without closing
  const unique = [...new Set(chars)];
  pickerEl.replaceChildren(...(unique.length > 1 ? unique : []).map((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.onclick = () => show(c);
    return b;
  }));
  lastFocus = document.activeElement;
  practice.hidden = false;
  practice.querySelector('.close').focus({ preventScroll: true });
  show(ch);
}

function closePractice() {
  token++;
  writer?.cancelQuiz();
  writer = null;
  practice.hidden = true;
  if (lastFocus && matchMedia('(pointer: fine)').matches) lastFocus.focus({ preventScroll: true });
}

practice.addEventListener('click', (e) => {
  if (e.target === practice || e.target.closest('.close')) closePractice();
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'watch') watch();
  if (act === 'again' && writer) startQuiz();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !practice.hidden) { e.stopPropagation(); closePractice(); } }, true);
