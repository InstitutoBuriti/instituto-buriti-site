/* Instituto Buriti — biblioteca.js (SUBSTITUIÇÃO TOTAL)
 * Build: 2025-08-10-IB-03
 *
 * Correções desta build:
 * 1) Imagens do catálogo: paths normalizados para /desktop/images + placeholder com encodeURI
 * 2) Cards do catálogo: markup usando classes de cursos.css (.course-card, .course-image, .course-content etc.)
 * 3) Detalhes do curso: expõe window.bibliotecaManager.getCoursesData() e findCourse()
 * 4) Redirecionamento: sempre /pages/detalhes-curso.html?slug=...
 */

(() => {
  "use strict";

  const DEBUG = true;
  const log  = (...a) => DEBUG && console.log("[IB]", ...a);
  const warn = (...a) => DEBUG && console.warn("[IB]", ...a);

  // ========= Helpers =========
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const normalize = s => (s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
  const esc = s => String(s||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#39;");

  // Placeholders (com encodeURI por causa de espaços e vírgulas no nome do arquivo)
  const PRIMARY_PLACEHOLDER = encodeURI("/desktop/images/ChatGPT Image 6 de ago. de 2025, 23_37_06.png");
  const ALT_PLACEHOLDER     = "/desktop/images/default-course.png"; // opcional; use se existir no projeto

  // Corrige qualquer caminho de thumbnail para algo absoluto válido em /desktop/images
  function resolveThumb(p) {
    if (!p) return PRIMARY_PLACEHOLDER;
    const src = String(p).trim();

    // Remotos: mantém
    if (/^https?:\/\//i.test(src)) return src;

    // Já absoluto para /desktop
    if (src.startsWith("/desktop/")) return encodeURI(src);

    // Se vier "/images/..." prefixa "/desktop"
    if (src.startsWith("/images/")) return encodeURI("/desktop" + src);

    // Se vier "../images/..." (caso antigo), normaliza para /desktop/images/...
    if (src.startsWith("../images/")) {
      const rest = src.replace(/^..\//, ""); // remove "../"
      return encodeURI("/desktop/" + rest);
    }

    // Se vier "images/..." sem barra
    if (src.startsWith("images/")) return encodeURI("/desktop/" + src);

    // Qualquer outro caso: joga para /desktop/images/ + arquivo
    const file = src.split("/").pop();
    return encodeURI("/desktop/images/" + file);
  }

  // ========= Seletores & Estado =========
  const SEL = {
    container: "#coursesContainer, [data-courses-container], .courses-grid",
    categoria: "#categoria, [data-filter-categoria]",
    tiposWrap: ".checkbox-group, [data-filter-tipos]",
    carga: "#carga-horaria, [data-filter-carga]",
    nivel: 'input[name="nivel"]',
    ordenar: "#ordenar, [data-filter-ordenar]",
    clear: "#clearFiltersBtn, [data-clear-filters]"
  };

  const state = {
    allCourses: [],
    filtered: [],
    els: {}
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    mapElements();
    state.allCourses = loadInitialCourses();
    bindEvents();
    applyFilters();

    // API para detalhes-curso.html
    window.bibliotecaManager = {
      applyFilters,
      clearAllFilters,
      getCoursesData: () => state.allCourses.slice(),
      findCourse: (slug) => state.allCourses.find(c => (c.slug || c.id) === slug),
      getDetailsUrl
    };

    log("biblioteca.js pronto. Cursos:", state.allCourses.length);
  }

  function mapElements() {
    state.els.container = $(SEL.container);
    state.els.categoria = $(SEL.categoria);
    state.els.tiposWrap = $(SEL.tiposWrap);
    state.els.carga     = $(SEL.carga);
    state.els.nivel     = $$(SEL.nivel);
    state.els.ordenar   = $(SEL.ordenar);
    state.els.clear     = $(SEL.clear);

    if (!state.els.container) warn("Container não encontrado:", SEL.container);
  }

  function bindEvents() {
    state.els.categoria?.addEventListener("change", applyFilters);
    state.els.carga?.addEventListener("change", applyFilters);
    state.els.ordenar?.addEventListener("change", applyFilters);
    state.els.tiposWrap?.addEventListener("change", applyFilters);
    (state.els.nivel || []).forEach(r => r.addEventListener("change", applyFilters));
    state.els.clear?.addEventListener("click", (e)=>{ e.preventDefault(); clearAllFilters(); });
  }

  // ========= Fonte de dados (window.COURSES -> script JSON -> samples) =========
  function loadInitialCourses() {
    try {
      if (Array.isArray(window.COURSES) && window.COURSES.length) {
        log("Fonte: window.COURSES", window.COURSES.length);
        return window.COURSES;
      }
    } catch(e){ warn("Erro lendo window.COURSES", e); }

    try {
      const s = document.getElementById("courses-json");
      if (s) {
        const data = JSON.parse(s.textContent || "[]");
        if (Array.isArray(data) && data.length) {
          log("Fonte: #courses-json", data.length);
          return data;
        }
      }
    } catch(e){ warn("Erro parseando #courses-json", e); }

    const samples = [
      { id:"ia-fundamentos", title:"Fundamentos de IA", categoria:"tecnologia", nivel:"iniciante", tipos:["pago","certificado"], cargaHoraria:20, createdAt:"2025-07-20", acessos:124, description:"Conceitos básicos de IA e ML com exercícios práticos.", thumbnail:"/desktop/images/cursos/ia-fundamentos.jpg", slug:"ia-fundamentos" },
      { id:"python-dados", title:"Python para Dados", categoria:"tecnologia", nivel:"intermediario", tipos:["pago"], cargaHoraria:28, createdAt:"2025-07-28", acessos:96, description:"Do pandas ao gráfico: análise de dados aplicada.", thumbnail:PRIMARY_PLACEHOLDER, slug:"python-para-dados" },
      { id:"gestao-projetos", title:"Gestão de Projetos Ágeis", categoria:"gestao", nivel:"intermediario", tipos:["pago","certificado"], cargaHoraria:18, createdAt:"2025-08-02", acessos:210, description:"Scrum e Kanban na prática com estudos de caso.", thumbnail:"/desktop/images/cursos/gestao-agil.jpg", slug:"gestao-de-projetos-ageis" },
      { id:"financas-basicas", title:"Finanças Pessoais Essenciais", categoria:"gestao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:8, createdAt:"2025-07-15", acessos:330, description:"Controle de gastos, reserva de emergência e metas.", thumbnail:PRIMARY_PLACEHOLDER, slug:"financas-pessoais-essenciais" },
      { id:"producao-cultural", title:"Produção Cultural", categoria:"cultura", nivel:"intermediario", tipos:["pago"], cargaHoraria:16, createdAt:"2025-07-10", acessos:78, description:"Do edital à execução: projetos culturais sustentáveis.", thumbnail:"/desktop/images/cursos/producao-cultural.jpg", slug:"producao-cultural" },
      { id:"educacao-inclusiva", title:"Educação Inclusiva na Prática", categoria:"educacao", nivel:"avancado", tipos:["pago","certificado"], cargaHoraria:32, createdAt:"2025-06-30", acessos:142, description:"Estratégias e recursos para acessibilidade efetiva.", thumbnail:PRIMARY_PLACEHOLDER, slug:"educacao-inclusiva" },
      { id:"metodologias-ativas", title:"Metodologias Ativas", categoria:"educacao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:6, createdAt:"2025-08-05", acessos:52, description:"PBL, sala invertida e avaliação formativa.", thumbnail:"/desktop/images/cursos/metodologias-ativas.jpg", slug:"metodologias-ativas" },
      { id:"empreendedorismo-social", title:"Empreendedorismo Social", categoria:"outros", nivel:"intermediario", tipos:["pago"], cargaHoraria:14, createdAt:"2025-07-25", acessos:67, description:"Modelos de negócio de impacto e medição de resultados.", thumbnail:PRIMARY_PLACEHOLDER, slug:"empreendedorismo-social" }
    ];
    log("Fonte: SAMPLES", samples.length);
    return samples;
  }

  // ========= Filtros / Ordenação =========
  function getFilterValues() {
    const tipos = [];
    if (state.els.tiposWrap) {
      $$('.checkbox-group input[type="checkbox"]', state.els.tiposWrap).forEach(cb => cb.checked && tipos.push(cb.value));
    }
    const nivel = (state.els.nivel||[]).find(r=>r.checked)?.value || "";
    return {
      categoria: state.els.categoria?.value || "",
      tipos,
      carga: state.els.carga?.value || "",
      nivel,
      ordenar: state.els.ordenar?.value || "recentes"
    };
  }

  function applyFilters() {
    const f = getFilterValues();
    const list = state.allCourses.slice();

    state.filtered = list.filter(c => {
      const cat   = c.categoria || c.area || "";
      const niv   = c.nivel || c.level || "";
      const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
      const okCat   = !f.categoria || normalize(cat) === normalize(f.categoria);
      const okNivel = !f.nivel     || normalize(niv) === normalize(f.nivel);
      const okTipos = !f.tipos.length || f.tipos.every(t => tipos.map(normalize).includes(normalize(t)));
      const okCarga = matchCargaHoraria(c, f.carga);
      return okCat && okNivel && okTipos && okCarga;
    });

    sortCourses(state.filtered, f.ordenar);
    renderCourses();
    log("Cursos visíveis:", state.filtered.length);
  }

  function matchCargaHoraria(c, filtro) {
    if (!filtro) return true;
    const horas = parseFloat(String(c.cargaHoraria || c.duracao || "").replace(/[^0-9.,]/g,"").replace(",", ".")) || 0;
    if (filtro === "curta") return horas > 0 && horas < 10;
    if (filtro === "media") return horas >= 10 && horas <= 30;
    if (filtro === "longa") return horas > 30;
    return true;
  }

  function sortCourses(arr, criterio) {
    switch (criterio) {
      case "acessados":  arr.sort((a,b)=> (b.acessos||0) - (a.acessos||0)); break;
      case "alfabetico": arr.sort((a,b)=> String(a.title||"").localeCompare(String(b.title||""))); break;
      case "recentes":
      default:           arr.sort((a,b)=> new Date(b.createdAt||b.data||0) - new Date(a.createdAt||a.data||0)); break;
    }
  }

  function clearAllFilters() {
    if (state.els.categoria) state.els.categoria.value = "";
    if (state.els.carga) state.els.carga.value = "";
    if (state.els.ordenar) state.els.ordenar.value = "recentes";
    if (state.els.tiposWrap) $$('.checkbox-group input[type="checkbox"]', state.els.tiposWrap).forEach(cb => cb.checked = false);
    if (state.els.nivel && state.els.nivel.length) state.els.nivel[0].checked = true;
    applyFilters();
  }

  // ========= Render =========
  function renderCourses() {
    const wrap = state.els.container;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.filtered.length) {
      wrap.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#666">Nenhum curso encontrado.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filtered.forEach(c => frag.appendChild(renderCard(c)));
    wrap.appendChild(frag);
  }

  // Usa classes esperadas por /desktop/css/cursos.css
  function renderCard(c) {
    const card = document.createElement("article");
    card.className = "course-card";

    const thumb = resolveThumb(c.thumbnail);

    card.innerHTML = `
      <div class="course-image">
        <img src="${thumb}" alt="${esc(c.title)}"
             loading="lazy"
             onerror="if(this.dataset.fbk!=='1'){this.dataset.fbk='1';this.src='${ALT_PLACEHOLDER}'}">
        <span class="course-badge">${esc((c.tipos && c.tipos[0]) || c.tipo || "")}</span>
      </div>

      <div class="course-content">
        <h3 class="course-title">${esc(c.title)}</h3>
        <p class="course-description">${esc(c.description || "")}</p>

        <div class="course-meta">
          <span class="course-price">${c.price ? esc(`R$ ${Number(c.price).toFixed(2)}`) : ""}</span>
          <span class="course-method">${esc(c.categoria || c.area || "")}</span>
        </div>

        <a class="course-btn" href="${getDetailsUrl(c)}">Ver detalhes</a>
      </div>
    `;
    return card;
  }

  // ========= Navegação para detalhes =========
  function getDetailsUrl(c) {
    const slug = c.slug || c.id;
    return `/pages/detalhes-curso.html?slug=${encodeURIComponent(slug)}`;
  }
})();
