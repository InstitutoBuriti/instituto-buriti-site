/* Instituto Buriti — /js/biblioteca.js  (SUBSTITUIÇÃO TOTAL)
 * Build: 2025-08-12-2
 * Notas: JS puro (NÃO usar <script> no arquivo .js)
 */
(() => {
  "use strict";

  const IMG_FALLBACK_PRIMARY = "/images/default-course.png";
  const IMG_FALLBACK_SECOND  = "/images/ChatGPT%20Image%206%20de%20ago.%20de%202025%2C%2023_37_06.png";

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const norm = s => (s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
  const escapeHtml = s => String(s||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#39;");

  const SEL = {
    cont:   "#coursesContainer, .courses-grid, [data-courses-container]",
    cat:    "#categoria,[data-filter-categoria]",
    tipos:  ".checkbox-group,[data-filter-tipos]",
    carga:  "#carga-horaria,[data-filter-carga]",
    nivel:  'input[name="nivel"]',
    ord:    "#ordenar,[data-filter-ordenar]",
  };

  const state = { all: [], filt: [], el:{} };

  document.addEventListener("DOMContentLoaded", init);

  function init(){
    state.all = loadData();
    mapEls();
    bind();
    apply();

    // expõe lista para detalhes-curso.html
    window.bibliotecaManager = {
      getCoursesData: () => state.all.slice()
    };
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
    state.el.cat?.addEventListener("change", apply);
    state.el.carga?.addEventListener("change", apply);
    state.el.ord?.addEventListener("change", apply);
    state.el.tipos?.addEventListener("change", apply);
    state.el.nivel.forEach(r => r.addEventListener("change", apply));
  }

  function loadData(){
    if (Array.isArray(window.COURSES) && window.COURSES.length) return window.COURSES;

    const s = document.getElementById("courses-json");
    if (s) {
      try {
        const data = JSON.parse(s.textContent||"[]");
        if (Array.isArray(data) && data.length) return data;
      } catch {}
    }

    // fallback mínimo (mantém a página viva mesmo sem fonte de dados)
    return [];
  }

  function filters(){
    const tipos=[];
    if (state.el.tipos) $$('.checkbox-group input[type="checkbox"]', state.el.tipos).forEach(cb=>cb.checked&&tipos.push(cb.value));
    return {
      cat: state.el.cat?.value||"",
      tipos,
      carga: state.el.carga?.value||"",
      nivel: state.el.nivel.find(r=>r.checked)?.value||"",
      ord: state.el.ord?.value||"recentes"
    };
  }

  function matchCarga(h,f){
    const n = parseFloat(String(h||"").replace(/[^0-9.,]/g,"").replace(",", "."))||0;
    if (!f) return true;
    if (f==="curta") return n>0 && n<10;
    if (f==="media") return n>=10 && n<=30;
    if (f==="longa") return n>30;
    return true;
  }

  function apply(){
    const f = filters();
    const list = state.all.slice();

    state.filt = list.filter(c=>{
      const cat = c.categoria||c.area||"";
      const niv = c.nivel||c.level||"";
      const tipos = Array.isArray(c.tipos)?c.tipos:(c.tipo?[c.tipo]:[]);
      const okCat   = !f.cat   || norm(cat) === norm(f.cat);
      const okNiv   = !f.nivel || norm(niv) === norm(f.nivel);
      const okTipos = !f.tipos.length || f.tipos.every(t => tipos.map(norm).includes(norm(t)));
      const okCarga = matchCarga(c.cargaHoraria||c.duracao, f.carga);
      return okCat && okNiv && okTipos && okCarga;
    });

    sort(state.filt, f.ord);
    render();
  }

  function sort(arr, by){
    if (by==="acessados")  return arr.sort((a,b)=>(b.acessos||0)-(a.acessos||0));
    if (by==="alfabetico") return arr.sort((a,b)=>String(a.title||"").localeCompare(String(b.title||"")));
    return arr.sort((a,b)=> new Date(b.createdAt||b.data||0) - new Date(a.createdAt||a.data||0));
  }

  function urlDetalhes(c){
    const slug = c.slug || c.id;
    return `/pages/detalhes-curso.html?slug=${encodeURIComponent(slug)}`;
  }

  function render(){
    const wrap = state.el.cont;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.filt.length){
      wrap.innerHTML = `<div class="ib-empty"><div class="ib-empty__icon">📚</div><p>Nenhum curso encontrado.</p></div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    state.filt.forEach(c => frag.appendChild(card(c)));
    wrap.appendChild(frag);
  }

  function card(c){
    const el = document.createElement("article");
    el.className = "course-card";

    // Se não houver thumbnail válida, já começa com fallback primário
    const initialSrc = (c.thumbnail && String(c.thumbnail).trim()) ? c.thumbnail : IMG_FALLBACK_PRIMARY;

    el.innerHTML = `
      <div class="course-image">
        <img
          src="${initialSrc}"
          alt="${escapeHtml(c.title)}"
          onerror="this.onerror=null; this.src='${IMG_FALLBACK_SECOND}';"
        >
        <span class="course-badge ${badgeKind(c)}">${badgeText(c)}</span>
      </div>

      <div class="course-content">
        <h3 class="course-title">${escapeHtml(c.title)}</h3>
        <p class="course-description">${escapeHtml(c.description||"")}</p>

        <div class="course-meta">
          <span class="course-method">${String(c.nivel||"").toUpperCase()}</span>
          <span class="course-price">${priceText(c)}</span>
        </div>

        <a class="course-btn" href="${urlDetalhes(c)}">Ver detalhes</a>
      </div>
    `;
    return el;
  }

  function badgeKind(c){
    const tipos = Array.isArray(c.tipos)?c.tipos:(c.tipo?[c.tipo] : []);
    return tipos.includes("gratuito") ? "popular" : "";
  }
  function badgeText(c){
    const tipos = Array.isArray(c.tipos)?c.tipos:(c.tipo?[c.tipo] : []);
    if (tipos.includes("certificado")) return "CERTIFICADO";
    if (tipos.includes("gratuito"))    return "GRATUITO";
    if (tipos.includes("pago"))        return "PAGO";
    return "TECN";
  }
  function priceText(c){
    if (Array.isArray(c.tipos) && c.tipos.includes("gratuito")) return "Gratuito";
    if (c.price!=null && !Number.isNaN(Number(c.price))) return "R$ "+Number(c.price).toFixed(2);
    return "";
  }
})();
