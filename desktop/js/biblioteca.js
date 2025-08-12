/* Instituto Buriti — biblioteca.js (SUBSTITUIÇÃO TOTAL)
 * Build: cursos-2025-08-11-IB-3
 *
 * Principais correções desta build:
 * - Conserta TODOS os caminhos de imagem para /desktop/images/... (com fallback).
 * - Renderiza cards usando as classes do seu CSS (.course-card, .course-image, .course-content, .course-btn).
 * - Mantém filtros/ordenação e expõe getCoursesData() para detalhes-curso.html.
 * - “Ver detalhes” sempre vai para /pages/detalhes-curso.html?slug=...
 */
(() => {
  "use strict";

  const DEBUG = true;
  const log  = (...a) => DEBUG && console.log("[IB]", ...a);
  const warn = (...a) => DEBUG && console.warn("[IB]", ...a);

  // Caminhos
  const PATH_PREFIX = "/desktop";
  const DEFAULT_IMG = `${PATH_PREFIX}/images/default-course.png`;
  const ALT_PLACEHOLDER = `${PATH_PREFIX}/images/ChatGPT Image 6 de ago. de 2025, 23_37_06.png`;

  // Seletores da página
  const SEL = {
    container: "#coursesContainer, [data-courses-container], .courses-grid",
    categoria: "#categoria, [data-filter-categoria]",
    tiposWrap: ".checkbox-group, [data-filter-tipos]",
    carga: "#carga-horaria, [data-filter-carga]",
    nivelRadios: 'input[name="nivel"]',
    ordenar: "#ordenar, [data-filter-ordenar]",
    clear: "#clearFiltersBtn, [data-clear-filters]"
  };

  const state = {
    allCourses: [],
    filtered: [],
    els: {}
  };

  // Utils
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const normalize = s => (s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
  const esc = s => String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#39;");

  function fixThumbPath(src) {
    if (!src || !String(src).trim()) return DEFAULT_IMG;
    const s = String(src).trim();

    // Já é absoluto (desktop) ou http(s)
    if (s.startsWith(PATH_PREFIX + "/images/")) return s;
    if (/^https?:\/\//i.test(s)) return s;

    // Casos comuns do seu projeto
    if (s.startsWith("../images/")) return s.replace("../images/", PATH_PREFIX + "/images/");
    if (s.startsWith("/images/"))  return s.replace("/images/",  PATH_PREFIX + "/images/");
    if (s.startsWith("images/"))   return `${PATH_PREFIX}/${s}`;

    // Pastas “cursos/...” que estavam relativas
    if (s.startsWith("../")) return s.replace("../", PATH_PREFIX + "/");
    if (s.startsWith("./"))  return s.replace("./", PATH_PREFIX + "/");

    // Último recurso: prefixar
    return `${PATH_PREFIX}/images/${s.replace(/^\/+/, "")}`;
  }

  function normalizeCourse(c) {
    const cc = { ...c };
    cc.slug = cc.slug || cc.id || String(cc.title||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,"");
    cc.thumbnail = fixThumbPath(cc.thumbnail);
    return cc;
  }

  // Fonte de dados (window.COURSES -> #courses-json -> fallback)
  function loadInitialCourses() {
    // 1) window.COURSES
    try {
      if (Array.isArray(window.COURSES) && window.COURSES.length) {
        const out = window.COURSES.map(normalizeCourse);
        log("Fonte: window.COURSES", out.length);
        return out;
      }
    } catch(e) { warn("Erro em window.COURSES:", e); }

    // 2) script embutido
    try {
      const s = document.getElementById("courses-json");
      if (s) {
        const data = JSON.parse(s.textContent || "[]");
        if (Array.isArray(data) && data.length) {
          const out = data.map(normalizeCourse);
          log("Fonte: #courses-json", out.length);
          return out;
        }
      }
    } catch(e) { warn("Erro parseando #courses-json:", e); }

    // 3) fallback (mesmo conjunto usado nos detalhes)
    const samples = [
      { id:"ia-fundamentos", title:"Fundamentos de IA", categoria:"tecnologia", nivel:"iniciante", tipos:["pago","certificado"], cargaHoraria:20, createdAt:"2025-07-20", acessos:124, description:"Conceitos básicos de IA e ML com exercícios práticos.", thumbnail:`${PATH_PREFIX}/images/cursos/ia-fundamentos.jpg`, slug:"ia-fundamentos" },
      { id:"python-dados", title:"Python para Dados", categoria:"tecnologia", nivel:"intermediario", tipos:["pago"], cargaHoraria:28, createdAt:"2025-07-28", acessos:96, description:"Do pandas ao gráfico: análise de dados aplicada.", thumbnail:ALT_PLACEHOLDER, slug:"python-para-dados" },
      { id:"gestao-projetos", title:"Gestão de Projetos Ágeis", categoria:"gestao", nivel:"intermediario", tipos:["pago","certificado"], cargaHoraria:18, createdAt:"2025-08-02", acessos:210, description:"Scrum e Kanban na prática com estudos de caso.", thumbnail:`${PATH_PREFIX}/images/cursos/gestao-agil.jpg`, slug:"gestao-de-projetos-ageis" },
      { id:"financas-basicas", title:"Finanças Pessoais Essenciais", categoria:"gestao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:8, createdAt:"2025-07-15", acessos:330, description:"Controle de gastos, reserva de emergência e metas.", thumbnail:ALT_PLACEHOLDER, slug:"financas-pessoais-essenciais" },
      { id:"producao-cultural", title:"Produção Cultural", categoria:"cultura", nivel:"intermediario", tipos:["pago"], cargaHoraria:16, createdAt:"2025-07-10", acessos:78, description:"Do edital à execução: projetos culturais sustentáveis.", thumbnail:`${PATH_PREFIX}/images/cursos/producao-cultural.jpg`, slug:"producao-cultural" },
      { id:"educacao-inclusiva", title:"Educação Inclusiva na Prática", categoria:"educacao", nivel:"avancado", tipos:["pago","certificado"], cargaHoraria:32, createdAt:"2025-06-30", acessos:142, description:"Estratégias e recursos para acessibilidade efetiva.", thumbnail:ALT_PLACEHOLDER, slug:"educacao-inclusiva" },
      { id:"metodologias-ativas", title:"Metodologias Ativas", categoria:"educacao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:6, createdAt:"2025-08-05", acessos:52, description:"PBL, sala invertida e avaliação formativa.", thumbnail:`${PATH_PREFIX}/images/cursos/metodologias-ativas.jpg`, slug:"metodologias-ativas" },
      { id:"empreendedorismo-social", title:"Empreendedorismo Social", categoria:"outros", nivel:"intermediario", tipos:["pago"], cargaHoraria:14, createdAt:"2025-07-25", acessos:67, description:"Modelos de negócio de impacto e medição de resultados.", thumbnail:ALT_PLACEHOLDER, slug:"empreendedorismo-social" }
    ].map(normalizeCourse);

    log("Fonte: SAMPLES", samples.length);
    return samples;
  }

  // --- Filtros/ordenar
  function getFilterValues() {
    const tipos = [];
    if (state.els.tiposWrap) {
      $$('.checkbox-group input[type="checkbox"]', state.els.tiposWrap)
        .forEach(cb => cb.checked && tipos.push(cb.value));
    }
    const nivel = (state.els.nivelRadios||[]).find(r=>r.checked)?.value || "";

    return {
      categoria: state.els.categoria?.value || "",
      tipos,
      carga: state.els.carga?.value || "",
      nivel,
      ordenar: state.els.ordenar?.value || "recentes"
    };
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

  // --- Render
  function getDetailsUrl(c) {
    const slug = c.slug || c.id;
    return `/pages/detalhes-curso.html?slug=${encodeURIComponent(slug)}`;
  }

  function renderCard(c) {
    // Usa classes do seu cursos.css
    const el = document.createElement("article");
    el.className = "course-card";

    // badge “tipo” (pago/gratuito/certificado…)
    const badges = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
    const badgeHtml = badges.map(t => `<span class="course-badge ${t === 'gratuito' ? 'popular' : ''}">${esc(String(t).toUpperCase())}</span>`).join(" ");

    el.innerHTML = `
      <div class="course-image">
        <img src="${esc(c.thumbnail)}"
             alt="${esc(c.title)}"
             onerror="this.onerror=null;this.src='${DEFAULT_IMG}';">
        <span class="course-badge">${esc(c.categoria || c.area || '')}</span>
      </div>
      <div class="course-content">
        <h3 class="course-title">${esc(c.title)}</h3>
        <p class="course-description">${esc(c.description || "")}</p>

        <div class="course-meta">
          <span class="course-method">${esc(c.nivel || c.level || "")}</span>
          <span class="course-price">${c.price != null
            ? (Number(c.price) > 0 ? `R$ ${Number(c.price).toFixed(2)}` : "Gratuito")
            : (c.cargaHoraria ? `${esc(c.cargaHoraria)}h` : "")}</span>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
          ${badgeHtml}
        </div>

        <a class="course-btn" href="${getDetailsUrl(c)}">Ver detalhes</a>
      </div>
    `;
    return el;
  }

  function renderCourses() {
    const wrap = state.els.container;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.filtered.length) {
      wrap.innerHTML = `<p style="text-align:center; padding:24px;">Nenhum curso encontrado.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filtered.forEach(c => frag.appendChild(renderCard(c)));
    wrap.appendChild(frag);
  }

  function applyFilters() {
    const f = getFilterValues();
    const list = state.allCourses.slice();

    state.filtered = list.filter(c => {
      const cat   = c.categoria || c.area || "";
      const niv   = c.nivel || c.level || "";
      const tipos = Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []);
      const okCat   = !f.categoria || normalize(cat) === normalize(f.categoria);
      const okNiv   = !f.nivel || normalize(niv) === normalize(f.nivel);
      const okTipos = !f.tipos.length || f.tipos.every(t => tipos.map(normalize).includes(normalize(t)));
      const okCarga = matchCargaHoraria(c, f.carga);
      return okCat && okNiv && okTipos && okCarga;
    });

    sortCourses(state.filtered, f.ordenar);
    renderCourses();
  }

  function clearAllFilters() {
    if (state.els.categoria) state.els.categoria.value = "";
    if (state.els.carga) state.els.carga.value = "";
    if (state.els.ordenar) state.els.ordenar.value = "recentes";
    if (state.els.tiposWrap) $$('.checkbox-group input[type="checkbox"]', state.els.tiposWrap).forEach(cb => cb.checked = false);
    if (state.els.nivelRadios && state.els.nivelRadios.length) state.els.nivelRadios[0].checked = true;
    applyFilters();
  }

  function mapElements() {
    state.els.container   = $(SEL.container);
    state.els.categoria   = $(SEL.categoria);
    state.els.tiposWrap   = $(SEL.tiposWrap);
    state.els.carga       = $(SEL.carga);
    state.els.nivelRadios = $$(SEL.nivelRadios);
    state.els.ordenar     = $(SEL.ordenar);
    state.els.clear       = $(SEL.clear);
    if (!state.els.container) warn("Container de cursos não encontrado:", SEL.container);
  }

  function bindEvents() {
    state.els.categoria?.addEventListener("change", applyFilters);
    state.els.carga?.addEventListener("change", applyFilters);
    state.els.ordenar?.addEventListener("change", applyFilters);
    state.els.tiposWrap?.addEventListener("change", applyFilters);
    (state.els.nivelRadios||[]).forEach(r => r.addEventListener("change", applyFilters));
    state.els.clear?.addEventListener("click", (e)=>{ e.preventDefault(); clearAllFilters(); });
  }

  function init() {
    state.allCourses = loadInitialCourses();
    mapElements();
    bindEvents();
    applyFilters();

    // Expor pequena API para detalhes-curso.html
    window.bibliotecaManager = {
      applyFilters,
      clearAllFilters,
      getCoursesData: () => state.allCourses.slice()
    };

    log("biblioteca.js pronto. Cursos:", state.allCourses.length);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
