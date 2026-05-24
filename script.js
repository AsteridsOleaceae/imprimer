// =========================
// Utility Helpers
// =========================

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const trapFocus = (container) => {
  const focusable = $$(
    'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    container
  );

  if (focusable.length === 0) return;

  let index = 0;
  focusable[0].focus();

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;

    e.preventDefault();
    index = e.shiftKey ? (index - 1 + focusable.length) % focusable.length
                       : (index + 1) % focusable.length;
    focusable[index].focus();
  };

  container.addEventListener('keydown', handleTab);
  return () => container.removeEventListener('keydown', handleTab);
};


// =========================
// Navigation Menu
// =========================

const hamburger = $('.hamburger');
const navMenu = $('.nav-menu');

const toggleNavMenu = () => {
  if (!hamburger || !navMenu) return;

  const isVisible = navMenu.classList.toggle('visible');
  hamburger.setAttribute('aria-expanded', isVisible);
};

hamburger?.addEventListener('click', toggleNavMenu, { passive: true });

document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-menu a[href^="#"]');
  if (!link) return;

  const target = $(link.getAttribute('href'));
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });

  navMenu?.classList.remove('visible');
  hamburger?.setAttribute('aria-expanded', 'false');
});


// =========================
// Project Filtering
// =========================

const filterProjects = (category) => {
  $$('[data-category]').forEach((project) => {
    project.hidden = !(category === 'all' || project.dataset.category === category);
  });
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  $$('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  filterProjects(btn.dataset.filter);
});


// =========================
// Lightbox
// =========================

const openLightbox = (src, alt) => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.role = 'dialog';
  modal.ariaModal = 'true';
  modal.ariaLabel = 'Image viewer modal';

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <img src="${src}" alt="${alt}" class="modal-image">
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
    releaseFocus?.();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-close')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', handleEscape);

  // Trap focus inside modal
  const releaseFocus = trapFocus(modal);
};

const initLightbox = () => {
  $$('[data-category] img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
};

initLightbox();


// =========================
// Contact Form Validation
// =========================

const initContactFormValidation = () => {
  const form = $('#contact-form') || $('.contact-form');
  if (!form) return;

  const fields = {
    name: $('[name="name"]', form),
    email: $('[name="email"]', form),
    message: $('[name="message"]', form)
  };

  const createFeedback = (field) => {
    let fb = field.nextElementSibling;
    if (!fb || !fb.classList.contains('field-feedback')) {
      fb = document.createElement('div');
      fb.className = 'field-feedback';
      fb.role = 'alert';
      fb.ariaLive = 'polite';
      field.insertAdjacentElement('afterend', fb);
    }
    return fb;
  };

  const validators = {
    name: (v) => v.length > 0 || 'Name is required.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email.',
    message: (v) => v.length >= 10 || 'Message must be at least 10 characters.'
  };

  const validateField = (field) => {
    const value = field.value.trim();
    const fb = createFeedback(field);
    const rule = validators[field.name];
    const result = rule(value);

    if (result !== true) {
      fb.textContent = result;
      field.setAttribute('aria-invalid', 'true');
      return false;
    }

    fb.textContent = '✓ Looks good!';
    field.removeAttribute('aria-invalid');
    return true;
  };

  Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', (e) => {
    const valid = Object.values(fields).every(validateField);
    if (!valid) {
      e.preventDefault();
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
    }
  });
};

initContactFormValidation();
