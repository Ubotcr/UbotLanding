// ── Footer year ──────────────────────────────────────────
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ── Mobile menu toggle ──────────────────────────────────
const toggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  if (mobileMenu && toggle) {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
}

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
