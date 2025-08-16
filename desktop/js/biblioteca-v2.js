/* /js/biblioteca-v2.js  — SUBSTITUIÇÃO TOTAL
   Catálogo de cursos (listagem + filtros) + utilitários para detalhes
   Public root (publish): /css, /js, /images, /pages
*/
(() => {
  "use strict";

  // ---------- Config ----------
  const IMG_FALLBACK = "/images/course-placeholder.jpg";
  const CANON = "/pages/detalhes-curso.html"; // caminho canônico (SINGULAR)

  // ---------- Helpers ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const norm = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

  // Aceitamos apenas caminhos servíveis do publish (/images/...). Espaços são codificados.
  function normalizeImgSrc(src) {
    if (!src) return IMG_FALLBACK;
    let s = String(src).trim();
    // Se vier algo local (ex.: "desktop/...") ou com protocolo externo, força fallback
    if (!s.startsWith("/images/")) return IMG_FALLBACK;
    // Codifica somente espaços e caracteres problemáticos simples
    try { s = s.replace(/ /g, "%20"); } catch {}
    return s || IMG_FALLBACK;
  }

  const SEL = {
    cont:   "#coursesContainer, .courses-grid, [data-courses-container]",
    cat:    "#categoria,[data-filter-categoria]",
    tipos:  ".checkbox-group,[data-filter-tipos]",
    carga:  "#carga-horaria,[data-filter-carga]",
    nivel:  'input[name="nivel"]',
    ord:    "#ordenar,[data-filter-ordenar]",
  };

  const state = {
    all:  [],
    filt: [],
    el:   {},
    bound:false,
  };

  // ---------- Bootstrap ----------
  document.addEventListener("DOMContentLoaded", init);

  function init(){
    if (state.bound) return; // evita dupla inicialização
    state.bound = true;

    state.all = loadData();
    mapEls();
    bind();
    apply();

    // expõe para a página de detalhes
    window.bibliotecaManager = {
      getCoursesData: () => state.all.slice(),
      hydrateCourses: (list) => {
        if (Array.isArray(list)) {
          state.all = list.slice();
          apply();
        }
      }
    };

    try { console.debug("[biblioteca-v2] cursos carregados:", state.all.length); } catch {}
  }

  function mapEls(){
    state.el.cont  = $(SEL.cont);
    state.el.cat   = $(SEL.cat);
    state.el.tipos = $(SEL.tipos);
    state.el.carga = $(SEL.carga);
    state.el.nivel = $$(SEL.nivel);
    state.el.ord   = $(SEL.ord);
  }

  function bind(){
    state.el.cat   && state.el.cat.addEventListener("change", apply);
    state.el.carga && state.el.carga.addEventListener("change", apply);
    state.el.ord   && state.el.ord.addEventListener("change", apply);
    state.el.tipos && state.el.tipos.addEventListener("change", apply);
    state.el.nivel.forEach(r => r.addEventListener("change", apply));
  }

  // ---------- Data ----------
  function loadData(){
    if (Array.isArray(window.COURSES) && window.COURSES.length) return window.COURSES;

    const s = document.getElementById("courses-json");
    if (s) {
      try {
        const data = JSON.parse(s.textContent || "[]");
        if (Array.isArray(data) && data.length) return data;
      } catch {/* noop */}
    }
    return [];
  }

  // ---------- Filtros / Ordenação ----------
  function currentFilters(){
    const tipos = [];
    if (state.el.tipos) {
      $$('.checkbox-group input[type="checkbox"]', state.el.tipos)
        .forEach(cb => cb.checked && tipos.push(cb.value));
    }
    return {
      cat: state.el.cat?.value || "",
      tipos,
      carga: state.el.carga?.value || "",
      nivel: state.el.nivel.find(r => r.checked)?.value || "",
      ord: state.el.ord?.value || "recentes",
    };
  }

  function matchCarga(valor, filtro){
    const n = parseFloat(String(valor ?? "").replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
    if (!filtro) return true;
    if (filtro === "curta") return n > 0 && n < 10;
    if (filtro === "media") return n >= 10 && n <= 30;
    if (filtro === "longa") return n > 30;
    return true;
  }

  function apply(){
    const f = currentFilters();
    const list = state.all.slice();

    state.filt = list.filter(c => {
      const cat   = c.categoria || c.area || "";
      const niv   = c.nivel || c.level || "";
      const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
      const okCat   = !f.cat   || norm(cat) === norm(f.cat);
      const okNiv   = !f.nivel || norm(niv) === norm(f.nivel);
      const okTipos = !f.tipos.length || f.tipos.every(t => tipos.map(norm).includes(norm(t)));
      const okCarga = matchCarga(c.cargaHoraria ?? c.duracao, f.carga);
      return okCat && okNiv && okTipos && okCarga;
    });

    sort(state.filt, f.ord);
    render();
  }

  function sort(arr, by){
    if (by === "acessados")  return arr.sort((a,b) => (b.acessos||0) - (a.acessos||0));
    if (by === "alfabetico") return arr.sort((a,b) => String(a.title||"").localeCompare(String(b.title||"")));
    return arr.sort((a,b) => new Date(b.createdAt||b.data||0) - new Date(a.createdAt||a.data||0));
  }

  // ---------- Render ----------
  function urlDetalhes(curso){
    const slug = (curso.slug || curso.id || "").trim();
    const safeSlug = encodeURIComponent(slug);
    return `${CANON}?slug=${safeSlug}`;
  }

  function priceText(c){
    if (Array.isArray(c.tipos) && c.tipos.includes("gratuito")) return "Gratuito";
    if (c.price != null && !Number.isNaN(Number(c.price))) return "R$ " + Number(c.price).toFixed(2);
    return "";
  }

  function badgeKind(c){
    const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
    return tipos.includes("gratuito") ? "popular" : "";
  }

  function badgeText(c){
    const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
    if (tipos.includes("certificado")) return "CERTIFICADO";
    if (tipos.includes("gratuito"))    return "GRATUITO";
    if (tipos.includes("pago"))        return "PAGO";
    return "TECN";
  }

  function escapeHtml(s){
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  function render(){
    const wrap = state.el.cont;
    if (!wrap) return;

    wrap.innerHTML = "";

    if (!state.filt.length){
      wrap.innerHTML = `
        <div class="ib-empty">
          <div class="ib-empty__icon">📚</div>
          <p>Nenhum curso encontrado.</p>
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filt.forEach(c => frag.appendChild(card(c)));
    wrap.appendChild(frag);
  }

  function card(c){
    const el = document.createElement("article");
    el.className = "course-card";

    const imgSrc = normalizeImgSrc(c.thumbnail);
    const detailsUrl = urlDetalhes(c);

    el.innerHTML = `
      <div class="course-image">
        <img data-role="thumb" src="${imgSrc}" alt="${escapeHtml(c.title)}">
        <span class="course-badge ${badgeKind(c)}">${badgeText(c)}</span>
      </div>

      <div class="course-content">
        <h3 class="course-title">${escapeHtml(c.title)}</h3>
        <p class="course-description">${escapeHtml(c.description || "")}</p>

        <div class="course-meta">
          <span class="course-method">${escapeHtml((c.nivel || "").toUpperCase())}</span>
          <span class="course-price">${escapeHtml(priceText(c))}</span>
        </div>

        <a class="course-btn" href="${detailsUrl}" data-href="${detailsUrl}">Ver detalhes</a>
      </div>
    `;

    // Fallback robusto: se falhar o carregamento, troca para IMG_FALLBACK
    const img = el.querySelector('img[data-role="thumb"]');
    if (img) {
      img.addEventListener('error', () => {
        if (img.src !== location.origin + IMG_FALLBACK && !img.src.endsWith(IMG_FALLBACK)) {
          img.src = IMG_FALLBACK;
        }
      }, { once: true });
    }

    return el;
  }
})();