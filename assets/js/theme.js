(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function getEffectiveTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTheme() {
    var current = getEffectiveTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply on load
  applyTheme(getEffectiveTheme());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getEffectiveTheme());
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  // Sync across tabs
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) applyTheme(getEffectiveTheme());
  });
})();
