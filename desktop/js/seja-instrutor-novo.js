// Seja um Instrutor JavaScript - Versão Corrigida e Completa (não invasiva)

document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializeCTAButtons();
    initializeHoverEffects();
    initializeInstructorForm(); // NOVO: validação e submissão
});

/* =========================
   Animações on-scroll
   ========================= */
function initializeScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('animate-in'));
    }, observerOptions);

    const animatable = document.querySelectorAll('.benefit-card, .step-card, .requirement-item, .apply-form, .cta-content');
    animatable.forEach(el => observer.observe(el));
}

/* =========================
   CTA -> rolagem suave
   ========================= */
function initializeCTAButtons() {
    const ctas = document.querySelectorAll('.cta-button[href^="#"]');
    ctas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('header, .header')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* =========================
   Hovers das imagens
   ========================= */
function initializeHoverEffects() {
    const instructorImages = document.querySelectorAll('.instructor-main, .instructor-floating');
    instructorImages.forEach(image => {
        image.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.25s ease';
            this.style.transform = this.classList.contains('instructor-main') 
                ? 'translate(-50%, -50%) scale(1.05) rotate(2deg)'
                : 'scale(1.05) rotate(-2deg)';
        });
        image.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('instructor-main')
                ? 'translate(-50%, -50%) scale(1) rotate(0deg)'
                : 'scale(1) rotate(0deg)';
        });
    });
}

/* =========================
   Formulário do Instrutor
   ========================= */
function initializeInstructorForm() {
    const form = document.getElementById('instructorForm');
    if (!form) return;

    // Validação simples de campos obrigatórios + LGPD
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const data = new FormData(form);
        const requiredFields = [
            'nome','email','telefone','area','bio',
            'tituloCurso','categoriaCurso','cargaHoraria','nivelCurso','resumo'
        ];
        let valid = true;

        // Limpa mensagens
        form.querySelectorAll('.error-msg').forEach(s => s.textContent = '');

        // Campos obrigatórios
        requiredFields.forEach(name => {
            const field = form.querySelector(`[name="${name}"]`);
            if (!field || !String(field.value).trim()) {
                setError(field, 'Campo obrigatório.');
                valid = false;
            }
        });

        // E-mail
        const email = form.email?.value || '';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError(form.email, 'Informe um e-mail válido.');
            valid = false;
        }

        // LGPD
        const lgpd = form.querySelector('#lgpd');
        if (!lgpd?.checked) {
            setError(lgpd, 'É necessário aceitar a autorização de uso de dados.');
            valid = false;
        }

        // Modalidade (pelo menos 1)
        const modalidades = form.querySelectorAll('input[name="modalidade"]:checked');
        if (modalidades.length === 0) {
            const box = form.querySelector('.checkbox-row');
            const msg = box?.parentElement?.querySelector('.error-msg');
            if (msg) msg.textContent = 'Selecione pelo menos uma modalidade.';
            valid = false;
        }

        if (!valid) {
            notify('Por favor, corrija os campos destacados.', 'warning');
            return;
        }

        // Monta payload
        const payload = {
            nome: data.get('nome'),
            email: data.get('email'),
            telefone: data.get('telefone'),
            linkedin: data.get('linkedin'),
            area: data.get('area'),
            bio: data.get('bio'),
            proposta: {
                titulo: data.get('tituloCurso'),
                categoria: data.get('categoriaCurso'),
                cargaHoraria: Number(data.get('cargaHoraria')),
                nivel: data.get('nivelCurso'),
                modalidade: Array.from(form.querySelectorAll('input[name="modalidade"]:checked')).map(i => i.value),
                resumo: data.get('resumo')
            },
            consentLGPD: !!lgpd?.checked,
            submittedAt: new Date().toISOString()
        };

        // Estratégia: se existir data-endpoint no form, envia; senão, apenas loga e confirma.
        const endpoint = form.dataset.endpoint;
        try {
            if (endpoint) {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Falha ao enviar inscrição.');
            } else {
                // Sem endpoint configurado: apenas log e sucesso
                console.debug('[instrutor] payload', payload);
            }

            form.reset();
            notify('Inscrição enviada com sucesso! Em breve entraremos em contato.', 'success');

            // Foco para acessibilidade
            const topForm = form.querySelector('h2, .section-title') || form;
            topForm.setAttribute('tabindex', '-1');
            topForm.focus({ preventScroll: true });

        } catch (err) {
            console.error(err);
            notify('Não foi possível enviar agora. Tente novamente mais tarde.', 'error');
        }
    });

    // Ajudantes
    function setError(field, message) {
        if (!field) return;
        const wrap = field.closest('.form-group') || field.parentElement;
        const small = wrap?.querySelector('.error-msg');
        if (small) small.textContent = message || 'Campo inválido.';
    }
}

/* =========================
   Util: notificação
   ========================= */
function notify(message, type) {
    // Usa o showNotification do main.js se existir, senão fallback para alert.
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

/* =========================
   Estilos de apoio (não invasivos)
   ========================= */
const style = document.createElement('style');
style.textContent = `
    .animate-in { animation: slideUpFade 0.6s ease-out forwards; opacity: 0; }
    @keyframes slideUpFade { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }

    .apply-section { padding: 60px 0; background: #f8fafc; }
    .apply-form { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.05); }
    .form-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:16px; }
    .form-group { display:flex; flex-direction:column; gap:8px; }
    .form-group input, .form-group select, .form-group textarea {
        padding:12px 14px; border:1px solid #e2e8f0; border-radius:10px; font:inherit; outline:none;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:#8B5CF6; box-shadow:0 0 0 3px rgba(139,92,246,0.15); }
    .error-msg { color:#dc2626; font-size:.85rem; min-height: 1em; }

    .proposal-fieldset { border:1px dashed #e2e8f0; border-radius:12px; padding:16px; margin:12px 0 8px; }
    .proposal-fieldset legend { padding:0 8px; font-weight:700; color:#374151; }

    .checkbox-row { display:flex; gap:16px; flex-wrap:wrap; }
    .checkbox-row input { transform: translateY(1px); margin-right:6px; }

    .rules-box { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin:12px 0; }
    .rules-box h4 { margin:0 0 8px; font-weight:700; color:#1f2937; }
    .rules-box ul { margin:0; padding-left:18px; color:#64748b; }

    .consent { margin-top:8px; }
    .form-submit { display:flex; align-items:center; gap:16px; margin-top:12px; }
    .submit-btn { background:linear-gradient(135deg,#8B5CF6,#7C3AED); color:#fff; border:none; padding:12px 18px; border-radius:10px; font-weight:700; cursor:pointer; }
    .submit-btn:hover { transform: translateY(-1px); box-shadow:0 10px 24px rgba(124,58,237,0.25); }
    .form-note { color:#64748b; font-size:.9rem; }

    @media (max-width: 768px){
        .form-grid { grid-template-columns: 1fr; }
    }
`;
document.head.appendChild(style);

/* =========================
   Dots flutuantes
   ========================= */
window.addEventListener('DOMContentLoaded', () => {
    const floatingDots = document.querySelectorAll('.dot');
    floatingDots.forEach((dot) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 2;
        dot.style.animationDelay = `${randomDelay}s`;
        dot.style.animationDuration = `${randomDuration}s`;
    });
});

/* Marca página como carregada (se usado em CSS) */
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
