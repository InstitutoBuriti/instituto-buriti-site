// Video Management JavaScript

// Sample video data
const sampleVideos = [
    {
        id: 1,
        title: "Introdução à Inteligência Artificial",
        description: "Uma visão geral dos conceitos fundamentais de IA e suas aplicações no mundo moderno.",
        duration: "15:32",
        views: 1247,
        likes: 89,
        status: "published",
        playlist: "fundamentos-ia",
        playlistName: "Fundamentos da IA",
        uploadDate: "2024-01-15",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: null
    },
    {
        id: 2,
        title: "Machine Learning vs Deep Learning",
        description: "Entenda as diferenças entre Machine Learning e Deep Learning com exemplos práticos.",
        duration: "22:18",
        views: 892,
        likes: 67,
        status: "published",
        playlist: "fundamentos-ia",
        playlistName: "Fundamentos da IA",
        uploadDate: "2024-01-18",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: null
    },
    {
        id: 3,
        title: "Planejamento de Projetos Culturais",
        description: "Como estruturar e planejar projetos culturais de forma eficiente e sustentável.",
        duration: "18:45",
        views: 634,
        likes: 45,
        status: "unlisted",
        playlist: "gestao-projetos",
        playlistName: "Gestão de Projetos",
        uploadDate: "2024-01-20",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: null
    },
    {
        id: 4,
        title: "Redes Neurais Explicadas",
        description: "Uma explicação detalhada sobre como funcionam as redes neurais artificiais.",
        duration: "28:12",
        views: 1456,
        likes: 112,
        status: "published",
        playlist: "fundamentos-ia",
        playlistName: "Fundamentos da IA",
        uploadDate: "2024-01-22",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: null
    },
    {
        id: 5,
        title: "Educação Inclusiva na Prática",
        description: "Estratégias práticas para implementar educação inclusiva em diferentes contextos.",
        duration: "25:07",
        views: 789,
        likes: 58,
        status: "private",
        playlist: "educacao-especial",
        playlistName: "Educação Especial",
        uploadDate: "2024-01-25",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: null
    },
    {
        id: 6,
        title: "Processamento de Linguagem Natural",
        description: "Como as máquinas entendem e processam a linguagem humana usando IA.",
        duration: "31:24",
        views: 567,
        likes: 42,
        status: "processing",
        playlist: "",
        playlistName: "",
        uploadDate: "2024-01-28",
        youtubeId: "",
        thumbnail: null
    }
];

let currentVideos = [...sampleVideos];
let currentView = 'grid';
let currentFilters = {
    playlist: '',
    status: '',
    sort: 'recent',
    search: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    setupUploadArea();
});

// Load and display videos
function loadVideos() {
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) return;

    // Apply filters
    let filteredVideos = [...currentVideos];

    // Filter by playlist
    if (currentFilters.playlist) {
        if (currentFilters.playlist === 'sem-playlist') {
            filteredVideos = filteredVideos.filter(video => !video.playlist);
        } else {
            filteredVideos = filteredVideos.filter(video => video.playlist === currentFilters.playlist);
        }
    }

    // Filter by status
    if (currentFilters.status) {
        filteredVideos = filteredVideos.filter(video => video.status === currentFilters.status);
    }

    // Filter by search
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredVideos = filteredVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm)
        );
    }

    // Sort videos
    switch (currentFilters.sort) {
        case 'recent':
            filteredVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'popular':
            filteredVideos.sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2));
            break;
        case 'duration':
            filteredVideos.sort((a, b) => {
                const aDuration = parseDuration(a.duration);
                const bDuration = parseDuration(b.duration);
                return bDuration - aDuration;
            });
            break;
        case 'title':
            filteredVideos.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }

    // Set grid class based on view
    videosGrid.className = `videos-grid ${currentView === 'list' ? 'list-view' : ''}`;

    // Generate HTML
    videosGrid.innerHTML = filteredVideos.map(video => createVideoCard(video)).join('');
}

// Create video card HTML
function createVideoCard(video) {
    const statusClass = video.status;
    const statusText = getStatusText(video.status);
    const playlistBadge = video.playlistName ? 
        `<div class="video-playlist">${video.playlistName}</div>` : '';

    return `
        <div class="video-card" onclick="showVideoDetails(${video.id})">
            <div class="video-thumbnail">
                <i data-lucide="play-circle"></i>
                <div class="video-duration">${video.duration}</div>
                <div class="video-status ${statusClass}">${statusText}</div>
            </div>
            <div class="video-content">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${video.description}</p>
                <div class="video-meta">
                    <span>${formatDate(video.uploadDate)}</span>
                    ${playlistBadge}
                </div>
                <div class="video-stats">
                    <div class="video-stat">
                        <i data-lucide="eye"></i>
                        <span>${video.views.toLocaleString()} visualizações</span>
                    </div>
                    <div class="video-stat">
                        <i data-lucide="heart"></i>
                        <span>${video.likes} curtidas</span>
                    </div>
                </div>
                <div class="video-actions" onclick="event.stopPropagation()">
                    <button class="video-action" onclick="editVideo(${video.id})">
                        <i data-lucide="edit"></i>
                        Editar
                    </button>
                    <button class="video-action" onclick="shareVideo(${video.id})">
                        <i data-lucide="share"></i>
                        Compartilhar
                    </button>
                    <button class="video-action" onclick="deleteVideo(${video.id})">
                        <i data-lucide="trash"></i>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'published': 'Publicado',
        'unlisted': 'Não Listado',
        'private': 'Privado',
        'processing': 'Processando'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function parseDuration(duration) {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Filter functions
function applyFilters() {
    const playlistFilter = document.getElementById('playlistFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchFilter = document.getElementById('searchFilter');

    currentFilters = {
        playlist: playlistFilter ? playlistFilter.value : '',
        status: statusFilter ? statusFilter.value : '',
        sort: sortFilter ? sortFilter.value : 'recent',
        search: searchFilter ? searchFilter.value : ''
    };

    loadVideos();
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// View toggle
function setView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    loadVideos();
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// Upload modal functions
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('uploadForm');
        const uploadArea = document.getElementById('uploadArea');
        if (form && uploadArea) {
            form.style.display = 'none';
            uploadArea.style.display = 'block';
            form.reset();
        }
    }
}

// Playlist modal functions
function showPlaylistModal() {
    const modal = document.getElementById('playlistModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hidePlaylistModal() {
    const modal = document.getElementById('playlistModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('playlistForm');
        if (form) {
            form.reset();
        }
    }
}

// Video details modal
function showVideoDetails(videoId) {
    const video = currentVideos.find(v => v.id === videoId);
    if (!video) return;

    const modal = document.getElementById('videoDetailsModal');
    const content = document.getElementById('videoDetailsContent');
    
    if (modal && content) {
        content.innerHTML = createVideoDetailsHTML(video);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
}

function hideVideoDetailsModal() {
    const modal = document.getElementById('videoDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function createVideoDetailsHTML(video) {
    const statusClass = video.status;
    const statusText = getStatusText(video.status);
    
    return `
        <div class="video-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div class="video-preview">
                <div class="video-thumbnail" style="width: 100%; height: 250px; margin-bottom: 20px;">
                    <i data-lucide="play-circle" style="font-size: 4rem;"></i>
                    <div class="video-duration">${video.duration}</div>
                    <div class="video-status ${statusClass}">${statusText}</div>
                </div>
                <h2 style="margin-bottom: 15px; color: #2d3748;">${video.title}</h2>
                <p style="color: #718096; line-height: 1.6; margin-bottom: 20px;">${video.description}</p>
                
                <div class="video-stats" style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div class="video-stat">
                        <i data-lucide="eye"></i>
                        <span>${video.views.toLocaleString()} visualizações</span>
                    </div>
                    <div class="video-stat">
                        <i data-lucide="heart"></i>
                        <span>${video.likes} curtidas</span>
                    </div>
                    <div class="video-stat">
                        <i data-lucide="calendar"></i>
                        <span>${formatDate(video.uploadDate)}</span>
                    </div>
                </div>
            </div>
            
            <div class="video-info">
                <h3 style="margin-bottom: 20px; color: #2d3748;">Informações do Vídeo</h3>
                
                <div class="info-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #4a5568; display: block; margin-bottom: 5px;">Status:</label>
                    <span class="video-status ${statusClass}" style="display: inline-block;">${statusText}</span>
                </div>
                
                <div class="info-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #4a5568; display: block; margin-bottom: 5px;">Playlist:</label>
                    <span>${video.playlistName || 'Nenhuma playlist'}</span>
                </div>
                
                <div class="info-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #4a5568; display: block; margin-bottom: 5px;">Duração:</label>
                    <span>${video.duration}</span>
                </div>
                
                <div class="info-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #4a5568; display: block; margin-bottom: 5px;">Data de Upload:</label>
                    <span>${formatDate(video.uploadDate)}</span>
                </div>
                
                ${video.youtubeId ? `
                <div class="info-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #4a5568; display: block; margin-bottom: 5px;">YouTube ID:</label>
                    <span style="font-family: monospace; background: #f7fafc; padding: 4px 8px; border-radius: 4px;">${video.youtubeId}</span>
                </div>
                ` : ''}
                
                <div class="video-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="editVideo(${video.id}); hideVideoDetailsModal();">
                        <i data-lucide="edit"></i>
                        Editar Vídeo
                    </button>
                    <button class="btn btn-secondary" onclick="shareVideo(${video.id})">
                        <i data-lucide="share"></i>
                        Compartilhar
                    </button>
                    <button class="btn btn-outline" onclick="duplicateVideo(${video.id})">
                        <i data-lucide="copy"></i>
                        Duplicar
                    </button>
                    <button class="btn btn-outline" onclick="downloadVideo(${video.id})" style="border-color: #ef4444; color: #ef4444;">
                        <i data-lucide="download"></i>
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup upload area
function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('videoFile');
    const uploadForm = document.getElementById('uploadForm');

    if (!uploadArea || !fileInput || !uploadForm) return;

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Form submission
    uploadForm.addEventListener('submit', handleUpload);
}

function handleFileSelect(file) {
    if (!file.type.startsWith('video/')) {
        showNotification('Por favor, selecione um arquivo de vídeo válido.', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
        showNotification('O arquivo é muito grande. Tamanho máximo: 2GB.', 'error');
        return;
    }

    // Show upload form
    const uploadArea = document.getElementById('uploadArea');
    const uploadForm = document.getElementById('uploadForm');
    const videoTitle = document.getElementById('videoTitle');

    if (uploadArea && uploadForm && videoTitle) {
        uploadArea.style.display = 'none';
        uploadForm.style.display = 'block';
        
        // Set default title based on filename
        const filename = file.name.replace(/\.[^/.]+$/, "");
        videoTitle.value = filename;
    }

    showNotification(`Arquivo selecionado: ${file.name}`, 'success');
}

function handleUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const playlist = document.getElementById('videoPlaylist').value;
    const privacy = document.getElementById('videoPrivacy').value;
    const notifications = document.getElementById('videoNotifications').checked;

    if (!title) {
        showNotification('Por favor, digite um título para o vídeo.', 'error');
        return;
    }

    // Simulate upload process
    simulateUpload(title, description, playlist, privacy, notifications);
}

function simulateUpload(title, description, playlist, privacy, notifications) {
    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const submitBtn = document.querySelector('#uploadForm button[type="submit"]');

    if (!progressContainer || !progressFill || !progressText || !submitBtn) return;

    // Show progress
    progressContainer.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Fazendo Upload...';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';

        if (progress >= 100) {
            clearInterval(interval);
            
            // Create new video
            const newVideo = {
                id: currentVideos.length + 1,
                title: title,
                description: description,
                duration: "0:00",
                views: 0,
                likes: 0,
                status: "processing",
                playlist: playlist,
                playlistName: getPlaylistName(playlist),
                uploadDate: new Date().toISOString().split('T')[0],
                youtubeId: "",
                thumbnail: null
            };

            currentVideos.unshift(newVideo);
            loadVideos();
            
            setTimeout(() => {
                lucide.createIcons();
            }, 100);

            hideUploadModal();
            showNotification('Upload iniciado! O vídeo será processado em breve.', 'success');
        }
    }, 200);
}

function getPlaylistName(playlistId) {
    const playlists = {
        'fundamentos-ia': 'Fundamentos da IA',
        'gestao-projetos': 'Gestão de Projetos',
        'educacao-especial': 'Educação Especial'
    };
    return playlists[playlistId] || '';
}

// Create playlist
function createPlaylist(e) {
    e.preventDefault();
    
    const title = document.getElementById('playlistTitle').value;
    const description = document.getElementById('playlistDescription').value;
    const course = document.getElementById('playlistCourse').value;
    const privacy = document.getElementById('playlistPrivacy').value;

    if (!title) {
        showNotification('Por favor, digite um nome para a playlist.', 'error');
        return;
    }

    // Simulate playlist creation
    showNotification(`Playlist "${title}" criada com sucesso!`, 'success');
    hidePlaylistModal();
}

// Video actions
function editVideo(videoId) {
    showNotification(`Editando vídeo ${videoId}...`, 'info');
}

function shareVideo(videoId) {
    const video = currentVideos.find(v => v.id === videoId);
    if (video && video.youtubeId) {
        const url = `https://youtube.com/watch?v=${video.youtubeId}`;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copiado para a área de transferência!', 'success');
        });
    } else {
        showNotification('Vídeo ainda não está disponível para compartilhamento.', 'warning');
    }
}

function deleteVideo(videoId) {
    if (confirm('Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.')) {
        currentVideos = currentVideos.filter(v => v.id !== videoId);
        loadVideos();
        showNotification('Vídeo excluído com sucesso.', 'success');
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
}

function duplicateVideo(videoId) {
    const video = currentVideos.find(v => v.id === videoId);
    if (video) {
        const duplicatedVideo = {
            ...video,
            id: currentVideos.length + 1,
            title: video.title + ' (Cópia)',
            views: 0,
            likes: 0,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        
        currentVideos.unshift(duplicatedVideo);
        loadVideos();
        showNotification('Vídeo duplicado com sucesso!', 'success');
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
}

function downloadVideo(videoId) {
    showNotification('Iniciando download do vídeo...', 'info');
}

function refreshVideos() {
    showNotification('Vídeos atualizados!', 'success');
    loadVideos();
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

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = ['uploadModal', 'playlistModal', 'videoDetailsModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Ctrl/Cmd + U for upload
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        showUploadModal();
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

