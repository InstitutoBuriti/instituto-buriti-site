// Module Loader - Sistema de carregamento de módulos para Instituto Buriti
// Resolve dependências implícitas de ordem de carregamento de scripts

class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.dependencies = new Map();
        this.initQueue = [];
        this.isReady = false;
    }

    // Registra um módulo com suas dependências
    register(name, dependencies = [], initFunction = null) {
        this.modules.set(name, {
            name,
            dependencies,
            initFunction,
            loaded: false,
            initialized: false
        });
        
        this.dependencies.set(name, dependencies);
        
        // Se tem função de inicialização, adiciona à fila
        if (initFunction) {
            this.initQueue.push(name);
        }
        
        console.log(`Módulo registrado: ${name}`, dependencies);
    }

    // Carrega um módulo e suas dependências
    async load(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const module = this.modules.get(moduleName);
        if (!module) {
            throw new Error(`Módulo não encontrado: ${moduleName}`);
        }

        // Carrega dependências primeiro
        const dependencyPromises = module.dependencies.map(dep => this.load(dep));
        
        const loadPromise = Promise.all(dependencyPromises)
            .then(() => this.loadScript(moduleName))
            .then(() => {
                this.loadedModules.add(moduleName);
                module.loaded = true;
                console.log(`Módulo carregado: ${moduleName}`);
            });

        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }

    // Carrega o script físico
    async loadScript(moduleName) {
        return new Promise((resolve, reject) => {
            // Se é um módulo interno (já carregado), resolve imediatamente
            if (this.isInternalModule(moduleName)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this.getScriptPath(moduleName);
            script.type = 'module';
            
            script.onload = () => {
                console.log(`Script carregado: ${moduleName}`);
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error(`Falha ao carregar script: ${moduleName}`));
            };

            document.head.appendChild(script);
        });
    }

    // Verifica se é um módulo interno (biblioteca externa, etc.)
    isInternalModule(moduleName) {
        const internalModules = [
            'supabase',
            'fontawesome',
            'inter-font',
            'playfair-font'
        ];
        return internalModules.includes(moduleName);
    }

    // Retorna o caminho do script
    getScriptPath(moduleName) {
        const scriptPaths = {
            'config': '/js/config.js',
            'auth': '/js/auth.js',
            'custom-auth': '/js/custom-auth.js',
            'login': '/js/login.js',
            'dashboard': '/js/dashboard.js',
            'dashboard-auth': '/js/dashboard-auth.js',
            'dashboard-admin': '/js/dashboard-admin.js',
            'main': '/js/main.js',
            'forum': '/js/forum.js',
            'gamificacao': '/js/gamificacao.js',
            'perfil': '/js/perfil.js'
        };
        
        return scriptPaths[moduleName] || `/js/${moduleName}.js`;
    }

    // Inicializa todos os módulos na ordem correta
    async initializeAll() {
        console.log('Iniciando carregamento de módulos...');
        
        try {
            // Carrega todos os módulos registrados
            const loadPromises = Array.from(this.modules.keys()).map(name => this.load(name));
            await Promise.all(loadPromises);
            
            // Inicializa módulos na ordem de dependência
            await this.initializeInOrder();
            
            this.isReady = true;
            console.log('Todos os módulos carregados e inicializados');
            
            // Dispara evento de sistema pronto
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('Erro ao carregar módulos:', error);
            throw error;
        }
    }

    // Inicializa módulos respeitando dependências
    async initializeInOrder() {
        const sortedModules = this.topologicalSort();
        
        for (const moduleName of sortedModules) {
            const module = this.modules.get(moduleName);
            if (module && module.initFunction && !module.initialized) {
                try {
                    console.log(`Inicializando módulo: ${moduleName}`);
                    await module.initFunction();
                    module.initialized = true;
                } catch (error) {
                    console.error(`Erro ao inicializar módulo ${moduleName}:`, error);
                    throw error;
                }
            }
        }
    }

    // Ordenação topológica para resolver dependências
    topologicalSort() {
        const visited = new Set();
        const visiting = new Set();
        const result = [];

        const visit = (moduleName) => {
            if (visiting.has(moduleName)) {
                throw new Error(`Dependência circular detectada: ${moduleName}`);
            }
            
            if (visited.has(moduleName)) {
                return;
            }

            visiting.add(moduleName);
            
            const dependencies = this.dependencies.get(moduleName) || [];
            for (const dep of dependencies) {
                visit(dep);
            }
            
            visiting.delete(moduleName);
            visited.add(moduleName);
            result.push(moduleName);
        };

        for (const moduleName of this.modules.keys()) {
            if (!visited.has(moduleName)) {
                visit(moduleName);
            }
        }

        return result;
    }

    // Dispara evento quando sistema está pronto
    dispatchReadyEvent() {
        const event = new CustomEvent('modulesReady', {
            detail: {
                loadedModules: Array.from(this.loadedModules),
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
        
        // Também define uma variável global para compatibilidade
        window.institutoBuritiReady = true;
    }

    // Aguarda um módulo específico estar pronto
    async waitForModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const checkModule = () => {
                if (this.loadedModules.has(moduleName)) {
                    resolve();
                } else {
                    setTimeout(checkModule, 50);
                }
            };
            checkModule();
        });
    }

    // Aguarda o sistema estar completamente pronto
    async waitForReady() {
        if (this.isReady) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.isReady) {
                    resolve();
                } else {
                    setTimeout(checkReady, 50);
                }
            };
            checkReady();
        });
    }

    // Executa uma função quando o sistema estiver pronto
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            document.addEventListener('modulesReady', callback, { once: true });
        }
    }

    // Obtém status de um módulo
    getModuleStatus(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) {
            return { exists: false };
        }

        return {
            exists: true,
            loaded: module.loaded,
            initialized: module.initialized,
            dependencies: module.dependencies
        };
    }

    // Lista todos os módulos e seus status
    getAllModulesStatus() {
        const status = {};
        for (const [name, module] of this.modules) {
            status[name] = {
                loaded: module.loaded,
                initialized: module.initialized,
                dependencies: module.dependencies
            };
        }
        return status;
    }
}

// Cria instância global do loader
const moduleLoader = new ModuleLoader();

// Registra módulos do sistema com suas dependências
moduleLoader.register('supabase'); // Biblioteca externa
moduleLoader.register('fontawesome'); // Biblioteca externa
moduleLoader.register('inter-font'); // Font externa
moduleLoader.register('playfair-font'); // Font externa

moduleLoader.register('config', ['supabase'], async () => {
    console.log('Config inicializado');
});

moduleLoader.register('custom-auth', ['config'], async () => {
    console.log('Custom Auth inicializado');
});

moduleLoader.register('auth', ['config', 'custom-auth'], async () => {
    console.log('Auth inicializado');
});

moduleLoader.register('login', ['auth', 'custom-auth'], async () => {
    console.log('Login inicializado');
    // Inicializa funcionalidades de login se estiver na página correta
    if (document.body.classList.contains('page-login-admin') || 
        document.body.classList.contains('page-login-instrutor') ||
        document.body.classList.contains('page-login-aluno')) {
        
        if (typeof initializeLogin === 'function') {
            initializeLogin();
        }
    }
});

moduleLoader.register('dashboard-auth', ['auth', 'custom-auth'], async () => {
    console.log('Dashboard Auth inicializado');
});

moduleLoader.register('dashboard', ['dashboard-auth'], async () => {
    console.log('Dashboard inicializado');
});

moduleLoader.register('dashboard-admin', ['dashboard'], async () => {
    console.log('Dashboard Admin inicializado');
});

moduleLoader.register('main', ['config'], async () => {
    console.log('Main inicializado');
});

moduleLoader.register('forum', ['auth'], async () => {
    console.log('Forum inicializado');
});

moduleLoader.register('gamificacao', ['auth'], async () => {
    console.log('Gamificação inicializado');
});

moduleLoader.register('perfil', ['auth'], async () => {
    console.log('Perfil inicializado');
});

// Exporta para uso global
window.moduleLoader = moduleLoader;

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        moduleLoader.initializeAll().catch(console.error);
    });
} else {
    // DOM já está pronto
    moduleLoader.initializeAll().catch(console.error);
}

// Exporta para módulos ES6
export { moduleLoader };
// Versão atualizada em 24/08/2025
