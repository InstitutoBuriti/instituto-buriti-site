// Cursos Filters JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
});

function initializeFilters() {
    const categoriaSelect = document.getElementById('categoria');
    const cargaHorariaSelect = document.getElementById('carga-horaria');
    const ordenarSelect = document.getElementById('ordenar');
    const tipoCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const nivelRadios = document.querySelectorAll('.radio-group input[type="radio"]');
    
    // Add event listeners
    categoriaSelect.addEventListener('change', applyFilters);
    cargaHorariaSelect.addEventListener('change', applyFilters);
    ordenarSelect.addEventListener('change', applyFilters);
    
    tipoCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    nivelRadios.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });
    
    // Initialize with default "Todos" selected for nivel
    document.querySelector('input[name="nivel"][value=""]').checked = true;
}

function applyFilters() {
    const filters = getFilterValues();
    const courses = document.querySelectorAll('.course-card');
    
    // Filter courses
    courses.forEach(course => {
        const shouldShow = matchesFilters(course, filters);
        course.style.display = shouldShow ? 'block' : 'none';
        
        if (shouldShow) {
            course.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });
    
    // Apply sorting
    if (filters.ordenar) {
        sortCourses(filters.ordenar);
    }
    
    // Update results count
    updateResultsCount();
}

function getFilterValues() {
    return {
        categoria: document.getElementById('categoria').value,
        cargaHoraria: document.getElementById('carga-horaria').value,
        ordenar: document.getElementById('ordenar').value,
        tipo: Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value),
        nivel: document.querySelector('input[name="nivel"]:checked')?.value || ''
    };
}

function matchesFilters(courseElement, filters) {
    // Get course data (in a real app, this would come from data attributes or API)
    const courseTitle = courseElement.querySelector('.course-title').textContent;
    const coursePrice = courseElement.querySelector('.course-price').textContent;
    
    // Simple filtering logic (can be expanded)
    let matches = true;
    
    // Category filter
    if (filters.categoria) {
        const courseCategory = getCourseCategory(courseTitle);
        matches = matches && (courseCategory === filters.categoria);
    }
    
    // Type filter (gratuito/pago)
    if (filters.tipo.length > 0) {
        const isGratuito = coursePrice.includes('Gratuito') || coursePrice.includes('R$ 0');
        const isPago = !isGratuito;
        
        const typeMatches = filters.tipo.some(tipo => {
            if (tipo === 'gratuito') return isGratuito;
            if (tipo === 'pago') return isPago;
            if (tipo === 'certificado') return true; // Assume all courses have certificates
            return false;
        });
        
        matches = matches && typeMatches;
    }
    
    // Level filter
    if (filters.nivel) {
        const courseLevel = getCourseLevel(courseTitle);
        matches = matches && (courseLevel === filters.nivel);
    }
    
    return matches;
}

function getCourseCategory(title) {
    // Simple categorization based on title
    if (title.includes('Inteligência Artificial') || title.includes('Desenvolvimento Web')) {
        return 'tecnologia';
    }
    if (title.includes('Gestão') || title.includes('Projetos')) {
        return 'gestao';
    }
    return 'outros';
}

function getCourseLevel(title) {
    // Simple level detection
    if (title.includes('Fundamentos') || title.includes('Introdutório')) {
        return 'iniciante';
    }
    if (title.includes('Avançado')) {
        return 'avancado';
    }
    return 'intermediario';
}

function sortCourses(sortBy) {
    const coursesContainer = document.querySelector('.courses-grid');
    const courses = Array.from(coursesContainer.querySelectorAll('.course-card'));
    
    courses.sort((a, b) => {
        switch (sortBy) {
            case 'alfabetico':
                const titleA = a.querySelector('.course-title').textContent;
                const titleB = b.querySelector('.course-title').textContent;
                return titleA.localeCompare(titleB);
                
            case 'acessados':
                // In a real app, this would use actual access data
                return Math.random() - 0.5; // Random for demo
                
            case 'recentes':
            default:
                // Keep original order for "most recent"
                return 0;
        }
    });
    
    // Re-append sorted courses
    courses.forEach(course => {
        coursesContainer.appendChild(course);
    });
}

function updateResultsCount() {
    const visibleCourses = document.querySelectorAll('.course-card[style*="block"], .course-card:not([style*="none"])');
    const count = visibleCourses.length;
    
    // Update count display (if exists)
    let countDisplay = document.querySelector('.results-count');
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.className = 'results-count';
        countDisplay.style.cssText = 'text-align: center; margin: 20px 0; color: var(--gray-600); font-weight: 500;';
        document.querySelector('.courses-catalog .container').insertBefore(countDisplay, document.querySelector('.courses-grid'));
    }
    
    countDisplay.textContent = `${count} curso${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
}

// Add fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

