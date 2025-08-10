/* Instituto Buriti — biblioteca.js (SUBSTITUIÇÃO TOTAL)
 * Build: detalhes-2025-08-09-1
 *
 * Mudanças-chave desta build:
 * - getDetailsUrl() agora redireciona SEMPRE para /pages/detalhes-curso.html?slug=...
 * - Fallback robusto de dados: window.COURSES -> #courses-json -> 8 cursos de teste
 * - Suporte a múltiplos seletores de container (.courses-grid, #coursesContainer, [data-courses-container])
 * - Imagem padrão com onerror: "../images/ChatGPT Image 6 de ago. de 2025, 23_37_06.png" -> "../images/default-course.png"
 * - Logs de diagnóstico (DEBUG=true) para confirmar a fonte dos dados e a URL de detalhes
 */

(() => {
  "use strict";

  const DEBUG = true;
  const IB_VERSION = "IB-biblioteca.js build detalhes-2025-08-09-1";
  const log  = (...a) => DEBUG && console.log("IB::", ...a);
  const warn = (...a) => DEBUG && console.warn("IB::", ...a);

  // Helpers
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const normalize = s => (s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
  const escapeHtml = s => String(s||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#39;");

  const DEFAULT_THUMBS = [
    "../images/ChatGPT Image 6 de ago. de 2025, 23_37_06.png",
    "../images/default-course.png"
  ];

  const SEL = {
    container: "#coursesContainer, [data-courses-container], .courses-grid",
    categoria: "#categoria, [data-filter-categoria]",
    tiposGroup: ".checkbox-group, [data-filter-tipos]",
    carga: "#carga-horaria, [data-filter-carga]",
    nivelRadios: 'input[name="nivel"]',
    ordenar: "#ordenar, [data-filter-ordenar]",
    clear: "#clearFiltersBtn, [data-clear-filters]"
  };

  const state = { allCourses: [], filtered: [], els: {} };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.info(IB_VERSION);
    state.allCourses = loadInitialCourses();
    mapElements();
    bindEvents();
    applyFilters();
    log("Pronto. Cursos carregados:", state.allCourses.length);
    // API mínima para debug manual
    window.bibliotecaManager = { applyFilters, clearAllFilters };
  }

  function mapElements() {
    state.els.container   = $(SEL.container);
    state.els.categoria   = $(SEL.categoria);
    state.els.tiposGroup  = $(SEL.tiposGroup);
    state.els.carga       = $(SEL.carga);
    state.els.nivelRadios = $$(SEL.nivelRadios);
    state.els.ordenar     = $(SEL.ordenar);
    state.els.clear       = $(SEL.clear);
    if (!state.els.container) warn("Container NÃO encontrado:", SEL.container);
  }

  function bindEvents() {
    state.els.categoria?.addEventListener("change", applyFilters);
    state.els.carga?.addEventListener("change", applyFilters);
    state.els.ordenar?.addEventListener("change", applyFilters);
    state.els.tiposGroup?.addEventListener("change", applyFilters);
    (state.els.nivelRadios||[]).forEach(r => r.addEventListener("change", applyFilters));
    state.els.clear?.addEventListener("click", (e)=>{ e.preventDefault(); clearAllFilters(); });
  }

  // FONTE DE DADOS (3 níveis)
  function loadInitialCourses() {
    // 1) window.COURSES
    try {
      if (Array.isArray(window.COURSES) && window.COURSES.length) {
        log("Fonte: window.COURSES (", window.COURSES.length, ")");
        return window.COURSES;
      }
    } catch(e) { warn("Erro lendo window.COURSES:", e); }

    // 2) <script id="courses-json">
    try {
      const s = document.getElementById("courses-json");
      if (s) {
        const data = JSON.parse(s.textContent || "[]");
        if (Array.isArray(data) && data.length) {
          log("Fonte: #courses-json (", data.length, ")");
          return data;
        }
      }
    } catch(e) { warn("Erro parseando #courses-json:", e); }

    // 3) Fallback de teste
    const samples = [
      { id:"ia-fundamentos", title:"Fundamentos de IA", categoria:"tecnologia", nivel:"iniciante", tipos:["pago","certificado"], cargaHoraria:20, createdAt:"2025-07-20", acessos:124, description:"Conceitos básicos de IA e ML com exercícios práticos.", thumbnail:"../images/cursos/ia-fundamentos.jpg", slug:"ia-fundamentos" },
      { id:"python-dados", title:"Python para Dados", categoria:"tecnologia", nivel:"intermediario", tipos:["pago"], cargaHoraria:28, createdAt:"2025-07-28", acessos:96, description:"Do pandas ao gráfico: análise de dados aplicada.", thumbnail:DEFAULT_THUMBS[0], slug:"python-para-dados" },
      { id:"gestao-projetos", title:"Gestão de Projetos Ágeis", categoria:"gestao", nivel:"intermediario", tipos:["pago","certificado"], cargaHoraria:18, createdAt:"2025-08-02", acessos:210, description:"Scrum e Kanban na prática com estudos de caso.", thumbnail:"../images/cursos/gestao-agil.jpg", slug:"gestao-de-projetos-ageis" },
      { id:"financas-basicas", title:"Finanças Pessoais Essenciais", categoria:"gestao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:8, createdAt:"2025-07-15", acessos:330, description:"Controle de gastos, reserva de emergência e metas.", thumbnail:DEFAULT_THUMBS[0], slug:"financas-pessoais-essenciais" },
      { id:"producao-cultural", title:"Produção Cultural", categoria:"cultura", nivel:"intermediario", tipos:["pago"], cargaHoraria:16, createdAt:"2025-07-10", acessos:78, description:"Do edital à execução: projetos culturais sustentáveis.", thumbnail:"../images/cursos/producao-cultural.jpg", slug:"producao-cultural" },
      { id:"educacao-inclusiva", title:"Educação Inclusiva na Prática", categoria:"educacao", nivel:"avancado", tipos:["pago","certificado"], cargaHoraria:32, createdAt:"2025-06-30", acessos:142, description:"Estratégias e recursos para acessibilidade efetiva.", thumbnail:DEFAULT_THUMBS[0], slug:"educacao-inclusiva" },
      { id:"metodologias-ativas", title:"Metodologias Ativas", categoria:"educacao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:6, createdAt:"2025-08-05", acessos:52, description:"PBL, sala invertida e avaliação formativa.", thumbnail:"../images/cursos/metodologias-ativas.jpg", slug:"metodologias-ativas" },
      { id:"empreendedorismo-social", title:"Empreendedorismo Social", categoria:"outros", nivel:"intermediario", tipos:["pago"], cargaHoraria:14, createdAt:"2025-07-25", acessos:67, description:"Modelos de negócio de impacto e medição de resultados.", thumbnail:DEFAULT_THUMBS[0], slug:"empreendedorismo-social" }
    ];
    log("Fonte: SAMPLES (", samples.length, ")");
    return samples;
  }

  // Coleta dos filtros
  function getFilterValues() {
    const tipos = [];
    if (state.els.tiposGroup) $$('.checkbox-group input[type="checkbox"]', state.els.tiposGroup).forEach(cb => cb.checked && tipos.push(cb.value));
    const nivel = (state.els.nivelRadios||[]).find(r=>r.checked)?.value || "";
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
    log("Aplicando filtros:", f);
    const list = state.allCourses.slice();

    state.filtered = list.filter(c => {
      const cat   = c.categoria || c.area || "";
      const niv   = c.nivel || c.level || "";
      const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
      const matchCategoria = !f.categoria || normalize(cat) === normalize(f.categoria);
      const matchNivel     = !f.nivel || normalize(niv) === normalize(f.nivel);
      const matchTipos     = !f.tipos.length || f.tipos.every(t => tipos.map(normalize).includes(normalize(t)));
      const matchCarga     = matchCargaHoraria(c, f.carga);
      return matchCategoria && matchNivel && matchTipos && matchCarga;
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
    if (state.els.tiposGroup) $$('.checkbox-group input[type="checkbox"]', state.els.tiposGroup).forEach(cb => cb.checked = false);
    if (state.els.nivelRadios && state.els.nivelRadios.length) state.els.nivelRadios[0].checked = true;
    applyFilters();
  }

  // Renderização
  function renderCourses() {
    const wrap = state.els.container;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.filtered.length) {
      wrap.innerHTML = `
        <div class="ib-empty">
          <div class="ib-empty__icon" aria-hidden="true">📚</div>
          <p class="ib-empty__text">Nenhum curso encontrado.</p>
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filtered.forEach(c => frag.appendChild(renderCard(c)));
    wrap.appendChild(frag);
  }

  function renderCard(c) {
    const el = document.createElement("article");
    el.className = "ib-card";

    const primaryThumb = (c.thumbnail && String(c.thumbnail).trim()) ? c.thumbnail : DEFAULT_THUMBS[0];
    const altThumb     = DEFAULT_THUMBS[1];

    el.innerHTML = `
      <div class="ib-card__media">
        <img class="ib-card__thumb"
             src="${primaryThumb}"
             alt="${escapeHtml(c.title)}"
             loading="lazy"
             onerror="if (this.dataset.fbk!=='1'){ this.dataset.fbk='1'; this.src='${altThumb}'; }"/>
      </div>
      <div class="ib-card__body">
        <h3 class="ib-card__title">${escapeHtml(c.title)}</h3>
        <p class="ib-card__meta">
          <span class="ib-badge">${c.categoria || c.area || ""}</span>
          <span class="ib-badge">${c.nivel || c.level || ""}</span>
          <span class="ib-badge">${Array.isArray(c.tipos) ? c.tipos.join(" / ") : (c.tipo || c.type || "")}</span>
        </p>
        <p class="ib-card__desc">${escapeHtml(c.description || "")}</p>
      </div>
      <div class="ib-card__actions">
        <a class="ib-btn ib-btn--primary" href="${getDetailsUrl(c)}">Ver detalhes</a>
      </div>`;
    return el;
  }

  // >>>>>>> NOVO FLUXO: SEMPRE /pages/detalhes-curso.html?slug=...
  function getDetailsUrl(c) {
    const slug = c.slug || c.id;
    const url = `/pages/detalhes-curso.html?slug=${encodeURIComponent(slug)}`;
    log("URL detalhes:", url);
    return url;
  }
})();
