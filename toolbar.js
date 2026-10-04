// ---------- Toolbar ----------

const store = {
  get(k, d) { try { const v = localStorage.getItem('quick:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('quick:' + k, JSON.stringify(v)); } catch {} },
};
const root = document.documentElement;

// ---------- Language ----------
// Both languages are in the page as .zh / .en, and CSS hides the one not picked.
// Follows the browser until the person picks one with the 中/EN toggle.
const browserLang = () => (/^zh/i.test(navigator.language) ? 'zh' : 'en');
const lang = () => root.dataset.lang;
function setLang(l) {
  root.dataset.lang = l;
  root.lang = l === 'zh' ? 'zh-Hant' : 'en';
  // Tooltips can't be switched by CSS, so they keep both texts and swap here
  for (const el of document.querySelectorAll('[data-title-zh]')) el.title = el.dataset['title' + (l === 'zh' ? 'Zh' : 'En')];
  renderLang();
}
// A tooltip in both languages, showing the current one
function setTitle(el, zh, en) {
  el.dataset.titleZh = zh;
  el.dataset.titleEn = en;
  el.title = lang() === 'zh' ? zh : en;
}

const langBtn = document.createElement('button');
langBtn.className = 'theme lang';
function renderLang() {
  langBtn.textContent = lang() === 'zh' ? 'EN' : '中';
  langBtn.title = lang() === 'zh' ? 'Read in English' : '轉做中文';
}
langBtn.onclick = () => { const l = lang() === 'zh' ? 'en' : 'zh'; store.set('lang', l); setLang(l); };
addEventListener('languagechange', () => { if (!store.get('lang', null)) setLang(browserLang()); });
setLang(store.get('lang', null) || browserLang());

// ---------- Theme ----------
// Light / dark toggle: follows the system until the person picks one
const themeBtn = document.createElement('button');
themeBtn.className = 'theme';
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
const renderTheme = () => {
  themeBtn.textContent = isDark() ? '☀︎' : '☾';
  setTitle(themeBtn, isDark() ? '轉淺色' : '轉深色', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
};
const savedTheme = store.get('theme', null);
if (savedTheme) root.dataset.theme = savedTheme;
themeBtn.onclick = () => { root.dataset.theme = isDark() ? 'light' : 'dark'; store.set('theme', root.dataset.theme); renderTheme(); };
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderTheme);
renderTheme();

const tools = document.createElement('div');
tools.className = 'tools';
// Link between the lookup and the history page
const onHistory = document.body.dataset.page === 'history';
const nav = document.createElement('a');
nav.className = 'nav';
nav.href = onHistory ? './' : 'history.html';
nav.innerHTML = onHistory
  ? '<span class="zh" lang="zh-Hant">查碼</span><span class="en" lang="en">Lookup</span>'
  : '<span class="zh" lang="zh-Hant">源流</span><span class="en" lang="en">History</span>';
if (onHistory) setTitle(nav, '返去查碼', 'Back to Quick lookup');
else setTitle(nav, '速成同中文輸入法嘅源流', 'The history of Quick and Chinese input');
const gh = document.createElement('a');
gh.className = 'gh';
gh.href = 'https://github.com/pixidust724/learn-quick-input';
gh.target = '_blank';
gh.rel = 'noopener';
setTitle(gh, 'GitHub 上嘅原始碼', 'Source code on GitHub');
gh.setAttribute('aria-label', 'GitHub');
gh.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
tools.append(nav, langBtn, themeBtn, gh);
document.body.appendChild(tools);
