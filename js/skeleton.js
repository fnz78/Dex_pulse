/* ============================================================
   DEXPULSE SKELETON & PRELOADER CONTROLLER
   ============================================================ */

window.DexSkeleton = (function () {
  function setPanelLoading(isLoading) {
    const panels = document.querySelectorAll('.panel-skeleton-target');
    panels.forEach(p => {
      if (isLoading) {
        p.classList.add('is-loading');
      } else {
        p.classList.remove('is-loading');
      }
    });
  }

  function updatePreloaderProgress(pct, statusText) {
    const bar = document.getElementById('preloaderBar');
    const status = document.getElementById('preloaderStatus');
    if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    if (status && statusText) status.textContent = statusText;
  }

  function hidePreloader() {
    updatePreloaderProgress(100, 'TACTICAL INDEX READY');
    setTimeout(() => {
      const overlay = document.getElementById('preloaderOverlay');
      if (overlay) {
        overlay.classList.add('fade-out');
      }
    }, 400);
  }

  return {
    setPanelLoading,
    updatePreloaderProgress,
    hidePreloader
  };
})();

