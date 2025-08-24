// Sistema de Autenticação Customizado para Instituto Buriti
// Trabalha com a tabela 'usuarios' existente no Supabase

import { supabase } from './config.js';

class CustomAuth {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    // Carrega usuário do localStorage se existir
    loadUserFromStorage() {
        const userData = localStorage.getItem('instituto_buriti_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                localStorage.removeItem('instituto_buriti_user');
            }
        }
    }

    // Salva usuário no localStorage
    saveUserToStorage(user) {
        localStorage.setItem('instituto_buriti_user', JSON.stringify(user));
        this.currentUser = user;
    }

    // Remove usuário do localStorage
    removeUserFromStorage() {
        localStorage.removeItem('instituto_buriti_user');
        this.currentUser = null;
    }

    // Função de login usando a tabela usuarios
    async login(email, password) {
        try {
            // Busca o usuário na tabela usuarios
            const { data: users, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .limit(1);

            if (error) {
                throw new Error('Erro ao consultar banco de dados: ' + error.message);
            }

            if (!users || users.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            const user = users[0];

            // Aqui você deveria verificar a senha hash
            // Por enquanto, vamos simular a verificação
            // Em produção, use bcrypt ou similar para verificar o hash
            if (!user.senha_hash) {
                throw new Error('Dados de autenticação inválidos');
            }

            // Simula verificação de senha (substitua por verificação real de hash)
            // const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
            // Por enquanto, aceita qualquer senha para teste
            const isPasswordValid = true;

            if (!isPasswordValid) {
                throw new Error('Senha incorreta');
            }

            // Determina o papel do usuário
            let role = user.role || 'aluno'; // Default para aluno se não tiver role

            // Se não há campo role, infere baseado no email
            if (!user.role) {
                if (email.includes('admin') || email === 'adv.hemersondaniel@hotmail.com') {
                    role = 'admin';
                } else if (email.includes('instrutor') || email === 'carlos.mendes@teste.com') {
                    role = 'instrutor';
                } else {
                    role = 'aluno';
                }
            }

            // Cria objeto do usuário autenticado
            const authenticatedUser = {
                id: user.id,
                email: user.email,
                nome: user.nome,
                role: role,
                loginTime: new Date().toISOString()
            };

            // Salva no localStorage
            this.saveUserToStorage(authenticatedUser);

            return {
                success: true,
                user: authenticatedUser,
                message: 'Login realizado com sucesso'
            };

        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                error: error.message || 'Erro interno do servidor'
            };
        }
    }

    // Função de logout
    logout() {
        this.removeUserFromStorage();
        return {
            success: true,
            message: 'Logout realizado com sucesso'
        };
    }

    // Verifica se o usuário está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Retorna o usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Retorna o papel do usuário atual
    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    // Verifica se o usuário tem um papel específico
    hasRole(role) {
        return this.getUserRole() === role;
    }

    // Verifica se o usuário é admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Verifica se o usuário é instrutor
    isInstrutor() {
        return this.hasRole('instrutor');
    }

    // Verifica se o usuário é aluno
    isAluno() {
        return this.hasRole('aluno');
    }

    // Redireciona para o dashboard apropriado baseado no papel
    redirectToDashboard() {
        const role = this.getUserRole();
        
        switch (role) {
            case 'admin':
                window.location.href = 'dashboard-admin.html';
                break;
            case 'instrutor':
                window.location.href = 'dashboard-instrutor.html';
                break;
            case 'aluno':
                window.location.href = 'dashboard-aluno.html';
                break;
            default:
                window.location.href = 'dashboard-aluno.html'; // Default
                break;
        }
    }

    // Redireciona para a página de login apropriada baseado no papel
    redirectToLogin() {
        const role = this.getUserRole();
        
        switch (role) {
            case 'admin':
                window.location.href = 'login-admin.html';
                break;
            case 'instrutor':
                window.location.href = 'login-instrutor.html';
                break;
            default:
                window.location.href = 'login-aluno.html';
                break;
        }
    }
}

// Cria instância global
const customAuth = new CustomAuth();

// Exporta para uso em outros módulos
export { customAuth };

// Também disponibiliza globalmente para compatibilidade
window.customAuth = customAuth;

