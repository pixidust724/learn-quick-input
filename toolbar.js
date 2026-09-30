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
// Link between the lookup and the history page
const onHistory = document.body.dataset.page === 'history';
const nav = document.createElement('a');
nav.className = 'nav';
nav.href = onHistory ? './' : 'history.html';
nav.textContent = onHistory ? '查碼' : '源流';
nav.title = onHistory ? 'Back to Quick lookup' : 'The history of Quick and Chinese input';
const gh = document.createElement('a');
gh.className = 'gh';
gh.href = 'https://github.com/pixidust724';
gh.target = '_blank';
gh.rel = 'noopener';
gh.title = 'pixidust724 on GitHub';
gh.setAttribute('aria-label', 'GitHub');
gh.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
tools.append(nav, themeBtn, gh);
document.body.appendChild(tools);
