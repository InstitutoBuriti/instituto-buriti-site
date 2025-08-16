(function () {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
  const version = "v=" + timestamp;

  // Atualiza todos os CSS
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (link.href.includes("?v=")) {
      link.href = link.href.replace(/v=[^&]+/, version);
    } else {
      link.href += (link.href.includes("?") ? "&" : "?") + version;
    }
  });

  // Atualiza todos os JS
  document.querySelectorAll('script[src]').forEach(script => {
    if (script.src.includes("/js/anti-cache.js")) return; // não atualiza ele mesmo
    if (script.src.includes("?v=")) {
      script.src = script.src.replace(/v=[^&]+/, version);
    } else {
      script.src += (script.src.includes("?") ? "&" : "?") + version;
    }
  });
})();
