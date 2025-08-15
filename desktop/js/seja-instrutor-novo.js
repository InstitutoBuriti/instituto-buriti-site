// Seja um Instrutor JavaScript - Versão Premium e Não Invasiva

document.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimations();
  initializeCTAButtons();
  initializeHoverEffects();
  initializeInstructorForm();
  randomizeFloatingDots();
});

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* =========================
   Animações on-scroll
   ========================= */
function initializeScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in');
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  const animatable = document.querySelectorAll(
    '.benefit-card, .step-card, .requirement-item, .apply-form, .cta-content'
  );
  animatable.forEach((el) => observer.observe(el));
}

/* =========================
   CTA -> rolagem suave (com offset do header)
   ========================= */
function initializeCTAButtons() {
  const ctas = document.querySelectorAll('.cta-button[href^="#"]');
  ctas.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = getTopWithHeaderOffset(target);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

function getTopWithHeaderOffset(el) {
  const header = document.querySelector('header, .header');
  const headerHeight = header?.offsetHeight || 0;
  return el.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
}

/* =========================
   Hovers das imagens
   ========================= */
function initializeHoverEffects() {
  const imgs = document.querySelectorAll('.instructor-main, .instructor-floating');
  imgs.forEach((image) => {
    image.addEventListener('mouseenter', function () {
      this.style.transition = 'transform 0.25s ease';
      this.style.transform = this.classList.contains('instructor-main')
        ? 'translate(-50%, -50%) scale(1.05) rotate(2deg)'
        : 'scale(1.05) rotate(-2deg)';
    });
    image.addEventListener('mouseleave', function () {
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

  // Botão com ripple (usa --x/--y já estilizado no CSS)
  const submitBtn = form.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('pointerdown', (e) => {
      const rect = submitBtn.getBoundingClientRect();
      submitBtn.style.setProperty('--x', `${e.clientX - rect.left}px`);
      submitBtn.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  }

  // Limpa mensagens ao digitar/mudar
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('change', () => clearError(field));
  });

  // Validação e envio
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const lgpd = form.querySelector('#lgpd');

    const required = [
      'nome',
      'email',
      'telefone',
      'area',
      'bio',
      'tituloCurso',
      'categoriaCurso',
      'cargaHoraria',
      'nivelCurso',
      'resumo',
    ];

    let valid = true;
    clearAllErrors(form);

    // Campos obrigatórios
    for (const name of required) {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field || !String(field.value).trim()) {
        setError(field, 'Campo obrigatório.');
        valid = false;
      }
    }

    // E-mail
    const email = form.email?.value?.trim() || '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(form.email, 'Informe um e-mail válido.');
      valid = false;
    }

    // Telefone (mínimo dígitos úteis)
    const tel = form.telefone?.value?.replace(/[^\d]/g, '') || '';
    if (tel.length < 10) {
      setError(form.telefone, 'Informe um WhatsApp válido (DDD + número).');
      valid = false;
    }

    // Carga horária
    const carga = Number(form.cargaHoraria?.value || 0);
    if (!Number.isFinite(carga) || carga < 1) {
      setError(form.cargaHoraria, 'Informe um número válido (mínimo 1h).');
      valid = false;
    }

    // LGPD
    if (!lgpd?.checked) {
      setError(lgpd, 'É necessário aceitar a autorização de uso de dados.');
      valid = false;
    }

    // Modalidade
    const modalidades = form.querySelectorAll('input[name="modalidade"]:checked');
    if (modalidades.length === 0) {
      const row = form.querySelector('.checkbox-row');
      const msg = row?.parentElement?.querySelector('.error-msg');
      if (msg) msg.textContent = 'Selecione pelo menos uma modalidade.';
      row?.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (!valid) {
      // foca e rola para o primeiro erro
      focusFirstError(form);
      notify('Por favor, corrija os campos destacados.', 'warning');
      return;
    }

    // Payload
    const payload = {
      nome: data.get('nome')?.toString().trim(),
      email: data.get('email')?.toString().trim(),
      telefone: form.telefone?.value?.trim(),
      linkedin: data.get('linkedin')?.toString().trim() || null,
      area: data.get('area'),
      bio: data.get('bio')?.toString().trim(),
      proposta: {
        titulo: data.get('tituloCurso')?.toString().trim(),
        categoria: data.get('categoriaCurso'),
        cargaHoraria: carga,
        nivel: data.get('nivelCurso'),
        modalidade: Array.from(modalidades).map((i) => i.value),
        resumo: data.get('resumo')?.toString().trim(),
      },
      consentLGPD: !!lgpd?.checked,
      submittedAt: new Date().toISOString(),
      page: location.href,
    };

    // Envio
    const endpoint = form.dataset.endpoint;
    try {
      setSubmitting(true);
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Falha ao enviar inscrição. (${res.status})`);
      } else {
        // Sem endpoint configurado, apenas loga
        console.debug('[instrutor] payload', payload);
      }

      form.reset();
      // remove marcas de erro visuais
      clearAllErrors(form);

      // Acessibilidade: anunciar sucesso
      ariaAnnounce('Inscrição enviada com sucesso!');
      notify('Inscrição enviada com sucesso! Em breve entraremos em contato.', 'success');

      // Foco no topo do formulário
      const topForm = form.querySelector('h2, .section-title') || form;
      topForm.setAttribute('tabindex', '-1');
      topForm.focus({ preventScroll: true });
      window.scrollTo({ top: getTopWithHeaderOffset(topForm), behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      ariaAnnounce('Não foi possível enviar agora. Tente novamente mais tarde.');
      notify('Não foi possível enviar agora. Tente novamente mais tarde.', 'error');
    } finally {
      setSubmitting(false);
    }

    // helpers locais
    function setSubmitting(isOn) {
      if (!submitBtn) return;
      submitBtn.disabled = isOn;
      submitBtn.setAttribute('aria-busy', String(isOn));
      submitBtn.style.filter = isOn ? 'saturate(0.85) brightness(0.98)' : '';
      if (isOn) {
        submitBtn.dataset._text = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
      } else if (submitBtn.dataset._text) {
        submitBtn.textContent = submitBtn.dataset._text;
        delete submitBtn.dataset._text;
      }
    }
  });

  // ===== Helpers de erro/UX =====
  function setError(field, message) {
    if (!field) return;
    const wrap = field.closest('.form-group') || field.parentElement;
    const small = wrap?.querySelector('.error-msg');
    if (small) small.textContent = message || 'Campo inválido.';
    field.setAttribute('aria-invalid', 'true');
    wrap?.classList.add('has-error');
  }

  function clearError(field) {
    if (!field) return;
    const wrap = field.closest('.form-group') || field.parentElement;
    const small = wrap?.querySelector('.error-msg');
    if (small) small.textContent = '';
    field.removeAttribute('aria-invalid');
    wrap?.classList.remove('has-error');
  }

  function clearAllErrors(scope) {
    scope.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
    scope.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
    scope.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));
  }

  function focusFirstError(scope) {
    const firstInvalid =
      scope.querySelector('[aria-invalid="true"], .checkbox-row[aria-invalid="true"]') ||
      scope.querySelector(':invalid');
    if (!firstInvalid) return;

    const container = firstInvalid.closest('.form-group') || firstInvalid;
    const y = getTopWithHeaderOffset(container);
    window.scrollTo({ top: y, behavior: 'smooth' });

    // dar um tempinho pro scroll antes do foco
    setTimeout(() => {
      (firstInvalid instanceof HTMLElement ? firstInvalid : container).focus?.({ preventScroll: true });
    }, 250);
  }
}

/* =========================
   Util: notificação + ARIA
   ========================= */
function notify(message, type) {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // fallback simples e não intrusivo
    console.log(`[notify:${type}]`, message);
    alert(message);
  }
}

function ariaAnnounce(text) {
  let live = document.getElementById('aria-live-region');
  if (!live) {
    live = document.createElement('div');
    live.id = 'aria-live-region';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.style.position = 'absolute';
    live.style.left = '-9999px';
    live.style.width = '1px';
    live.style.height = '1px';
    document.body.appendChild(live);
  }
  live.textContent = '';
  // força atualização
  setTimeout(() => (live.textContent = text), 50);
}

/* =========================
   Dots flutuantes (variações)
   ========================= */
function randomizeFloatingDots() {
  const floatingDots = document.querySelectorAll('.dot');
  floatingDots.forEach((dot) => {
    const randomDelay = Math.random() * 2;
    const randomDuration = 3 + Math.random() * 2;
    dot.style.animationDelay = `${randomDelay}s`;
    dot.style.animationDuration = `${randomDuration}s`;
  });
}
