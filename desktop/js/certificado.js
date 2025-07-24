/**
 * Gerador de Certificados - Instituto Buriti
 * Funcionalidades: PDF, Personalização, Compartilhamento
 */

class CertificadoManager {
    constructor() {
        this.studentData = {
            name: 'Ana Silva Santos',
            course: 'Fundamentos da Inteligência Artificial',
            instructor: 'Dr. Carlos Mendes',
            hours: 40,
            grade: 8.5,
            completionDate: new Date(),
            verificationCode: 'IB-2025-IA-001234'
        };
        
        this.templates = {
            classic: 'Clássico',
            modern: 'Moderno',
            elegant: 'Elegante'
        };
        
        this.colorSchemes = {
            purple: 'Roxo (Padrão)',
            blue: 'Azul',
            green: 'Verde',
            gold: 'Dourado'
        };
        
        this.init();
    }

    init() {
        this.loadStudentData();
        this.setupEventListeners();
        this.updateCertificateData();
        this.verificarAutenticacao();
    }

    loadStudentData() {
        // Carregar dados do usuário logado
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                this.studentData.name = user.name;
            }
        }
        
        // Carregar dados do curso da URL ou localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course') || 'ia-fundamentos';
        
        // Simular dados do curso baseado no ID
        this.loadCourseData(courseId);
    }

    loadCourseData(courseId) {
        const courses = {
            'ia-fundamentos': {
                name: 'Fundamentos da Inteligência Artificial',
                instructor: 'Dr. Carlos Mendes',
                hours: 40,
                category: 'Tecnologia'
            },
            'gestao-cultural': {
                name: 'Gestão de Projetos Culturais',
                instructor: 'Maria Santos',
                hours: 30,
                category: 'Artes'
            },
            'educacao-inclusiva': {
                name: 'Educação Especial na Perspectiva Inclusiva',
                instructor: 'Prof. Ana Oliveira',
                hours: 35,
                category: 'Educação'
            }
        };
        
        if (courses[courseId]) {
            this.studentData.course = courses[courseId].name;
            this.studentData.instructor = courses[courseId].instructor;
            this.studentData.hours = courses[courseId].hours;
        }
    }

    setupEventListeners() {
        // Botões principais
        const downloadBtn = document.getElementById('downloadPdfBtn');
        const shareBtn = document.getElementById('shareBtn');
        const printBtn = document.getElementById('printBtn');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDF());
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.showShareModal());
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printCertificate());
        }

        // Personalização
        const templateSelect = document.getElementById('templateSelect');
        const colorScheme = document.getElementById('colorScheme');
        const includePhoto = document.getElementById('includePhoto');
        const paperSize = document.getElementById('paperSize');
        
        if (templateSelect) {
            templateSelect.addEventListener('change', () => this.updateTemplate());
        }
        
        if (colorScheme) {
            colorScheme.addEventListener('change', () => this.updateColorScheme());
        }
        
        if (includePhoto) {
            includePhoto.addEventListener('change', () => this.togglePhoto());
        }
        
        if (paperSize) {
            paperSize.addEventListener('change', () => this.updatePaperSize());
        }

        // Botões de personalização
        const previewBtn = document.getElementById('previewBtn');
        const generateBtn = document.getElementById('generateBtn');
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewChanges());
        }
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.applyChanges());
        }

        // Modal de compartilhamento
        this.setupShareModal();
    }

    setupShareModal() {
        const shareModal = document.getElementById('shareModal');
        const closeBtn = document.getElementById('closeShareModal');
        const copyBtn = document.getElementById('copyLinkBtn');
        
        // Botões de redes sociais
        const linkedinBtn = document.getElementById('shareLinkedIn');
        const facebookBtn = document.getElementById('shareFacebook');
        const twitterBtn = document.getElementById('shareTwitter');
        const whatsappBtn = document.getElementById('shareWhatsApp');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideShareModal());
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyLink());
        }
        
        if (linkedinBtn) {
            linkedinBtn.addEventListener('click', () => this.shareOnLinkedIn());
        }
        
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.shareOnFacebook());
        }
        
        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => this.shareOnTwitter());
        }
        
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.shareOnWhatsApp());
        }

        // Fechar modal clicando fora
        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                    this.hideShareModal();
                }
            });
        }
    }

    updateCertificateData() {
        // Atualizar nome do aluno
        const studentNameEl = document.getElementById('studentName');
        if (studentNameEl) {
            studentNameEl.textContent = this.studentData.name;
        }
        
        // Atualizar nome do curso
        const courseNameEl = document.getElementById('courseName');
        if (courseNameEl) {
            courseNameEl.textContent = this.studentData.course;
        }
        
        // Atualizar nota final
        const finalGradeEl = document.getElementById('finalGrade');
        if (finalGradeEl) {
            finalGradeEl.textContent = this.studentData.grade.toFixed(1).replace('.', ',');
        }
        
        // Atualizar datas
        this.updateDates();
        
        // Atualizar código de verificação
        const verificationCodeEl = document.getElementById('verificationCode');
        if (verificationCodeEl) {
            verificationCodeEl.textContent = this.studentData.verificationCode;
        }
        
        // Atualizar sidebar
        this.updateSidebar();
    }

    updateDates() {
        const completionDate = this.studentData.completionDate;
        
        // Data de conclusão (formato curto)
        const completionDateEl = document.getElementById('completionDate');
        if (completionDateEl) {
            completionDateEl.textContent = this.formatDate(completionDate, 'short');
        }
        
        // Data de conclusão (formato completo)
        const completionDateFullEl = document.getElementById('completionDateFull');
        if (completionDateFullEl) {
            completionDateFullEl.textContent = this.formatDate(completionDate, 'full');
        }
        
        // Data de emissão
        const issueDateEl = document.getElementById('issueDate');
        if (issueDateEl) {
            issueDateEl.textContent = this.formatDate(new Date(), 'short');
        }
    }

    updateSidebar() {
        // Atualizar resumo do curso na sidebar
        const summaryValues = document.querySelectorAll('.summary-value');
        if (summaryValues.length >= 5) {
            summaryValues[0].textContent = this.studentData.course;
            summaryValues[1].textContent = this.studentData.instructor;
            summaryValues[2].textContent = `${this.studentData.hours} horas`;
            summaryValues[3].textContent = this.formatDate(this.studentData.completionDate, 'short');
            summaryValues[4].textContent = this.studentData.grade.toFixed(1);
        }
    }

    formatDate(date, format = 'short') {
        const options = {
            short: {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            },
            full: {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        };
        
        const formatter = new Intl.DateTimeFormat('pt-BR', options[format]);
        return formatter.format(date);
    }

    async downloadPDF() {
        this.showLoading('Gerando seu certificado...');
        
        try {
            // Usar html2canvas para capturar o certificado
            const certificateElement = document.getElementById('certificateDocument');
            
            const canvas = await html2canvas(certificateElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            // Criar PDF com jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 297; // A4 landscape width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Download do PDF
            const fileName = `Certificado_${this.studentData.name.replace(/\s+/g, '_')}_${this.studentData.verificationCode}.pdf`;
            pdf.save(fileName);
            
            this.hideLoading();
            this.showNotification('Certificado baixado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.hideLoading();
            this.showNotification('Erro ao gerar o certificado. Tente novamente.', 'error');
        }
    }

    printCertificate() {
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        const certificateHTML = document.getElementById('certificateDocument').outerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificado - ${this.studentData.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    body { margin: 0; padding: 20px; }
                    ${this.getCertificateStyles()}
                </style>
            </head>
            <body>
                ${certificateHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    getCertificateStyles() {
        // Retornar estilos CSS específicos para o certificado
        return `
            .certificate-document {
                position: relative;
                background: white;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 60px 50px;
                border: 3px solid #8B5CF6;
                border-radius: 12px;
                font-family: 'Playfair Display', serif;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                min-height: 600px;
            }
            
            .certificate-title {
                font-size: 3rem;
                font-weight: 800;
                color: #1f2937;
                margin-bottom: 20px;
                font-family: 'Playfair Display', serif;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: center;
            }
            
            .student-name {
                font-size: 2.5rem;
                font-weight: 700;
                color: #8B5CF6;
                margin: 20px 0;
                font-family: 'Playfair Display', serif;
                text-decoration: underline;
                text-decoration-color: #F97316;
                text-underline-offset: 8px;
                text-align: center;
            }
            
            .course-name {
                font-size: 1.8rem;
                font-weight: 600;
                color: #1f2937;
                margin: 20px 0;
                font-family: 'Playfair Display', serif;
                font-style: italic;
                text-align: center;
            }
            
            .certificate-text {
                font-size: 1.2rem;
                color: #374151;
                margin-bottom: 15px;
                font-family: 'Inter', sans-serif;
                text-align: center;
            }
            
            .institution-name {
                font-size: 2rem;
                font-weight: 700;
                color: #8B5CF6;
                margin-bottom: 5px;
                font-family: 'Playfair Display', serif;
            }
        `;
    }

    updateTemplate() {
        const template = document.getElementById('templateSelect').value;
        const certificateDoc = document.getElementById('certificateDocument');
        
        // Remover classes de template anteriores
        certificateDoc.classList.remove('classic', 'modern', 'elegant');
        
        // Adicionar nova classe de template
        certificateDoc.classList.add(template);
        
        this.showNotification(`Template ${this.templates[template]} aplicado!`, 'success');
    }

    updateColorScheme() {
        const scheme = document.getElementById('colorScheme').value;
        const certificateDoc = document.getElementById('certificateDocument');
        
        // Remover classes de cor anteriores
        certificateDoc.classList.remove('purple', 'blue', 'green', 'gold');
        
        // Adicionar nova classe de cor
        if (scheme !== 'purple') {
            certificateDoc.classList.add(scheme);
        }
        
        this.showNotification(`Esquema de cores ${this.colorSchemes[scheme]} aplicado!`, 'success');
    }

    togglePhoto() {
        const includePhoto = document.getElementById('includePhoto').checked;
        
        if (includePhoto) {
            this.addStudentPhoto();
        } else {
            this.removeStudentPhoto();
        }
    }

    addStudentPhoto() {
        // Implementar adição de foto do aluno
        this.showNotification('Funcionalidade de foto em desenvolvimento', 'info');
    }

    removeStudentPhoto() {
        // Implementar remoção de foto do aluno
        const existingPhoto = document.querySelector('.student-photo');
        if (existingPhoto) {
            existingPhoto.remove();
        }
    }

    updatePaperSize() {
        const size = document.getElementById('paperSize').value;
        const certificateDoc = document.getElementById('certificateDocument');
        
        // Ajustar tamanho baseado na seleção
        switch (size) {
            case 'a4':
                certificateDoc.style.maxWidth = '800px';
                break;
            case 'letter':
                certificateDoc.style.maxWidth = '820px';
                break;
            case 'a3':
                certificateDoc.style.maxWidth = '1200px';
                break;
        }
        
        this.showNotification(`Tamanho ${size.toUpperCase()} aplicado!`, 'success');
    }

    previewChanges() {
        // Implementar preview das mudanças
        this.showNotification('Visualizando alterações...', 'info');
        
        // Simular preview
        setTimeout(() => {
            this.showNotification('Preview atualizado!', 'success');
        }, 1000);
    }

    applyChanges() {
        // Aplicar todas as mudanças
        this.updateTemplate();
        this.updateColorScheme();
        this.togglePhoto();
        this.updatePaperSize();
        
        this.showNotification('Todas as alterações foram aplicadas!', 'success');
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    copyLink() {
        const linkInput = document.getElementById('certificateLink');
        if (linkInput) {
            linkInput.select();
            document.execCommand('copy');
            this.showNotification('Link copiado para a área de transferência!', 'success');
        }
    }

    shareOnLinkedIn() {
        const text = `Acabei de concluir o curso "${this.studentData.course}" no Instituto Buriti! 🎓`;
        const url = `https://institutoburiti.com.br/certificado/verify/${this.studentData.verificationCode}`;
        
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        window.open(linkedinUrl, '_blank');
    }

    shareOnFacebook() {
        const url = `https://institutoburiti.com.br/certificado/verify/${this.studentData.verificationCode}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
    }

    shareOnTwitter() {
        const text = `Acabei de concluir o curso "${this.studentData.course}" no @InstitutoBuriti! 🎓 #Educacao #Certificado`;
        const url = `https://institutoburiti.com.br/certificado/verify/${this.studentData.verificationCode}`;
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
    }

    shareOnWhatsApp() {
        const text = `🎓 Acabei de concluir o curso "${this.studentData.course}" no Instituto Buriti!\n\nVeja meu certificado: https://institutoburiti.com.br/certificado/verify/${this.studentData.verificationCode}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }

    showLoading(message = 'Carregando...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('p');
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        if (overlay) {
            overlay.style.display = 'block';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    verificarAutenticacao() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                this.atualizarInterfaceUsuario(user);
            }
        } else {
            setTimeout(() => {
                if (confirm('Você precisa estar logado para acessar seu certificado. Deseja fazer login agora?')) {
                    window.location.href = 'login-aluno.html';
                }
            }, 2000);
        }
    }

    atualizarInterfaceUsuario(user) {
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                ${user.name}
                <i class="fas fa-chevron-down"></i>
            `;
        }

        const dropdownContent = document.querySelector('.dropdown-content');
        if (dropdownContent) {
            dropdownContent.innerHTML = `
                <a href="${this.getDashboardPage(user.role)}" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" class="dropdown-item" onclick="authManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            `;
        }
    }

    getDashboardPage(role) {
        const pages = {
            'aluno': 'dashboard-aluno.html',
            'instrutor': 'dashboard-instrutor.html',
            'admin': 'dashboard-admin.html'
        };
        return pages[role] || 'dashboard-aluno.html';
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 300px;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 4000);
        }
    }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.certificadoManager = new CertificadoManager();
});

// Exportar para uso global
window.CertificadoManager = CertificadoManager;

