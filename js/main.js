// ── Component Loading ────────────────────────────────────
function loadComponents() {
  const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
  
  const loadNav = fetch(basePath + 'components/nav.html')
    .then(response => response.text())
    .then(data => {
      const ph = document.getElementById('nav-placeholder');
      if (ph) {
        ph.outerHTML = data.replace(/(href|src)="\//g, `$1="${basePath}`);
        initNavScripts();
      }
    }).catch(err => console.error("Error loading nav:", err));

  const loadFooter = fetch(basePath + 'components/footer.html')
    .then(response => response.text())
    .then(data => {
      const ph = document.getElementById('footer-placeholder');
      if (ph) {
        ph.outerHTML = data.replace(/(href|src)="\//g, `$1="${basePath}`);
        initFooterScripts();
      }
    }).catch(err => console.error("Error loading footer:", err));

  return Promise.all([loadNav, loadFooter]);
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initSwiper();
  initGalleryModal();
});

// ── Gallery Modal (Click to zoom) ────────────────────────
function initGalleryModal() {
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <span class="close-modal">&times;</span>
    <img class="image-modal-content">
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.image-modal-content');
  const closeBtn = modal.querySelector('.close-modal');

  // Listen for clicks on the active slide's image
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.swiper-slide-active')) {
      modalImg.src = e.target.src;
      modal.style.display = 'flex';
      // Use small timeout to allow display:flex to apply before adding class for transition
      setTimeout(() => modal.classList.add('show'), 10);
    }
  });

  // Function to close modal
  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300); // 300ms matches CSS transition
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    // Close if clicked outside the image
    if (e.target !== modalImg) {
      closeModal();
    }
  });
}

// ── Swiper Initialization ────────────────────────────────
function initSwiper() {
  if (typeof Swiper !== 'undefined' && document.querySelector('.gallery-slider')) {
    new Swiper('.gallery-slider', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      slideToClickedSlide: true, // Permite hacer click en la foto anterior/siguiente para cambiar
      observer: true,
      observeParents: true,
      watchSlidesProgress: true, // Añadido para corregir problemas de visibilidad de las siguientes fotos
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
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      }
    });
  }
}

// ── Footer year ──────────────────────────────────────────
function initFooterScripts() {
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}

// ── Mobile menu toggle ──────────────────────────────────
function closeMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && toggle) {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
}

// Ensure the function is globally available for inline onclicks
window.closeMobileMenu = closeMobileMenu;

function initNavScripts() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // ── Theme Toggle ──
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      let targetTheme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
    });
  }
}

// Initialize theme early to prevent flashing
const initTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initTheme);

// ── Scroll-triggered fade-in ─────────────────────────────
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(function (el) {
  observer.observe(el);
});

// ── Smooth active nav highlight ──────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

if (navLinks.length > 0) {
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          link.style.color = '';
        });
        var active = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
        if (active) { active.style.color = 'var(--primary)'; }
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (s) { sectionObserver.observe(s); });
}

// ── FAQ accordion toggle ─────────────────────────────────
document.querySelectorAll('.faq-question').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq-item');
    var isActive = item.classList.contains('active');

    // Close all other items
    document.querySelectorAll('.faq-item.active').forEach(function (activeItem) {
      activeItem.classList.remove('active');
    });

    // Toggle current item
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

