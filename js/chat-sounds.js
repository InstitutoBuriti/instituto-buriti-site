/**
 * Sistema de Sons para Chat
 * Instituto Buriti - Sistema de Chat
 */

class ChatSounds {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
        
        this.initializeAudioContext();
        this.loadSettings();
    }

    /**
     * Inicializar contexto de áudio
     */
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Áudio não suportado:', error);
        }
    }

    /**
     * Carregar configurações salvas
     */
    loadSettings() {
        const savedEnabled = localStorage.getItem('chatSoundsEnabled');
        const savedVolume = localStorage.getItem('chatSoundsVolume');
        
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }
        
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
    }

    /**
     * Salvar configurações
     */
    saveSettings() {
        localStorage.setItem('chatSoundsEnabled', this.enabled.toString());
        localStorage.setItem('chatSoundsVolume', this.volume.toString());
    }

    /**
     * Tocar som de nova mensagem
     */
    playNewMessage() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([800, 1000], [0.1, 0.1], 'sine');
    }

    /**
     * Tocar som de usuário entrou
     */
    playUserJoined() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([600, 800, 1000], [0.1, 0.1, 0.1], 'triangle');
    }

    /**
     * Tocar som de usuário saiu
     */
    playUserLeft() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([1000, 800, 600], [0.1, 0.1, 0.1], 'triangle');
    }

    /**
     * Tocar som de notificação
     */
    playNotification() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([1200, 1000, 1200], [0.05, 0.05, 0.1], 'sine');
    }

    /**
     * Tocar som de erro
     */
    playError() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([400, 300], [0.2, 0.3], 'sawtooth');
    }

    /**
     * Tocar som de sucesso
     */
    playSuccess() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playTone([800, 1000, 1200], [0.1, 0.1, 0.2], 'sine');
    }

    /**
     * Tocar sequência de tons
     */
    playTone(frequencies, durations, waveType = 'sine') {
        if (!this.audioContext) return;

        let currentTime = this.audioContext.currentTime;
        
        frequencies.forEach((frequency, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, currentTime);
            
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + durations[index]);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + durations[index]);
            
            currentTime += durations[index];
        });
    }

    /**
     * Ativar/desativar sons
     */
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }

    /**
     * Definir volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    /**
     * Verificar se está habilitado
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Obter volume atual
     */
    getVolume() {
        return this.volume;
    }
}

// Instância global
let chatSounds = null;

/**
 * Inicializar sistema de sons
 */
function initializeChatSounds() {
    if (!chatSounds) {
        chatSounds = new ChatSounds();
    }
    return chatSounds;
}

/**
 * Obter instância de sons
 */
function getChatSounds() {
    return chatSounds || initializeChatSounds();
}

// Exportar para uso global
window.ChatSounds = ChatSounds;
window.initializeChatSounds = initializeChatSounds;
window.getChatSounds = getChatSounds;

