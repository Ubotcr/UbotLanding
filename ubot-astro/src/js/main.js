const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getPreferredTheme() {
  return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.setAttribute('aria-label', `Activar tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`);
  themeToggle.setAttribute('title', `Cambiar a tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`);
}

function initFooterScripts() {
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
}

function closeMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenu || !toggle) return;

  mobileMenu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
}

function initNavScripts() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const themeToggle = document.getElementById('theme-toggle');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    document.addEventListener('click', (event) => {
      if (!toggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });

    mobileMenu.querySelectorAll('.mobile-menu-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }
}

function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!fadeElements.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    fadeElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observerInstance.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  fadeElements.forEach((element) => observer.observe(element));
}

function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });

      const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(entry.target.id)
        : entry.target.id.replace(/[^a-zA-Z0-9-_]/g, '');
      const active = document.querySelector(`.nav-links a[href="/#${escapedId}"], .nav-links a[href="#${escapedId}"]`);
      if (!active) return;

      active.classList.add('is-active');
      active.setAttribute('aria-current', 'page');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));
}

function initFAQ() {
  const faqButtons = document.querySelectorAll('.faq-question');
  if (!faqButtons.length) return;

  faqButtons.forEach((button) => {
    const item = button.closest('.faq-item');
    const answer = item?.querySelector('.faq-answer');

    button.setAttribute('aria-expanded', 'false');
    if (answer) {
      answer.setAttribute('hidden', '');
    }

    button.addEventListener('click', () => {
      const currentItem = button.closest('.faq-item');
      if (!currentItem) return;

      const isAlreadyOpen = currentItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((faqItem) => {
        const faqButton = faqItem.querySelector('.faq-question');
        const faqAnswer = faqItem.querySelector('.faq-answer');
        faqItem.classList.remove('active');
        faqButton?.setAttribute('aria-expanded', 'false');
        faqAnswer?.setAttribute('hidden', '');
      });

      if (isAlreadyOpen) return;

      currentItem.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      answer?.removeAttribute('hidden');
    });
  });
}

function initGalleryModal() {
  const slider = document.querySelector('.gallery-slider');
  if (!slider) return;

  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <button class="close-modal" aria-label="Cerrar imagen ampliada" type="button">&times;</button>
    <img class="image-modal-content" alt="Vista ampliada de captura de Ubot">
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector('.image-modal-content');
  const closeButton = modal.querySelector('.close-modal');
  const closeDelay = prefersReducedMotion ? 0 : 300;

  const closeModal = () => {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => {
      modal.style.display = 'none';
    }, closeDelay);
  };

  slider.addEventListener('click', (event) => {
    const image = event.target.closest('.swiper-slide-active img');
    if (!image || !modalImage) return;

    modalImage.src = image.src;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    window.setTimeout(() => modal.classList.add('show'), 10);
  });

  closeButton?.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('close-modal')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

function initSwiper() {
  if (typeof Swiper === 'undefined' || !document.querySelector('.gallery-slider')) return;

  new Swiper('.gallery-slider', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    slideToClickedSlide: true,
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 150,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: prefersReducedMotion
      ? false
      : {
          delay: 5000,
          disableOnInteraction: false,
        },
  });
}

const initialTheme = getPreferredTheme();
document.documentElement.setAttribute('data-theme', initialTheme);

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(initialTheme);
  initNavScripts();
  initFooterScripts();
  initSwiper();
  initGalleryModal();
  initScrollAnimations();
  initActiveNavHighlight();
  initFAQ();
});
