/* route-guard.js — força rota canônica de detalhes de curso */
(function () {
  const DETAILS_PATH = "/pages/detalhes-curso.html";

  function fixHref(a) {
    if (!a) return;
    try {
      const raw = a.getAttribute("href");
      if (!raw) return;

      const url = new URL(raw, window.location.origin);

      // 1) Se vier no plural, troca para o singular
      if (url.pathname.includes("detalhes-cursos.html")) {
        url.pathname = DETAILS_PATH;
      }

      // 2) Se o link apunta para a página correta mas sem slug,
      // e o card tiver data-slug, injeta automaticamente
      if (url.pathname === DETAILS_PATH) {
        const hasSlug = url.searchParams.has("slug");
        if (!hasSlug && a.dataset && a.dataset.slug) {
          url.searchParams.set("slug", a.dataset.slug);
        }
      }

      // grava de volta se algo mudou
      const fixed = url.pathname + url.search + url.hash;
      if (fixed !== raw) a.setAttribute("href", fixed);
    } catch (e) {
      // silencia erros de URL inválida
    }
  }

  function scan() {
    // corrige tanto singular quanto plural (e qualquer variação)
    document.querySelectorAll('a[href*="detalhes-curso"]').forEach(fixHref);
    document.querySelectorAll('a[href*="detalhes-cursos"]').forEach(fixHref);
  }

  // primeira varredura
  scan();

  // observa a grid (cards criados via JS) e o body como fallback
  const target = document.getElementById("coursesContainer") || document.body;
  const mo = new MutationObserver(() => scan());
  mo.observe(target, { childList: true, subtree: true });

  // cinto de segurança: se algum link “escapar”, corrigimos no clique
  document.addEventListener("click", (ev) => {
    const a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href) return;

    if (href.includes("detalhes-cursos.html")) {
      ev.preventDefault();
      try {
        const url = new URL(href, window.location.origin);
        url.pathname = DETAILS_PATH;
        window.location.assign(url.pathname + url.search + url.hash);
      } catch {
        // se a URL for estranha, pelo menos manda para a página base
        window.location.assign(DETAILS_PATH);
      }
    }
  });
})();
