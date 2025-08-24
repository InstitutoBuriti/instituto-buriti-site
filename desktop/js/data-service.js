// Data Service - Serviço de dados para Instituto Buriti
// Substitui dados mock por dados reais do Supabase

import { supabase } from './config.js';

class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.loadingStates = new Map();
    }

    // Método genérico para cache
    getCacheKey(table, filters = {}) {
        return `${table}_${JSON.stringify(filters)}`;
    }

    // Verifica se dados estão em cache e válidos
    isValidCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        const now = Date.now();
        return (now - cached.timestamp) < this.cacheTimeout;
    }

    // Salva dados no cache
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Obtém dados do cache
    getCache(key) {
        const cached = this.cache.get(key);
        return cached ? cached.data : null;
    }

    // Limpa cache específico ou todo cache
    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    // USUÁRIOS
    async getUsers(filters = {}) {
        const cacheKey = this.getCacheKey('usuarios', filters);
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            let query = supabase.from('usuarios').select('*');
            
            if (filters.role) {
                query = query.eq('role', filters.role);
            }
            
            if (filters.email) {
                query = query.eq('email', filters.email);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            this.setCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    }

    async getUserById(id) {
        const cacheKey = this.getCacheKey('usuarios', { id });
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            this.setCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }
    }

    async updateUser(id, updates) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Limpa cache relacionado
            this.clearCache();
            
            return data;
            
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    // CURSOS
    async getCourses(filters = {}) {
        const cacheKey = this.getCacheKey('cursos', filters);
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            let query = supabase.from('cursos').select('*');
            
            if (filters.categoria) {
                query = query.eq('categoria', filters.categoria);
            }
            
            if (filters.ativo !== undefined) {
                query = query.eq('ativo', filters.ativo);
            }
            
            if (filters.instrutor_id) {
                query = query.eq('instrutor_id', filters.instrutor_id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.setCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            throw error;
        }
    }

    async getCourseById(id) {
        const cacheKey = this.getCacheKey('cursos', { id });
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('cursos')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            this.setCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar curso:', error);
            throw error;
        }
    }

    async createCourse(courseData) {
        try {
            const { data, error } = await supabase
                .from('cursos')
                .insert([courseData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Limpa cache de cursos
            this.clearCache();
            
            return data;
            
        } catch (error) {
            console.error('Erro ao criar curso:', error);
            throw error;
        }
    }

    async updateCourse(id, updates) {
        try {
            const { data, error } = await supabase
                .from('cursos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Limpa cache relacionado
            this.clearCache();
            
            return data;
            
        } catch (error) {
            console.error('Erro ao atualizar curso:', error);
            throw error;
        }
    }

    async deleteCourse(id) {
        try {
            const { error } = await supabase
                .from('cursos')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            // Limpa cache relacionado
            this.clearCache();
            
            return true;
            
        } catch (error) {
            console.error('Erro ao deletar curso:', error);
            throw error;
        }
    }

    // MATRÍCULAS
    async getEnrollments(filters = {}) {
        const cacheKey = this.getCacheKey('matriculas', filters);
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            let query = supabase
                .from('matriculas')
                .select(`
                    *,
                    usuarios(id, nome, email),
                    cursos(id, titulo, categoria)
                `);
            
            if (filters.usuario_id) {
                query = query.eq('usuario_id', filters.usuario_id);
            }
            
            if (filters.curso_id) {
                query = query.eq('curso_id', filters.curso_id);
            }
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.setCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar matrículas:', error);
            throw error;
        }
    }

    async createEnrollment(enrollmentData) {
        try {
            const { data, error } = await supabase
                .from('matriculas')
                .insert([enrollmentData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Limpa cache relacionado
            this.clearCache();
            
            return data;
            
        } catch (error) {
            console.error('Erro ao criar matrícula:', error);
            throw error;
        }
    }

    async updateEnrollment(id, updates) {
        try {
            const { data, error } = await supabase
                .from('matriculas')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Limpa cache relacionado
            this.clearCache();
            
            return data;
            
        } catch (error) {
            console.error('Erro ao atualizar matrícula:', error);
            throw error;
        }
    }

    // ESTATÍSTICAS E DASHBOARDS
    async getDashboardStats(userId, userRole) {
        const cacheKey = this.getCacheKey('dashboard_stats', { userId, userRole });
        
        if (this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            let stats = {};

            if (userRole === 'admin') {
                // Estatísticas para admin
                const [usersCount, coursesCount, enrollmentsCount] = await Promise.all([
                    this.getTableCount('usuarios'),
                    this.getTableCount('cursos'),
                    this.getTableCount('matriculas')
                ]);

                stats = {
                    totalUsers: usersCount,
                    totalCourses: coursesCount,
                    totalEnrollments: enrollmentsCount,
                    activeUsers: await this.getActiveUsersCount(),
                    revenue: await this.getTotalRevenue()
                };

            } else if (userRole === 'instrutor') {
                // Estatísticas para instrutor
                const instructorCourses = await this.getCourses({ instrutor_id: userId });
                const courseIds = instructorCourses.map(c => c.id);
                
                stats = {
                    totalCourses: instructorCourses.length,
                    totalStudents: await this.getInstructorStudentsCount(courseIds),
                    completedCourses: await this.getCompletedCoursesCount(courseIds),
                    averageRating: await this.getInstructorAverageRating(userId)
                };

            } else if (userRole === 'aluno') {
                // Estatísticas para aluno
                const enrollments = await this.getEnrollments({ usuario_id: userId });
                
                stats = {
                    enrolledCourses: enrollments.length,
                    completedCourses: enrollments.filter(e => e.status === 'concluido').length,
                    inProgressCourses: enrollments.filter(e => e.status === 'em_andamento').length,
                    totalHours: await this.getUserTotalHours(userId)
                };
            }

            this.setCache(cacheKey, stats);
            return stats;
            
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }

    // MÉTODOS AUXILIARES
    async getTableCount(tableName) {
        try {
            const { count, error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return count || 0;
            
        } catch (error) {
            console.error(`Erro ao contar registros de ${tableName}:`, error);
            return 0;
        }
    }

    async getActiveUsersCount() {
        try {
            // Considera usuários ativos como aqueles que fizeram login nos últimos 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count, error } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .gte('last_login', thirtyDaysAgo.toISOString());
            
            if (error) throw error;
            return count || 0;
            
        } catch (error) {
            console.error('Erro ao contar usuários ativos:', error);
            return 0;
        }
    }

    async getTotalRevenue() {
        try {
            // Implementar lógica de receita quando tabela de pagamentos existir
            return 0;
        } catch (error) {
            console.error('Erro ao calcular receita:', error);
            return 0;
        }
    }

    async getInstructorStudentsCount(courseIds) {
        if (!courseIds.length) return 0;
        
        try {
            const { count, error } = await supabase
                .from('matriculas')
                .select('*', { count: 'exact', head: true })
                .in('curso_id', courseIds);
            
            if (error) throw error;
            return count || 0;
            
        } catch (error) {
            console.error('Erro ao contar alunos do instrutor:', error);
            return 0;
        }
    }

    async getCompletedCoursesCount(courseIds) {
        if (!courseIds.length) return 0;
        
        try {
            const { count, error } = await supabase
                .from('matriculas')
                .select('*', { count: 'exact', head: true })
                .in('curso_id', courseIds)
                .eq('status', 'concluido');
            
            if (error) throw error;
            return count || 0;
            
        } catch (error) {
            console.error('Erro ao contar cursos concluídos:', error);
            return 0;
        }
    }

    async getInstructorAverageRating(instructorId) {
        try {
            // Implementar quando tabela de avaliações existir
            return 4.5; // Valor padrão temporário
        } catch (error) {
            console.error('Erro ao calcular avaliação média:', error);
            return 0;
        }
    }

    async getUserTotalHours(userId) {
        try {
            // Implementar quando tabela de progresso existir
            return 0;
        } catch (error) {
            console.error('Erro ao calcular horas totais:', error);
            return 0;
        }
    }

    // BUSCA E FILTROS
    async searchCourses(searchTerm, filters = {}) {
        try {
            let query = supabase
                .from('cursos')
                .select('*')
                .or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
            
            if (filters.categoria) {
                query = query.eq('categoria', filters.categoria);
            }
            
            if (filters.nivel) {
                query = query.eq('nivel', filters.nivel);
            }
            
            const { data, error } = await query.order('titulo');
            
            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            throw error;
        }
    }

    // REAL-TIME SUBSCRIPTIONS
    subscribeToTable(tableName, callback, filters = {}) {
        let subscription = supabase
            .channel(`${tableName}_changes`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: tableName,
                    ...filters
                }, 
                (payload) => {
                    console.log(`Mudança em ${tableName}:`, payload);
                    // Limpa cache relacionado
                    this.clearCache();
                    callback(payload);
                }
            )
            .subscribe();

        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    }
}

// Cria instância global
const dataService = new DataService();

// Exporta para uso
export { dataService };

// Também disponibiliza globalmente
window.dataService = dataService;

