// VERSÃO FINAL - Integrada com o novo design
const bibliotecaManager = {
    // ... (todo o estado da aplicação e outras funções permanecem iguais)
    currentUser: null,
    userEnrollments: [],
    allCourses: [
        { id: 'ia-fundamentos', title: 'Fundamentos da Inteligência Artificial', area: 'tecnologia', nivel: 'basico', tipo: 'gratuito', price: 0, description: 'Domine os conceitos fundamentais de IA e machine learning com aplicações práticas.' },
        { id: 'gestao-cultural', title: 'Gestão de Projetos Culturais', area: 'artes', nivel: 'intermediario', tipo: 'pago', price: 350, description: 'Aprenda a elaborar, executar e gerenciar projetos culturais de sucesso.' },
        { id: 'educacao-inclusiva', title: 'Educação Especial na Perspectiva Inclusiva', area: 'educacao', nivel: 'avancado', tipo: 'gratuito', price: 0, description: 'Explore metodologias inovadoras para uma educação mais acessível e inclusiva.' }
    ],

    init() {
        this.checkAuthentication();
        this.loadUserEnrollments();
        this.renderCourses(); 
        this.setupEventListeners();
        this.updateUI();
        console.log('✅ Biblioteca (Versão Final) inicializada com sucesso');
    },

    // ... (todas as outras funções como checkAuthentication, setupEventListeners, etc., permanecem as mesmas)

    renderCourses() {
        console.log('🎨 Renderizando cursos com o novo design...');
        const coursesContainer = document.getElementById('coursesContainer');
        if (!coursesContainer) return;

        coursesContainer.innerHTML = ''; 

        // Caminho para a imagem placeholder
        const placeholderImage = '../images/ChatGPT Image 6 de ago. de 2025, 23_37_06.jpg';

        this.allCourses.forEach(course => {
            const priceDisplay = course.tipo === 'gratuito' ? 'Gratuito' : `R$ ${course.price.toFixed(2).replace('.', ',')}`;
            const priceClass = course.tipo === 'gratuito' ? 'free' : '';
            const courseImage = course.imageUrl || placeholderImage;

            const courseHTML = `
                <div class="course-card" data-course-id="${course.id}" data-area="${course.area}" data-nivel="${course.nivel}" data-tipo="${course.tipo}">
                    <div class="course-image" style="background-image: url('${courseImage}')">
                        <h3 class="course-title">${course.title}</h3>
                    </div>
                    <div class="course-content">
                        <p class="course-description">${course.description || 'Descrição do curso não disponível.'}</p>
                        <div class="course-meta">
                            <span class="course-price ${priceClass}">${priceDisplay}</span>
                             <div class="course-action">
                                <button class="course-action-btn">
                                    <span class="btn-text">Ver Detalhes</span> <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            coursesContainer.insertAdjacentHTML('beforeend', courseHTML);
        });

        this.updateCourseButtons(); // Atualiza os botões após a renderização
    },
    
    // ... (o restante do seu arquivo JS)
};

document.addEventListener('DOMContentLoaded', () => bibliotecaManager.init());