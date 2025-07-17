/**
 * YouTube Player Integration para Instituto Buriti
 * Integração completa com YouTube API para controle educacional
 */

// Configurações globais
const YOUTUBE_CONFIG = {
    apiKey: 'YOUR_YOUTUBE_API_KEY', // Será configurado pelo instrutor
    channelId: 'YOUR_CHANNEL_ID',   // Canal privado do Instituto Buriti
    completionThreshold: 0.8,       // 80% para marcar como concluído
    progressInterval: 5000,         // Salvar progresso a cada 5 segundos
    autoAdvance: true               // Avançar automaticamente para próxima aula
};

// Variáveis globais
let youtubePlayer = null;
let currentVideoData = null;
let progressTracker = null;
let watchTimeTracker = null;
let isPlayerReady = false;

/**
 * Inicializar YouTube Player
 */
function initializeYouTubePlayer() {
    console.log('Inicializando YouTube Player...');
    
    // Obter dados da aula da URL ou localStorage
    loadCurrentLessonData();
    
    // Criar player do YouTube
    createYouTubePlayer();
    
    // Inicializar controles personalizados
    initializeCustomControls();
    
    // Carregar playlist do curso
    loadCoursePlaylist();
}

/**
 * Carregar dados da aula atual
 */
function loadCurrentLessonData() {
    // Obter ID da aula da URL
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('lesson') || localStorage.getItem('currentLesson');
    
    if (!lessonId) {
        console.error('ID da aula não encontrado');
        showError('Aula não encontrada');
        return;
    }
    
    // Dados simulados da aula (em produção virá da API)
    currentVideoData = getLessonData(lessonId);
    
    if (!currentVideoData) {
        console.error('Dados da aula não encontrados');
        showError('Dados da aula não encontrados');
        return;
    }
    
    // Atualizar interface com dados da aula
    updateLessonInfo();
}

/**
 * Obter dados da aula (simulado)
 */
function getLessonData(lessonId) {
    // Em produção, isso virá da API do backend
    const lessonsData = {
        'lesson-1': {
            id: 'lesson-1',
            title: 'Introdução ao Curso',
            youtubeId: 'dQw4w9WgXcQ', // ID do vídeo no YouTube
            duration: 600, // 10 minutos em segundos
            courseId: 'course-1',
            courseName: 'Curso de Exemplo',
            description: 'Primeira aula do curso introdutório',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        },
        'lesson-2': {
            id: 'lesson-2',
            title: 'Conceitos Fundamentais',
            youtubeId: 'dQw4w9WgXcQ',
            duration: 900, // 15 minutos
            courseId: 'course-1',
            courseName: 'Curso de Exemplo',
            description: 'Conceitos básicos e fundamentais',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        }
    };
    
    return lessonsData[lessonId];
}

/**
 * Criar player do YouTube
 */
function createYouTubePlayer() {
    if (!currentVideoData || !currentVideoData.youtubeId) {
        console.error('ID do vídeo YouTube não encontrado');
        return;
    }
    
    // Configurações do player
    const playerVars = {
        autoplay: 0,
        controls: 1,
        disablekb: 0,
        enablejsapi: 1,
        fs: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        origin: window.location.origin
    };
    
    // Criar player
    youtubePlayer = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: currentVideoData.youtubeId,
        playerVars: playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

/**
 * Callback quando player estiver pronto
 */
function onPlayerReady(event) {
    console.log('YouTube Player pronto');
    isPlayerReady = true;
    
    // Ocultar loading
    hideLoading();
    
    // Inicializar rastreamento de progresso
    initializeProgressTracking();
    
    // Carregar progresso salvo
    loadSavedProgress();
    
    // Atualizar duração do vídeo
    updateVideoDuration();
    
    // Configurar controles de velocidade
    setupSpeedControls();
}

/**
 * Callback para mudanças de estado do player
 */
function onPlayerStateChange(event) {
    const state = event.data;
    
    switch (state) {
        case YT.PlayerState.PLAYING:
            onVideoPlaying();
            break;
        case YT.PlayerState.PAUSED:
            onVideoPaused();
            break;
        case YT.PlayerState.ENDED:
            onVideoEnded();
            break;
        case YT.PlayerState.BUFFERING:
            onVideoBuffering();
            break;
    }
}

/**
 * Callback para erros do player
 */
function onPlayerError(event) {
    console.error('Erro no YouTube Player:', event.data);
    
    const errorMessages = {
        2: 'ID do vídeo inválido',
        5: 'Erro de reprodução HTML5',
        100: 'Vídeo não encontrado ou privado',
        101: 'Reprodução não permitida em domínios externos',
        150: 'Reprodução não permitida em domínios externos'
    };
    
    const message = errorMessages[event.data] || 'Erro desconhecido no player';
    showError(`Erro no vídeo: ${message}`);
}

/**
 * Inicializar rastreamento de progresso
 */
function initializeProgressTracking() {
    // Rastreador de progresso
    progressTracker = setInterval(() => {
        if (youtubePlayer && isPlayerReady) {
            updateProgress();
            saveProgress();
        }
    }, YOUTUBE_CONFIG.progressInterval);
    
    // Rastreador de tempo assistido
    watchTimeTracker = setInterval(() => {
        if (youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            updateWatchTime();
        }
    }, 1000);
}

/**
 * Atualizar progresso do vídeo
 */
function updateProgress() {
    if (!youtubePlayer || !isPlayerReady) return;
    
    const currentTime = youtubePlayer.getCurrentTime();
    const duration = youtubePlayer.getDuration();
    
    if (duration > 0) {
        const progress = currentTime / duration;
        const progressPercent = Math.round(progress * 100);
        
        // Atualizar barra de progresso personalizada
        updateProgressBar(progress);
        
        // Atualizar tempo atual
        updateTimeDisplay(currentTime, duration);
        
        // Verificar se atingiu o threshold de conclusão
        checkCompletionThreshold(progress);
        
        // Atualizar estatísticas
        updateProgressStats(progressPercent);
    }
}

/**
 * Atualizar barra de progresso
 */
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progressFilledCustom');
    const completionBar = document.getElementById('completionFilled');
    
    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
    }
    
    if (completionBar) {
        const completionProgress = Math.min(progress / YOUTUBE_CONFIG.completionThreshold, 1);
        completionBar.style.width = `${completionProgress * 100}%`;
    }
}

/**
 * Atualizar display de tempo
 */
function updateTimeDisplay(currentTime, duration) {
    const currentTimeEl = document.getElementById('currentTimeCustom');
    const totalTimeEl = document.getElementById('totalTimeCustom');
    const progressPercentEl = document.getElementById('progressPercent');
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(duration);
    }
    
    if (progressPercentEl) {
        const percent = Math.round((currentTime / duration) * 100);
        progressPercentEl.textContent = `${percent}%`;
    }
}

/**
 * Verificar threshold de conclusão
 */
function checkCompletionThreshold(progress) {
    const completeBtn = document.getElementById('markCompleteBtn');
    const completionText = document.getElementById('completionText');
    
    if (progress >= YOUTUBE_CONFIG.completionThreshold) {
        if (completeBtn) {
            completeBtn.disabled = false;
            completeBtn.textContent = '✓ Aula Concluída - Clique para Confirmar';
        }
    }
    
    if (completionText) {
        const currentPercent = Math.round(progress * 100);
        const requiredPercent = Math.round(YOUTUBE_CONFIG.completionThreshold * 100);
        completionText.textContent = `${currentPercent}% / ${requiredPercent}% necessário`;
    }
}

/**
 * Atualizar estatísticas de progresso
 */
function updateProgressStats(progressPercent) {
    const watchPercentageEl = document.getElementById('watchPercentage');
    
    if (watchPercentageEl) {
        watchPercentageEl.textContent = `${progressPercent}%`;
    }
}

/**
 * Atualizar tempo assistido
 */
function updateWatchTime() {
    const watchTimeEl = document.getElementById('watchTime');
    const totalWatchTimeEl = document.getElementById('totalWatchTime');
    
    // Obter tempo assistido do localStorage
    let totalWatchTime = parseInt(localStorage.getItem(`watchTime_${currentVideoData.id}`) || '0');
    totalWatchTime += 1; // Adicionar 1 segundo
    
    // Salvar no localStorage
    localStorage.setItem(`watchTime_${currentVideoData.id}`, totalWatchTime.toString());
    
    // Atualizar interface
    if (watchTimeEl) {
        watchTimeEl.textContent = `Tempo assistido: ${Math.floor(totalWatchTime / 60)}min`;
    }
    
    if (totalWatchTimeEl) {
        totalWatchTimeEl.textContent = `${Math.floor(totalWatchTime / 60)}min`;
    }
}

/**
 * Salvar progresso
 */
function saveProgress() {
    if (!youtubePlayer || !isPlayerReady || !currentVideoData) return;
    
    const currentTime = youtubePlayer.getCurrentTime();
    const duration = youtubePlayer.getDuration();
    const progress = duration > 0 ? currentTime / duration : 0;
    
    const progressData = {
        lessonId: currentVideoData.id,
        currentTime: currentTime,
        duration: duration,
        progress: progress,
        lastWatched: new Date().toISOString()
    };
    
    // Salvar no localStorage (em produção seria enviado para API)
    localStorage.setItem(`progress_${currentVideoData.id}`, JSON.stringify(progressData));
    
    // Atualizar progresso na interface
    updateLessonProgress(Math.round(progress * 100));
}

/**
 * Carregar progresso salvo
 */
function loadSavedProgress() {
    if (!currentVideoData) return;
    
    const savedProgress = localStorage.getItem(`progress_${currentVideoData.id}`);
    
    if (savedProgress) {
        try {
            const progressData = JSON.parse(savedProgress);
            
            // Se o progresso for significativo (mais de 30 segundos), perguntar se quer continuar
            if (progressData.currentTime > 30) {
                const continueWatching = confirm(
                    `Você já assistiu ${Math.round(progressData.progress * 100)}% desta aula. ` +
                    `Deseja continuar de onde parou?`
                );
                
                if (continueWatching && youtubePlayer) {
                    youtubePlayer.seekTo(progressData.currentTime, true);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar progresso salvo:', error);
        }
    }
}

/**
 * Configurar controles de velocidade
 */
function setupSpeedControls() {
    const speedSelect = document.getElementById('speedSelect');
    
    if (speedSelect) {
        speedSelect.addEventListener('change', function() {
            const speed = parseFloat(this.value);
            if (youtubePlayer && isPlayerReady) {
                youtubePlayer.setPlaybackRate(speed);
            }
        });
    }
}

/**
 * Eventos do player
 */
function onVideoPlaying() {
    console.log('Vídeo iniciado');
    // Adicionar classe para indicar que está reproduzindo
    document.body.classList.add('video-playing');
}

function onVideoPaused() {
    console.log('Vídeo pausado');
    document.body.classList.remove('video-playing');
}

function onVideoEnded() {
    console.log('Vídeo finalizado');
    document.body.classList.remove('video-playing');
    
    // Marcar como concluído automaticamente
    markLessonComplete();
    
    // Auto-avançar para próxima aula se configurado
    if (YOUTUBE_CONFIG.autoAdvance) {
        setTimeout(() => {
            goToNextLesson();
        }, 3000);
    }
}

function onVideoBuffering() {
    console.log('Vídeo carregando...');
}

/**
 * Marcar aula como concluída
 */
function markLessonComplete() {
    if (!currentVideoData) return;
    
    // Salvar conclusão no localStorage
    const completionData = {
        lessonId: currentVideoData.id,
        completed: true,
        completedAt: new Date().toISOString(),
        finalProgress: 1.0
    };
    
    localStorage.setItem(`completion_${currentVideoData.id}`, JSON.stringify(completionData));
    
    // Atualizar interface
    const completeBtn = document.getElementById('markCompleteBtn');
    if (completeBtn) {
        completeBtn.textContent = '✅ Aula Concluída';
        completeBtn.classList.add('completed');
        completeBtn.disabled = true;
    }
    
    // Atualizar progresso da aula
    updateLessonProgress(100);
    
    // Mostrar notificação
    showNotification('🎉 Parabéns! Aula concluída com sucesso!');
    
    // Atualizar gamificação (pontos, badges, etc.)
    updateGamification();
}

/**
 * Ir para próxima aula
 */
function goToNextLesson() {
    // Implementar lógica para ir para próxima aula
    const nextLessonBtn = document.getElementById('nextLessonBtn');
    if (nextLessonBtn && !nextLessonBtn.disabled) {
        nextLessonBtn.click();
    }
}

/**
 * Inicializar controles personalizados
 */
function initializeCustomControls() {
    // Botão de marcar como concluída
    const completeBtn = document.getElementById('markCompleteBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            if (!this.disabled) {
                markLessonComplete();
            }
        });
    }
    
    // Botões de navegação
    const prevBtn = document.getElementById('prevLessonBtn');
    const nextBtn = document.getElementById('nextLessonBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToPreviousLesson());
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToNextLesson());
    }
}

/**
 * Carregar playlist do curso
 */
function loadCoursePlaylist() {
    // Dados simulados da playlist (em produção virá da API)
    const playlistData = [
        {
            id: 'lesson-1',
            title: 'Introdução ao Curso',
            duration: '10:00',
            completed: false,
            current: true,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg'
        },
        {
            id: 'lesson-2',
            title: 'Conceitos Fundamentais',
            duration: '15:00',
            completed: false,
            current: false,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg'
        }
    ];
    
    renderPlaylist(playlistData);
}

/**
 * Renderizar playlist
 */
function renderPlaylist(playlist) {
    const container = document.getElementById('playlistContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    playlist.forEach((lesson, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${lesson.current ? 'active' : ''} ${lesson.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="lesson-thumbnail">
                <img src="${lesson.thumbnail}" alt="${lesson.title}" onerror="this.style.display='none'">
                <div class="play-icon">▶</div>
            </div>
            <div class="lesson-details">
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-duration">${lesson.duration}</div>
            </div>
            <div class="lesson-status ${lesson.completed ? 'completed' : lesson.current ? 'current' : 'locked'}">
                ${lesson.completed ? 'Concluída' : lesson.current ? 'Atual' : 'Bloqueada'}
            </div>
        `;
        
        // Adicionar evento de clique
        item.addEventListener('click', () => {
            if (!lesson.current && !lesson.completed) {
                showNotification('Esta aula ainda não está disponível');
                return;
            }
            
            // Navegar para a aula
            window.location.href = `video-player-youtube.html?lesson=${lesson.id}`;
        });
        
        container.appendChild(item);
    });
}

/**
 * Funções utilitárias
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateLessonInfo() {
    if (!currentVideoData) return;
    
    const titleEl = document.getElementById('lessonTitle');
    const durationEl = document.getElementById('lessonDuration');
    const courseBreadcrumb = document.getElementById('courseBreadcrumb');
    const lessonBreadcrumb = document.getElementById('lessonBreadcrumb');
    
    if (titleEl) titleEl.textContent = currentVideoData.title;
    if (durationEl) durationEl.textContent = formatTime(currentVideoData.duration);
    if (courseBreadcrumb) courseBreadcrumb.textContent = currentVideoData.courseName;
    if (lessonBreadcrumb) lessonBreadcrumb.textContent = currentVideoData.title;
}

function updateVideoDuration() {
    if (!youtubePlayer || !isPlayerReady) return;
    
    const duration = youtubePlayer.getDuration();
    const durationEl = document.getElementById('lessonDuration');
    
    if (durationEl && duration > 0) {
        durationEl.textContent = formatTime(duration);
    }
}

function updateLessonProgress(percent) {
    const progressEl = document.getElementById('lessonProgress');
    if (progressEl) {
        progressEl.textContent = `${percent}% concluído`;
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('videoLoading');
    if (loadingEl) {
        loadingEl.classList.add('hidden');
    }
}

function showError(message) {
    const loadingEl = document.getElementById('videoLoading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="color: #e74c3c; text-align: center;">
                <h3>❌ Erro</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="background: #973CBF; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

function showNotification(message) {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #973CBF;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updateGamification() {
    // Implementar lógica de gamificação
    // Adicionar pontos, verificar badges, etc.
    console.log('Atualizando gamificação...');
}

function goToPreviousLesson() {
    // Implementar navegação para aula anterior
    console.log('Ir para aula anterior');
}

// Cleanup quando sair da página
window.addEventListener('beforeunload', function() {
    if (progressTracker) {
        clearInterval(progressTracker);
    }
    if (watchTimeTracker) {
        clearInterval(watchTimeTracker);
    }
});

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

