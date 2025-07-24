// Forum JavaScript Functionality

// Sample data for topics
const sampleTopics = [
    {
        id: 1,
        title: "Como aplicar conceitos de IA no dia a dia?",
        category: "geral",
        author: "Ana Silva",
        authorInitials: "AS",
        content: "Gostaria de saber como posso aplicar os conceitos que estou aprendendo no curso de IA em situações práticas do meu trabalho...",
        replies: 12,
        views: 156,
        likes: 8,
        createdAt: "2024-01-20T10:30:00Z",
        lastActivity: "2024-01-20T15:45:00Z",
        isAnswered: true,
        isPinned: false
    },
    {
        id: 2,
        title: "Dúvida sobre o módulo 3 - Redes Neurais",
        category: "curso",
        author: "Carlos Santos",
        authorInitials: "CS",
        content: "Estou com dificuldade para entender o conceito de backpropagation. Alguém poderia me explicar de forma mais simples?",
        replies: 7,
        views: 89,
        likes: 5,
        createdAt: "2024-01-20T09:15:00Z",
        lastActivity: "2024-01-20T14:20:00Z",
        isAnswered: false,
        isPinned: false
    },
    {
        id: 3,
        title: "Problema com upload de vídeos",
        category: "tecnico",
        author: "Maria Oliveira",
        authorInitials: "MO",
        content: "Não estou conseguindo fazer upload dos meus vídeos de atividade. A página fica carregando indefinidamente...",
        replies: 3,
        views: 45,
        likes: 2,
        createdAt: "2024-01-20T08:00:00Z",
        lastActivity: "2024-01-20T12:30:00Z",
        isAnswered: true,
        isPinned: false
    },
    {
        id: 4,
        title: "Oportunidades de carreira em IA - Discussão",
        category: "carreira",
        author: "Prof. João Silva",
        authorInitials: "JS",
        content: "Vamos discutir as principais oportunidades de carreira na área de Inteligência Artificial. Compartilhem suas experiências!",
        replies: 24,
        views: 312,
        likes: 18,
        createdAt: "2024-01-19T16:00:00Z",
        lastActivity: "2024-01-20T11:15:00Z",
        isAnswered: false,
        isPinned: true
    },
    {
        id: 5,
        title: "Dicas de estudo para iniciantes",
        category: "geral",
        author: "Pedro Costa",
        authorInitials: "PC",
        content: "Sou novo na plataforma e gostaria de algumas dicas de como organizar meus estudos de forma mais eficiente...",
        replies: 15,
        views: 203,
        likes: 12,
        createdAt: "2024-01-19T14:30:00Z",
        lastActivity: "2024-01-20T10:45:00Z",
        isAnswered: true,
        isPinned: false
    }
];

let currentTopics = [...sampleTopics];
let currentFilters = {
    category: '',
    sort: 'recent',
    search: ''
};

// Initialize forum
document.addEventListener('DOMContentLoaded', function() {
    loadTopics();
    updateStats();
});

// Load and display topics
function loadTopics() {
    const topicsList = document.getElementById('topicsList');
    if (!topicsList) return;

    // Apply filters
    let filteredTopics = [...currentTopics];

    // Filter by category
    if (currentFilters.category) {
        filteredTopics = filteredTopics.filter(topic => topic.category === currentFilters.category);
    }

    // Filter by search
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredTopics = filteredTopics.filter(topic => 
            topic.title.toLowerCase().includes(searchTerm) ||
            topic.content.toLowerCase().includes(searchTerm) ||
            topic.author.toLowerCase().includes(searchTerm)
        );
    }

    // Sort topics
    switch (currentFilters.sort) {
        case 'recent':
            filteredTopics.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            break;
        case 'popular':
            filteredTopics.sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2));
            break;
        case 'answered':
            filteredTopics = filteredTopics.filter(topic => topic.isAnswered);
            break;
        case 'unanswered':
            filteredTopics = filteredTopics.filter(topic => !topic.isAnswered);
            break;
    }

    // Sort pinned topics first
    filteredTopics.sort((a, b) => b.isPinned - a.isPinned);

    // Generate HTML
    topicsList.innerHTML = filteredTopics.map(topic => createTopicCard(topic)).join('');
}

// Create topic card HTML
function createTopicCard(topic) {
    const timeAgo = getTimeAgo(topic.lastActivity);
    const categoryName = getCategoryName(topic.category);
    
    return `
        <div class="topic-card" data-topic-id="${topic.id}">
            <div class="topic-header">
                <div>
                    <h3 class="topic-title" onclick="openTopic(${topic.id})">
                        ${topic.isPinned ? '<i data-lucide="pin" style="width: 16px; height: 16px; margin-right: 8px;"></i>' : ''}
                        ${topic.title}
                    </h3>
                    <div class="topic-meta">
                        <div class="topic-author">
                            <div class="author-avatar">${topic.authorInitials}</div>
                            <span>${topic.author}</span>
                        </div>
                        <span>•</span>
                        <span>${timeAgo}</span>
                        ${topic.isAnswered ? '<span class="topic-answered">• ✓ Respondido</span>' : ''}
                    </div>
                </div>
                <div class="topic-category">${categoryName}</div>
            </div>
            <div class="topic-preview">${topic.content}</div>
            <div class="topic-stats">
                <div class="topic-stat">
                    <i data-lucide="message-square"></i>
                    <span>${topic.replies} respostas</span>
                </div>
                <div class="topic-stat">
                    <i data-lucide="eye"></i>
                    <span>${topic.views} visualizações</span>
                </div>
                <div class="topic-stat">
                    <i data-lucide="heart"></i>
                    <span>${topic.likes} curtidas</span>
                </div>
                <div class="topic-actions">
                    <button class="topic-action" onclick="likeTopic(${topic.id})">
                        <i data-lucide="heart"></i>
                    </button>
                    <button class="topic-action" onclick="bookmarkTopic(${topic.id})">
                        <i data-lucide="bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'geral': 'Discussões Gerais',
        'curso': 'Dúvidas de Curso',
        'tecnico': 'Suporte Técnico',
        'carreira': 'Carreira e Mercado'
    };
    return categories[category] || category;
}

// Get time ago string
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
}

// Update forum statistics
function updateStats() {
    // This would normally fetch real data from the backend
    const stats = {
        topics: 1247,
        replies: 8932,
        members: 3456,
        online: 127
    };

    // Update stats display (if elements exist)
    const statElements = document.querySelectorAll('.stat-number');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.topics.toLocaleString();
        statElements[1].textContent = stats.replies.toLocaleString();
        statElements[2].textContent = stats.members.toLocaleString();
        statElements[3].textContent = stats.online.toLocaleString();
    }
}

// Filter functions
function toggleFilters() {
    const filtersSection = document.getElementById('filtersSection');
    if (filtersSection.style.display === 'none' || !filtersSection.style.display) {
        filtersSection.style.display = 'block';
    } else {
        filtersSection.style.display = 'none';
    }
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchFilter = document.getElementById('searchFilter');

    currentFilters = {
        category: categoryFilter ? categoryFilter.value : '',
        sort: sortFilter ? sortFilter.value : 'recent',
        search: searchFilter ? searchFilter.value : ''
    };

    loadTopics();
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

function filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        applyFilters();
    }
    
    // Show filters section
    const filtersSection = document.getElementById('filtersSection');
    if (filtersSection) {
        filtersSection.style.display = 'block';
    }
}

// Modal functions
function showNewTopicModal() {
    const modal = document.getElementById('newTopicModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideNewTopicModal() {
    const modal = document.getElementById('newTopicModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('newTopicForm');
        if (form) {
            form.reset();
        }
    }
}

// Create new topic
function createNewTopic(event) {
    event.preventDefault();
    
    const title = document.getElementById('topicTitle').value;
    const category = document.getElementById('topicCategory').value;
    const content = document.getElementById('topicContent').value;
    const notifications = document.getElementById('topicNotifications').checked;

    if (!title || !category || !content) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Create new topic object
    const newTopic = {
        id: currentTopics.length + 1,
        title: title,
        category: category,
        author: "Você", // This would come from authentication
        authorInitials: "VC",
        content: content,
        replies: 0,
        views: 1,
        likes: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isAnswered: false,
        isPinned: false
    };

    // Add to topics array
    currentTopics.unshift(newTopic);
    
    // Reload topics
    loadTopics();
    
    // Hide modal
    hideNewTopicModal();
    
    // Show success notification
    showNotification('Tópico criado com sucesso!', 'success');
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// Topic actions
function openTopic(topicId) {
    // This would navigate to the topic detail page
    showNotification(`Abrindo tópico ${topicId}...`, 'info');
    
    // Increment views
    const topic = currentTopics.find(t => t.id === topicId);
    if (topic) {
        topic.views++;
        loadTopics();
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
}

function likeTopic(topicId) {
    const topic = currentTopics.find(t => t.id === topicId);
    if (topic) {
        topic.likes++;
        loadTopics();
        showNotification('Tópico curtido!', 'success');
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
}

function bookmarkTopic(topicId) {
    showNotification('Tópico salvo nos favoritos!', 'success');
}

function loadMoreTopics() {
    // This would load more topics from the backend
    showNotification('Carregando mais tópicos...', 'info');
}

function refreshForum() {
    // Simulate refresh
    showNotification('Fórum atualizado!', 'success');
    loadTopics();
    updateStats();
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Initialize icon
    lucide.createIcons();

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'x-circle',
        'warning': 'alert-triangle',
        'info': 'info'
    };
    return icons[type] || 'info';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('newTopicModal');
    if (modal && event.target === modal) {
        hideNewTopicModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modal
    if (event.key === 'Escape') {
        hideNewTopicModal();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchFilter = document.getElementById('searchFilter');
        if (searchFilter) {
            searchFilter.focus();
        }
    }
});

// Auto-refresh forum every 30 seconds
setInterval(() => {
    updateStats();
}, 30000);

