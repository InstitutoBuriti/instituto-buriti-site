// /js/click-lock.js
// Garante que QUALQUER clique em "Ver detalhes" vá para /pages/detalhes-curso.html?slug=...

(function () {
  const CANONICAL_PATH = "/pages/detalhes-curso.html";

  // Utilidade: extrai slug de forma generosa (do data-attr ou da URL)
  function getSlugFrom(el) {
    // 1) data-slug explícito (preferido)
    const ds = el.getAttribute("data-slug") || el.dataset?.slug;
    if (ds) return ds.trim();

    // 2) href (em caso de <a>)
    const href = el.getAttribute("href");
    if (href) {
      try {
        const u = new URL(href, location.origin);
        const s = u.searchParams.get("slug");
        if (s) return s.trim();
      } catch (_) { /* ignora */ }
    }

    // 3) sobe no DOM procurando algo com data-slug
    let p = el.parentElement;
    while (p) {
      const up = p.getAttribute?.("data-slug") || p.dataset?.slug;
      if (up) return up.trim();
      p = p.parentElement;
    }
    return null;
  }

  // Intercepta cliques no catálogo
  document.addEventListener("click", function (e) {
    const path = e.composedPath ? e.composedPath() : [e.target];

    // Procura um alvo com intenção de "ver detalhes"
    let trigger = null;
    for (const node of path) {
      if (!(node instanceof Element)) continue;

      // Botões/links mais comuns
      const isTrigger =
        node.matches?.('.see-details, .ver-detalhes, [data-action="ver-detalhes"], a[href*="detalhes-curso"], a[href*="detalhes-cursos"]');

      if (isTrigger) { trigger = node; break; }
    }
    if (!trigger) return; // não é clique em "ver detalhes"

    const slug = getSlugFrom(trigger);
    if (!slug) return; // sem slug, deixa o fluxo natural (ou validação de outro script)

    // Cancela o comportamento padrão e aplica a rota canônica
    e.preventDefault();
    e.stopPropagation();

    const url = `${CANONICAL_PATH}?slug=${encodeURIComponent(slug)}`;
    // Troca qualquer versão plural por singular antes de navegar (cinturão e suspensórios)
    const fixed = url.replace("/detalhes-cursos.html", "/detalhes-curso.html");

    // Navega de forma confiável
    window.location.assign(fixed);
  }, true); // captura = true para pegar cliques antes de handlers antigos

  // Defesa extra: se algum script antigo trocar o href dinamicamente, corrija
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "href" && m.target instanceof HTMLAnchorElement) {
        const a = m.target;
        if (a.href.includes("/detalhes-cursos.html")) {
          const u = new URL(a.href);
          a.href = `${location.origin}${CANONICAL_PATH}?${u.searchParams.toString()}`;
        }
      }
    }
  });
  obs.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["href"] });
})();