/* Instituto Buriti – biblioteca.js */
(() => {
  "use strict";

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const debounce = (fn, ms = 250) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };
  const normalize = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

  // Seletor padrão de imagem fallback (crie ../images/default-course.png)
  const DEFAULT_THUMB = "../images/default-course.png";

  // Seletores do template
  const SEL = {
    container: "#coursesContainer, [data-courses-container], .courses-grid",
    categoria: "#categoria, [data-filter-categoria]",
    tiposGroup: ".checkbox-group, [data-filter-tipos]",
    carga: "#carga-horaria, [data-filter-carga]",
    nivelRadios: 'input[name="nivel"]',
    ordenar: "#ordenar, [data-filter-ordenar]",
    clear: "#clearFiltersBtn, [data-clear-filters]",
    authHeader: "#authHeader, [data-auth-header]",
    userFiltersWrap: "#userFilters, [data-user-filters]",
  };

  // Fonte de dados
  const loadInitialCourses = () => {
    if (Array.isArray(window.COURSES) && window.COURSES.length) return window.COURSES;
    const scriptJSON = document.getElementById("courses-json");
    if (scriptJSON) {
      try {
        const data = JSON.parse(scriptJSON.textContent || "[]");
        if (Array.isArray(data)) return data;
      } catch (_) {}
    }
    return []; // vazio por padrão; dados vêm do HTML
  };

  // Estado
  const state = {
    currentUser: null,
    userEnrollments: new Set(),
    allCourses: loadInitialCourses(),
    filtered: [],
    els: {},
  };

  // Auth externo (opcional)
  const hasAuth = () => typeof window.authManager === "object" && window.authManager !== null;

  // Init
  function init() {
    mapElements();
    checkAuthentication();
    loadUserEnrollments();
    bindEvents();
    applyFilters();
    updateAuthHeader();
  }

  function mapElements() {
    state.els.container = $(SEL.container);
    state.els.categoria = $(SEL.categoria);
    state.els.tiposGroup = $(SEL.tiposGroup);
    state.els.carga = $(SEL.carga);
    state.els.nivelRadios = $$(SEL.nivelRadios);
    state.els.ordenar = $(SEL.ordenar);
    state.els.clear = $(SEL.clear);
    state.els.authHeader = $(SEL.authHeader);
    state.els.userFiltersWrap = $(SEL.userFiltersWrap);
  }

  function checkAuthentication() {
    if (hasAuth() && window.authManager.isAuthenticated()) {
      state.currentUser = window.authManager.getUser();
      showUserFilters();
    } else {
      state.currentUser = null;
      hideUserFilters();
    }
  }

  function loadUserEnrollments() {
    state.userEnrollments = new Set();
    if (hasAuth() && state.currentUser) {
      if (typeof window.authManager.getEnrollments === "function") {
        try {
          const list = window.authManager.getEnrollments() || [];
          list.forEach((id) => state.userEnrollments.add(String(id)));
        } catch (_) {}
      }
    }
  }

  function bindEvents() {
    if (state.els.categoria) state.els.categoria.addEventListener("change", applyFilters);
    if (state.els.carga) state.els.carga.addEventListener("change", applyFilters);
    if (state.els.ordenar) state.els.ordenar.addEventListener("change", applyFilters);
    if (state.els.tiposGroup) state.els.tiposGroup.addEventListener("change", applyFilters);
    if (state.els.nivelRadios && state.els.nivelRadios.length) {
      state.els.nivelRadios.forEach(r => r.addEventListener("change", applyFilters));
    }
    if (state.els.clear) state.els.clear.addEventListener("click", (e) => { e.preventDefault(); clearAllFilters(); });
    document.addEventListener("auth:changed", () => { checkAuthentication(); loadUserEnrollments(); updateUI(); });
  }

  function getFilterValues() {
    const tipoSelecionados = [];
    if (state.els.tiposGroup) {
      $$('input[type="checkbox"]', state.els.tiposGroup).forEach(cb => { if (cb.checked) tipoSelecionados.push(cb.value); });
    }
    const nivelSel = (state.els.nivelRadios||[]).find(r=>r.checked);
    return {
      categoria: (state.els.categoria && state.els.categoria.value) || "",
      tipos: tipoSelecionados,     // ["gratuito","pago","certificado"]
      carga: (state.els.carga && state.els.carga.value) || "", // "curta"|"media"|"longa"|"" 
      nivel: (nivelSel && nivelSel.value) || "",               // ""|"iniciante"|"intermediario"|"avancado"
      ordenar: (state.els.ordenar && state.els.ordenar.value) || "recentes",
    };
  }

  // FILTRAGEM
  function applyFilters() {
    const { categoria, tipos, carga, nivel, ordenar } = getFilterValues();
    const list = state.allCourses.slice();

    state.filtered = list.filter((c) => {
      const matchCategoria = !categoria || normalize(c.categoria||c.area) === normalize(categoria) || String(c.categoria||c.area) === String(categoria);
      const matchNivel     = !nivel || normalize(c.nivel||c.level) === normalize(nivel) || String(c.nivel||c.level) === String(nivel);
      const matchTipos     = !tipos.length || tipos.every(t => (c.tipos||c.tags||[]).map(normalize).includes(normalize(t)) || [normalize(c.tipo||c.type)].includes(normalize(t)));
      const matchCarga     = matchCargaHoraria(c, carga);
      return matchCategoria && matchNivel && matchTipos && matchCarga;
    });

    sortCourses(state.filtered, ordenar);
    updateUI();
  }

  function updateUI() {
    renderCourses();
    updateCourseButtons();
  }

  // RENDER
  function renderCourses() {
    const wrap = state.els.container;
    if (!wrap) return;

    wrap.innerHTML = "";
    const list = state.filtered.length ? state.filtered : [];

    if (!list.length) {
      wrap.innerHTML = `<div class="ib-empty"><div class="ib-empty__icon" aria-hidden="true">📚</div><p class="ib-empty__text">Nenhum curso encontrado.</p></div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((course) => frag.appendChild(renderCourseCard(course)));
    wrap.appendChild(frag);
  }

  function renderCourseCard(c) {
    const card = document.createElement("div");
    card.className = "ib-card";

    const thumbSrc = c.thumbnail && String(c.thumbnail).trim() ? c.thumbnail : DEFAULT_THUMB;
    const thumb = `<img class="ib-card__thumb" src="${thumbSrc}" alt="${escapeHtml(c.title)}" loading="lazy">`;

    card.innerHTML = `
      <div class="ib-card__media">${thumb}</div>
      <div class="ib-card__body">
        <h3 class="ib-card__title">${escapeHtml(c.title)}</h3>
        <p class="ib-card__meta">
          <span class="ib-badge">${c.categoria || c.area || ""}</span>
          <span class="ib-badge">${c.nivel || c.level || ""}</span>
          <span class="ib-badge">${(Array.isArray(c.tipos) ? c.tipos.join(" / ") : (c.tipo || c.type || ""))}</span>
        </p>
        <p class="ib-card__desc">${escapeHtml(c.description || "")}</p>
      </div>
      <div class="ib-card__actions">
        ${renderPrimaryButton(c)}
        <button class="ib-btn ib-btn--ghost" data-action="details" data-id="${c.id}">Ver detalhes</button>
      </div>`;

    card.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-action]");
      if (!btn) return;
      handleCourseAction(btn.getAttribute("data-action"), btn.getAttribute("data-id"));
    });

    return card;
  }

  function renderPrimaryButton(c) {
    return isEnrolled(c.id)
      ? `<button class="ib-btn ib-btn--primary" data-action="access" data-id="${c.id}">Acessar curso</button>`
      : `<button class="ib-btn ib-btn--primary" data-action="enroll" data-id="${c.id}">Inscrever-se</button>`;
  }

  function updateCourseButtons() {
    if (!state.els.container) return;
    $$('[data-action="enroll"], [data-action="access"]', state.els.container).forEach((btn) => {
      const id = btn.getAttribute("data-id");
      if (isEnrolled(id)) {
        btn.textContent = "Acessar curso";
        btn.setAttribute("data-action", "access");
      } else {
        btn.textContent = "Inscrever-se";
        btn.setAttribute("data-action", "enroll");
      }
    });
  }

  // Ações
  function handleCourseAction(action, courseId) {
    const course = state.allCourses.find((c) => String(c.id) === String(courseId));
    if (!course) return;

    switch (action) {
      case "details": navigateToCourseDetails(course); break;
      case "enroll":  enrollCourse(course); break;
      case "access":  accessCourse(course); break;
    }
  }

  function navigateToCourseDetails(course) {
    const base = document.body.getAttribute("data-course-base") || "/curso/";
    const slug = course.slug || course.id;
    window.location.href = `${base}${encodeURIComponent(slug)}`;
  }

  function enrollCourse(course) {
    if (!hasAuth() || !window.authManager.isAuthenticated()) {
      document.dispatchEvent(new CustomEvent("auth:request-login", { detail: { reason: "enroll" } }));
      return;
    }
    if (typeof window.authManager.enroll === "function") {
      try { window.authManager.enroll(course.id); state.userEnrollments.add(String(course.id)); } catch (_) {}
    } else {
      state.userEnrollments.add(String(course.id));
    }
    updateCourseButtons();
  }

  function accessCourse(course) {
    const base = document.body.getAttribute("data-access-base") || "/aluno/curso/";
    const slug = course.slug || course.id;
    window.location.href = `${base}${encodeURIComponent(slug)}`;
  }

  function isEnrolled(courseId) {
    if (hasAuth() && typeof window.authManager.isEnrolled === "function") {
      try { return !!window.authManager.isEnrolled(courseId); } catch (_) {}
    }
    return state.userEnrollments.has(String(courseId));
  }

  // Filtros auxiliares
  function clearAllFilters() {
    if (state.els.categoria) state.els.categoria.value = "";
    if (state.els.carga) state.els.carga.value = "";
    if (state.els.ordenar) state.els.ordenar.value = "recentes";
    if (state.els.tiposGroup) $$('input[type="checkbox"]', state.els.tiposGroup).forEach(cb => cb.checked = false);
    if (state.els.nivelRadios && state.els.nivelRadios.length) state.els.nivelRadios[0].checked = true; // “Todos”
    applyFilters();
  }

  function showUserFilters() { if (state.els.userFiltersWrap) state.els.userFiltersWrap.hidden = false; }
  function hideUserFilters() { if (state.els.userFiltersWrap) state.els.userFiltersWrap.hidden = true; }

  function updateAuthHeader() {
    const el = state.els.authHeader; if (!el) return;
    const logged = !!state.currentUser;
    el.classList.toggle("is-auth", logged);
    const name = logged && (state.currentUser.name || state.currentUser.firstName || state.currentUser.email);
    el.querySelectorAll("[data-user-name]").forEach((n) => n.textContent = name || "");
  }

  // Util
  function escapeHtml(str) {
    return String(str || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }

  function matchCargaHoraria(c, filtro) {
    if (!filtro) return true;
    // aceita c.cargaHoraria (número) ou c.duracao tipo "12h"/"8h30"
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

  // Exposição controlada (compatibilidade)
  const api = { init, applyFilters, clearAllFilters, navigateToCourseDetails };
  window.bibliotecaManager = api;

  // Bootstrap
  document.addEventListener("DOMContentLoaded", init);
})();
