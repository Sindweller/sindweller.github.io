/* ========================================
   THEME DEBUG PANEL — live light/dark tuning
   Toggle: click header, or press ` (backtick)
======================================== */
(function () {
  const STORAGE_KEY = 'wh-theme-debug';
  const DEFAULTS = {
    theme: 'light',
    bgBrightness: 1.55,
    bgSaturate: 0.92,
    vignette: 0.22,
    dialogueAlpha: 0.94,
  };

  function load() {
    try {
      return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  const state = load();

  const panel = document.createElement('div');
  panel.id = 'theme-debug';
  panel.innerHTML = `
    <div class="td-head" id="td-toggle">🎨 主题调试 <span>点击折叠 · \` 快捷键</span></div>
    <div class="td-body">
      <div class="td-row">
        <label>模式</label>
        <div class="td-btns" style="flex:1;margin:0">
          <button type="button" data-theme-btn="dark">暗色</button>
          <button type="button" data-theme-btn="light">亮色</button>
        </div>
      </div>
      <div class="td-row">
        <label>背景亮度</label>
        <input type="range" id="td-bright" min="0.6" max="2.2" step="0.05">
        <span class="td-val" id="td-bright-v"></span>
      </div>
      <div class="td-row">
        <label>背景饱和</label>
        <input type="range" id="td-sat" min="0.4" max="1.4" step="0.05">
        <span class="td-val" id="td-sat-v"></span>
      </div>
      <div class="td-row">
        <label>暗角强度</label>
        <input type="range" id="td-vig" min="0" max="0.8" step="0.05">
        <span class="td-val" id="td-vig-v"></span>
      </div>
      <div class="td-row">
        <label>对话框透明度</label>
        <input type="range" id="td-dlg" min="0.6" max="1" step="0.02">
        <span class="td-val" id="td-dlg-v"></span>
      </div>
      <div class="td-btns">
        <button type="button" id="td-preset-light">亮色预设</button>
        <button type="button" id="td-preset-dark">暗色预设</button>
        <button type="button" id="td-reset">重置</button>
      </div>
      <div class="td-hint">调好后会自动记在 localStorage。正式定稿可把数值抄进 CSS。</div>
    </div>
  `;
  document.body.appendChild(panel);

  // Don't advance dialogue when interacting with the panel
  panel.addEventListener('click', (e) => e.stopPropagation());
  panel.addEventListener('mousedown', (e) => e.stopPropagation());

  const $ = (id) => panel.querySelector('#' + id);
  const bright = $('td-bright');
  const sat = $('td-sat');
  const vig = $('td-vig');
  const dlg = $('td-dlg');

  function apply() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const root = document.documentElement.style;
    root.setProperty('--bg-brightness', String(state.bgBrightness));
    root.setProperty('--bg-saturate', String(state.bgSaturate));
    root.setProperty('--vignette-strength', String(state.vignette));
    root.setProperty('--dialogue-alpha', String(state.dialogueAlpha));

    bright.value = state.bgBrightness;
    sat.value = state.bgSaturate;
    vig.value = state.vignette;
    dlg.value = state.dialogueAlpha;
    $('td-bright-v').textContent = Number(state.bgBrightness).toFixed(2);
    $('td-sat-v').textContent = Number(state.bgSaturate).toFixed(2);
    $('td-vig-v').textContent = Number(state.vignette).toFixed(2);
    $('td-dlg-v').textContent = Number(state.dialogueAlpha).toFixed(2);

    panel.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === state.theme);
    });
    save(state);
  }

  bright.addEventListener('input', () => { state.bgBrightness = +bright.value; apply(); });
  sat.addEventListener('input', () => { state.bgSaturate = +sat.value; apply(); });
  vig.addEventListener('input', () => { state.vignette = +vig.value; apply(); });
  dlg.addEventListener('input', () => { state.dialogueAlpha = +dlg.value; apply(); });

  panel.querySelectorAll('[data-theme-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.theme = btn.getAttribute('data-theme-btn');
      if (state.theme === 'light') {
        Object.assign(state, {
          bgBrightness: 1.55, bgSaturate: 0.92, vignette: 0.22, dialogueAlpha: 0.94,
        });
      } else {
        Object.assign(state, {
          bgBrightness: 1, bgSaturate: 1, vignette: 0.5, dialogueAlpha: 0.92,
        });
      }
      apply();
    });
  });

  $('td-preset-light').addEventListener('click', () => {
    Object.assign(state, {
      theme: 'light', bgBrightness: 1.55, bgSaturate: 0.92, vignette: 0.22, dialogueAlpha: 0.94,
    });
    apply();
  });
  $('td-preset-dark').addEventListener('click', () => {
    Object.assign(state, {
      theme: 'dark', bgBrightness: 1, bgSaturate: 1, vignette: 0.5, dialogueAlpha: 0.92,
    });
    apply();
  });
  $('td-reset').addEventListener('click', () => {
    Object.assign(state, DEFAULTS);
    apply();
  });

  $('td-toggle').addEventListener('click', () => {
    panel.classList.toggle('collapsed');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      panel.classList.toggle('collapsed');
      e.preventDefault();
    }
  });

  apply();

  // Expose for console tweaking
  window.ThemeDebug = {
    get: () => Object.assign({}, state),
    set: (patch) => { Object.assign(state, patch); apply(); },
    reset: () => { Object.assign(state, DEFAULTS); apply(); },
  };
})();
