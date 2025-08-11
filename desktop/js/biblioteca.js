/* Instituto Buriti — biblioteca.js (SUBSTITUIÇÃO TOTAL)
 * Build: cursos-2025-08-11-ib-v4
 *
 * Correções principais:
 * - Normaliza TODAS as imagens para /desktop/images (com URL-encode quando há espaços)
 * - Fallback robusto de thumbnail + onerror
 * - Render usa as mesmas classes do cursos.css (.course-card, .course-image, .course-btn, etc.)
 * - "Ver detalhes" restabelecido e sempre aponta para /pages/detalhes-curso.html?slug=...
 * - Seletores compatíveis (#coursesContainer, .courses-grid, [data-courses-container])
 * - Logs de diagnóstico (pode desativar: DEBUG=false)
 */

(() => {
  "use strict";

  const DEBUG = true;
  const log  = (...a) => DEBUG && console.log("[IB:cursos]", ...a);
  const warn = (...a) => DEBUG && console.warn("[IB:cursos]", ...a);

  // Base de assets do deploy atual
  const IMAGES_BASE = "/desktop/images";
  const DEFAULT_IMAGE = `${IMAGES_BASE}/ChatGPT%20Image%206%20de%20ago.%20de%202025,%2023_37_06.png`;
  // Se você criar um alias sem espaços (recomendado), troque a linha acima por:
  // const DEFAULT_IMAGE = `${IMAGES_BASE}/default-course.png`;

  // Seletores tolerantes
  const SEL = {
    container: "#coursesContainer, .courses-grid, [data-courses-container]",
    categoria: "#categoria, [data-filter-categoria]",
    tiposWrap: ".checkbox-group, [data-filter-tipos]",
    carga:     "#carga-horaria, [data-filter-carga]",
    nivel:     'input[name="nivel"]',
    ordenar:   "#ordenar, [data-filter-ordenar]",
    clear:     "#clearFiltersBtn, [data-clear-filters]",
  };

  const state = {
    all: [],
    filtered: [],
    els: {}
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    mapEls();
    state.all = loadInitialCourses().map(normalizeCourse);
    bindEvents();
    applyFilters();
    log("Pronto. Cursos carregados:", state.all.length);
    // helper debug manual
    window.bibliotecaManager = { applyFilters, clearAllFilters };
  }

  function mapEls() {
    state.els.container = q(SEL.container);
    state.els.categoria = q(SEL.categoria);
    state.els.tiposWrap = q(SEL.tiposWrap);
    state.els.carga     = q(SEL.carga);
    state.els.niveis    = qq(SEL.nivel);
    state.els.ordenar   = q(SEL.ordenar);
    state.els.clear     = q(SEL.clear);
    if (!state.els.container) warn("Container não encontrado:", SEL.container);
  }

  function bindEvents() {
    state.els.categoria?.addEventListener("change", applyFilters);
    state.els.carga?.addEventListener("change", applyFilters);
    state.els.ordenar?.addEventListener("change", applyFilters);
    state.els.tiposWrap?.addEventListener("change", applyFilters);
    (state.els.niveis || []).forEach(r => r.addEventListener("change", applyFilters));
    state.els.clear?.addEventListener("click", e => { e.preventDefault(); clearAllFilters(); });
  }

  /* =======================
     CARREGAMENTO DE DADOS
     ======================= */
  function loadInitialCourses() {
    // 1) window.COURSES injetado no HTML
    try {
      if (Array.isArray(window.COURSES) && window.COURSES.length) {
        log("Fonte: window.COURSES", window.COURSES.length);
        return window.COURSES;
      }
    } catch(e){ warn("Erro lendo window.COURSES", e); }

    // 2) <script id="courses-json" type="application/json">
    try {
      const tag = document.getElementById("courses-json");
      if (tag?.textContent) {
        const data = JSON.parse(tag.textContent);
        if (Array.isArray(data) && data.length) {
          log("Fonte: #courses-json", data.length);
          return data;
        }
      }
    } catch(e){ warn("Erro parseando #courses-json", e); }

    // 3) Fallback de amostra
    const samples = [
      { id:"ia-fundamentos", title:"Fundamentos de IA", categoria:"tecnologia", nivel:"iniciante", tipos:["pago","certificado"], cargaHoraria:20, createdAt:"2025-07-20", acessos:124, description:"Conceitos básicos de IA e ML com exercícios práticos.", thumbnail:"/desktop/images/cursos/ia-fundamentos.jpg", slug:"ia-fundamentos" },
      { id:"python-dados", title:"Python para Dados", categoria:"tecnologia", nivel:"intermediario", tipos:["pago"], cargaHoraria:28, createdAt:"2025-07-28", acessos:96, description:"Do pandas ao gráfico: análise de dados aplicada.", thumbnail:DEFAULT_IMAGE, slug:"python-para-dados" },
      { id:"gestao-projetos", title:"Gestão de Projetos Ágeis", categoria:"gestao", nivel:"intermediario", tipos:["pago","certificado"], cargaHoraria:18, createdAt:"2025-08-02", acessos:210, description:"Scrum e Kanban na prática com estudos de caso.", thumbnail:"/desktop/images/cursos/gestao-agil.jpg", slug:"gestao-de-projetos-ageis" },
      { id:"financas-basicas", title:"Finanças Pessoais Essenciais", categoria:"gestao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:8, createdAt:"2025-07-15", acessos:330, description:"Controle de gastos, reserva de emergência e metas.", thumbnail:DEFAULT_IMAGE, slug:"financas-pessoais-essenciais" },
      { id:"producao-cultural", title:"Produção Cultural", categoria:"cultura", nivel:"intermediario", tipos:["pago"], cargaHoraria:16, createdAt:"2025-07-10", acessos:78, description:"Do edital à execução: projetos culturais sustentáveis.", thumbnail:"/desktop/images/cursos/producao-cultural.jpg", slug:"producao-cultural" },
      { id:"educacao-inclusiva", title:"Educação Inclusiva na Prática", categoria:"educacao", nivel:"avancado", tipos:["pago","certificado"], cargaHoraria:32, createdAt:"2025-06-30", acessos:142, description:"Estratégias e recursos para acessibilidade efetiva.", thumbnail:DEFAULT_IMAGE, slug:"educacao-inclusiva" },
      { id:"metodologias-ativas", title:"Metodologias Ativas", categoria:"educacao", nivel:"iniciante", tipos:["gratuito"], cargaHoraria:6, createdAt:"2025-08-05", acessos:52, description:"PBL, sala invertida e avaliação formativa.", thumbnail:"/desktop/images/cursos/metodologias-ativas.jpg", slug:"metodologias-ativas" },
      { id:"empreendedorismo-social", title:"Empreendedorismo Social", categoria:"outros", nivel:"intermediario", tipos:["pago"], cargaHoraria:14, createdAt:"2025-07-25", acessos:67, description:"Modelos de negócio de impacto e medição de resultados.", thumbnail:DEFAULT_IMAGE, slug:"empreendedorismo-social" }
    ];
    log("Fonte: SAMPLES", samples.length);
    return samples;
  }

  function normalizeCourse(c) {
    const slug = (c.slug || c.id || "").toString().trim();
    return {
      ...c,
      slug,
      title: c.title || "",
      categoria: c.categoria || c.area || "",
      nivel: c.nivel || c.level || "",
      tipos: Array.isArray(c.tipos) ? c.tipos : (c.tipo ? [c.tipo] : []),
      thumbnail: resolveThumb(c.thumbnail)
    };
  }

  /* =======================
     FILTROS E ORDENAÇÃO
     ======================= */
  function getFilters() {
    const tiposSel = [];
    if (state.els.tiposWrap) {
      qq('input[type="checkbox"]', state.els.tiposWrap).forEach(cb => cb.checked && tiposSel.push(cb.value));
    }
    const nivel = (state.els.niveis || []).find(r => r.checked)?.value || "";
    return {
      categoria: state.els.categoria?.value || "",
      tipos: tiposSel,
      carga: state.els.carga?.value || "",
      nivel,
      ordenar: state.els.ordenar?.value || "recentes",
    };
  }

  function applyFilters() {
    const f = getFilters();
    log("Aplicando filtros:", f);

    let arr = state.all.slice().filter(c => {
      const okCat   = !f.categoria || eq(f.categoria, c.categoria);
      const okNiv   = !f.nivel     || eq(f.nivel,     c.nivel);
      const okTipos = !f.tipos.length || f.tipos.every(t => c.tipos.map(nl).includes(nl(t)));
      const okCarga = matchCarga(c.cargaHoraria || c.duracao, f.carga);
      return okCat && okNiv && okTipos && okCarga;
    });

    switch (f.ordenar) {
      case "acessados":  arr.sort((a,b)=>(b.acessos||0)-(a.acessos||0)); break;
      case "alfabetico": arr.sort((a,b)=>String(a.title).localeCompare(String(b.title))); break;
      case "recentes":
      default:           arr.sort((a,b)=>new Date(b.createdAt||b.data||0)-new Date(a.createdAt||a.data||0));
    }

    state.filtered = arr;
    render();
    log("Cursos visíveis:", state.filtered.length);
  }

  function matchCarga(v, filtro) {
    if (!filtro) return true;
    const horas = parseFloat(String(v||"").replace(/[^0-9.,]/g,"").replace(",", ".")) || 0;
    if (filtro === "curta")  return horas > 0  && horas < 10;
    if (filtro === "media")  return horas >=10 && horas <=30;
    if (filtro === "longa")  return horas > 30;
    return true;
  }

  function clearAllFilters() {
    if (state.els.categoria) state.els.categoria.value = "";
    if (state.els.carga)     state.els.carga.value = "";
    if (state.els.ordenar)   state.els.ordenar.value = "recentes";
    if (state.els.tiposWrap) qq('input[type="checkbox"]', state.els.tiposWrap).forEach(cb => cb.checked=false);
    if (state.els.niveis?.length) state.els.niveis[0].checked = true;
    applyFilters();
  }

  /* =======================
     RENDER (markup compatível com cursos.css)
     ======================= */
  function render() {
    const wrap = state.els.container;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.filtered.length) {
      wrap.innerHTML = `<div class="ib-empty"><p>Nenhum curso encontrado com os filtros aplicados.</p></div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filtered.forEach(c => frag.appendChild(card(c)));
    wrap.appendChild(frag);
  }

  function card(c) {
    const el = document.createElement("article");
    el.className = "course-card";

    const badge = c.tipos?.includes("gratuito") ? "GRATUITO" : "PAGO";
    const detalhesUrl = getDetailsUrl(c);

    el.innerHTML = `
      <div class="course-image">
        <img class="course-img"
             src="${c.thumbnail}"
             alt="${esc(c.title)}"
             loading="lazy"
             onerror="if(!this.dataset.fbk){this.dataset.fbk=1; this.src='${DEFAULT_IMAGE}';}"/>
        <span class="course-badge ${badge === "GRATUITO" ? "" : "popular"}">${badge}</span>
      </div>

      <div class="course-content">
        <h3 class="course-title">${esc(c.title)}</h3>
        <p class="course-description">${esc(c.description||"")}</p>

        <div class="course-meta">
          <span class="course-method">${esc(c.categoria)}</span>
          <span>${esc(c.nivel)}</span>
        </div>

        <a class="course-btn" href="${detalhesUrl}">Ver detalhes</a>
      </div>
    `;
    return el;
  }

  function getDetailsUrl(c) {
    const slug = c.slug || c.id || "";
    const url = `/pages/detalhes-curso.html?slug=${encodeURIComponent(slug)}`;
    DEBUG && log("URL detalhes:", url);
    return url;
  }

  /* =======================
     Auxiliares
     ======================= */
  function resolveThumb(p) {
    if (!p) return DEFAULT_IMAGE;

    let u = String(p).trim();

    // Absoluto http(s)
    if (/^https?:\/\//i.test(u)) return u;

    // Já começa com /desktop/...
    if (u.startsWith("/desktop/")) return u;

    // Converte "../images/..." ou "images/..." -> "/desktop/images/..."
    u = u.replace(/^(\.\.\/)+images\//i, "/desktop/images/")
         .replace(/^images\//i, "/desktop/images/");

    // Se ainda não começar por "/", assume que é um nome de arquivo em /desktop/images
    if (!u.startsWith("/")) u = `/desktop/images/${u}`;

    // Faz URL-encode de espaços e vírgulas (arquivos com nomes longos)
    u = u.replace(/ /g, "%20").replace(/,/g, "%2C");

    return u;
  }

  const q  = (sel, r=document) => r.querySelector(sel);
  const qq = (sel, r=document) => Array.from(r.querySelectorAll(sel));
  const nl = s => String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
  const eq = (a,b) => nl(a) === nl(b);
  const esc = s => String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
})();
