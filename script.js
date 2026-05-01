/* SeaFor — minimal client behavior. No localStorage. No tracking. */

(function () {
  // --- Brand swap: a single source of truth driven by window.BRAND -------------
  var brand = window.BRAND || {};
  if (brand.shortName) {
    document.querySelectorAll('[data-brand-name]').forEach(function (el) {
      el.textContent = brand.shortName;
    });
  }
  if (brand.longName) {
    document.querySelectorAll('[data-brand-long]').forEach(function (el) {
      el.textContent = brand.longName;
    });
  }
  if (brand.contactEmail) {
    document.querySelectorAll('[data-brand-email]').forEach(function (el) {
      el.textContent = brand.contactEmail;
    });
    document.querySelectorAll('[data-brand-mailto]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + brand.contactEmail);
    });
  }

  // --- External links open in new tabs ----------------------------------------
  var here = location.host;
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      if (u.host && u.host !== here) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    } catch (_) { /* ignore */ }
  });

  // --- Year --------------------------------------------------------------------
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // --- Theme toggle (session-only, no persistence per requirements) -----------
  var html = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0E0F0C' : '#F4F1EA');
  }

  // Honor system preference at first load.
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Sticky header shadow on scroll -----------------------------------------
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Reveal on scroll --------------------------------------------------------
  var revealTargets = [
    '.hero-headline', '.hero-deck', '.hero-cta', '.hero-seed',
    '.section-head', '.display-2', '.display-1',
    '.why-body', '.work-card', '.opp-text', '.plate', '.opp-timeline',
    '.tracker-card', '.tracker-foot', '.support-points', '.pullquote',
    '.contact-cta', '.contact-list'
  ];
  var revealEls = document.querySelectorAll(revealTargets.join(','));
  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    // Slight stagger for cards
    if (el.classList.contains('work-card') || el.classList.contains('sp')) {
      el.style.transitionDelay = (i % 5) * 60 + 'ms';
    }
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
