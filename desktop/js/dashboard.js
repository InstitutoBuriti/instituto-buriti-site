/**
 * /js/dashboard.js - Lógica Principal do Dashboard do Aluno
 * - Controla a interface (navegação, menus).
 * - Busca dados dinâmicos do Supabase após autenticação.
 * - Renderiza os componentes (cards de cursos, stats) na tela.
 */

(function() {
  "use strict";

  const log = (enabled => (...args) => enabled && console.log("[Dashboard]", ...args))(true);
  const error = (...args) => console.error("[Dashboard]", ...args);
  
  // --- LÓGICA DE DADOS (NOVA) ---

  // Função principal que busca todos os dados para o dashboard
  async function fetchDashboardData(user) {
      if (!user || !user.id) {
          error("ID do usuário não encontrado. Não é possível buscar dados.");
          renderError("Não foi possível carregar os dados do usuário.");
          return;
      }

      log(`Buscando dados para o usuário ID: ${user.id}`);
      
      // Simulação de chamadas à API do Supabase
      // Em um projeto real, estas seriam chamadas fetch para seus endpoints.
      const statsData = await mockFetchStats(user.id);
      const coursesData = await mockFetchCourses(user.id);

      log("Dados recebidos:", { statsData, coursesData });

      // Renderiza os componentes na tela com os dados recebidos
      renderStats(statsData);
      renderCourses(coursesData);
      
      // Aqui seria o local para carregar outras seções, como atividades
      renderAssignmentsPlaceholder();
  }
  
  // Simulação de busca de estatísticas
  async function mockFetchStats(userId) {
      // Apenas dados de exemplo. Substituir pela chamada real ao Supabase.
      return new Promise(resolve => {
          setTimeout(() => {
              resolve({
                  activeCourses: 2,
                  averageGrade: 8.3,
                  hoursStudied: 24,
                  achievements: 3
              });
          }, 500);
      });
  }
  
  // Simulação de busca de cursos
  async function mockFetchCourses(userId) {
      // Apenas dados de exemplo. Substituir pela chamada real ao Supabase.
      return new Promise(resolve => {
          setTimeout(() => {
              resolve([
                  { id: 1, title: "Desenvolvimento Web para Iniciantes", instructor: "Prof. Carlos Mendes", progress: 65, imageUrl: "../images/desenvolvimento-web.jpg" },
                  { id: 2, title: "Gestão de Projetos Culturais", instructor: "Prof. Maria Santos", progress: 40, imageUrl: "../images/web-size-Gestão-de-Mudanças-e-Gestão-de-Projetos-1-1.png" }
              ]);
          }, 800);
      });
  }

  // --- LÓGICA DE RENDERIZAÇÃO (NOVA) ---

  function renderStats(stats) {
      const container = document.getElementById('stats-grid-container');
      if (!container || !stats) return;

      container.innerHTML = `
          <div class="stat-card" role="status">
              <div class="stat-icon"><i class="fas fa-book" aria-hidden="true"></i></div>
              <div class="stat-info"><h3>${stats.activeCourses}</h3><p>Cursos Ativos</p></div>
          </div>
          <div class="stat-card" role="status">
              <div class="stat-icon"><i class="fas fa-trophy" aria-hidden="true"></i></div>
              <div class="stat-info"><h3>${stats.averageGrade}</h3><p>Média Geral</p></div>
          </div>
          <div class="stat-card" role="status">
              <div class="stat-icon"><i class="fas fa-clock" aria-hidden="true"></i></div>
              <div class="stat-info"><h3>${stats.hoursStudied}h</h3><p>Horas Estudadas</p></div>
          </div>
          <div class="stat-card" role="status">
              <div class="stat-icon"><i class="fas fa-medal" aria-hidden="true"></i></div>
              <div class="stat-info"><h3>${stats.achievements}</h3><p>Conquistas</p></div>
          </div>
      `;
  }
  
  function renderCourses(courses) {
      const overviewContainer = document.querySelector('#overview #dashboard-grid-container');
      const coursesContainer = document.querySelector('#courses #courses-grid-container');
      if (!overviewContainer || !coursesContainer || !courses) return;

      // Limpa os placeholders
      overviewContainer.innerHTML = '';
      coursesContainer.innerHTML = '';

      courses.forEach(course => {
          const courseCardHtml = `
              <div class="course-card">
                  <div class="course-header">
                      <img src="${course.imageUrl}" alt="${course.title}" class="course-image" loading="lazy"/>
                      <span class="course-badge active">Ativo</span>
                  </div>
                  <div class="course-content">
                      <h3>${course.title}</h3>
                      <p>${course.instructor}</p>
                      <div class="course-progress">
                          <div class="progress-info"><span>Progresso: ${course.progress}%</span></div>
                          <div class="progress-bar"><div class="progress-fill" style="width: ${course.progress}%"></div></div>
                      </div>
                  </div>
                  <div class="course-actions">
                      <a href="detalhes-curso.html?id=${course.id}" class="btn-primary">Continuar Curso</a>
                  </div>
              </div>`;
          
          // Adiciona o card na seção de visão geral e na de cursos
          if (overviewContainer.children.length < 2) { // Limita a 2 na visão geral
               const overviewCard = document.createElement('div');
               overviewCard.className = 'dashboard-card';
               overviewCard.innerHTML = `
                  <div class="card-header"><h3><i class="fas fa-book" aria-hidden="true"></i> Cursos em Andamento</h3></div>
                  <div class="card-content">
                      <div class="course-item">
                        <div class="course-info">
                          <h4>${course.title}</h4>
                          <p>${course.instructor}</p>
                          <div class="progress-bar"><div class="progress-fill" style="width: ${course.progress}%"></div></div>
                          <span class="progress-text">${course.progress}% concluído</span>
                        </div>
                        <a href="detalhes-curso.html?id=${course.id}" class="btn-primary">Continuar</a>
                      </div>
                  </div>`;
              overviewContainer.appendChild(overviewCard);
          }
          coursesContainer.innerHTML += courseCardHtml;
      });
  }

  function renderAssignmentsPlaceholder() {
      const container = document.getElementById('assignments-container');
      if (!container) return;
      container.innerHTML = `
          <div class="empty-state">
              <p>Para ver e enviar atividades, entre em um de seus cursos.</p>
              <p>É dentro de cada curso que você encontrará os locais para upload de arquivos.</p>
          </div>
      `;
  }

  function renderError(message) {
      const container = document.getElementById('main-content');
      if (container) {
          container.innerHTML = `<div class="error-state"><h2>Oops!</h2><p>${message}</p></div>`;
      }
  }

  // --- LÓGICA DE UI (EXISTENTE) ---

  function initSectionRouter() {
      const links = document.querySelectorAll('.sidebar-nav .nav-link');
      links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
              link.addEventListener('click', (e) => {
                  e.preventDefault();
                  document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
                  document.querySelector(href)?.classList.add('active');
                  
                  links.forEach(a => a.classList.remove('active'));
                  link.classList.add('active');
              });
          }
      });
  }

  function initSidebarToggle() {
      const sidebar = document.getElementById('sidebar');
      const toggle = document.getElementById('sidebarToggle');
      if (sidebar && toggle) {
          toggle.addEventListener('click', () => {
              sidebar.classList.toggle('collapsed');
              const isCollapsed = sidebar.classList.contains('collapsed');
              toggle.setAttribute('aria-expanded', String(!isCollapsed));
          });
      }
  }

  // --- INICIALIZAÇÃO ---
  
  document.addEventListener('DOMContentLoaded', () => {
      log('DOM carregado. Inicializando UI do dashboard.');
      initSectionRouter();
      initSidebarToggle();
      
      // Ouve o evento do auth.js para saber quando começar a buscar dados
      document.addEventListener('auth:ready', (event) => {
          log('Evento "auth:ready" recebido.', event.detail);
          if (event.detail.success) {
              fetchDashboardData(event.detail.user);
          } else {
              renderError("Falha na autenticação. Não foi possível carregar os dados.");
          }
      });
  });

})();