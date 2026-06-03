/* SeaFor: minimal client behavior. No persistent storage. No tracking. */

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

/* Contact page: form handling (graceful, no backend) */
(function () {
  var form = document.getElementById('ctaForm');
  if (!form) return;
  var status = document.getElementById('formStatus');
  var brand = window.BRAND || {};
  var to = brand.contactEmail || 'founders@seafor.org';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.classList.remove('is-success', 'is-error');

    var data = new FormData(form);
    var name = (data.get('name') || '').toString().trim();
    var email = (data.get('email') || '').toString().trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Add your name and a real email and try again.';
      status.classList.add('is-error');
      return;
    }

    var role = (data.get('role') || 'unspecified').toString();
    var affiliation = (data.get('affiliation') || '').toString().trim();
    var phone = (data.get('phone') || '').toString().trim();
    var message = (data.get('message') || '').toString().trim();
    var discreet = data.get('discreet') ? 'Yes' : 'No';

    var subject = 'SeaFor inquiry · ' + role + ' · ' + name;
    var body = [
      'Name: ' + name,
      'Email: ' + email,
      affiliation ? 'Affiliation: ' + affiliation : null,
      phone ? 'Phone: ' + phone : null,
      'Role: ' + role,
      'Discreet: ' + discreet,
      '',
      message || '(no message)'
    ].filter(Boolean).join('\n');

    var href = 'mailto:' + to +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    // Open the user's mail client. The site stays static, no third party.
    window.location.href = href;

    status.textContent = "Opening your email client. If nothing happens, write to " + to + " directly.";
    status.classList.add('is-success');
  });
})();

/* Donor contact form (sits under the Anedot donation iframe) */
(function () {
  var widget = document.querySelector('.donate-widget');
  if (!widget) return;

  // --- Donor contact box: opens the user's mail client to info@seafor.live ----
  var msgForm = document.getElementById('donateMsg');
  if (msgForm) {
    var msgStatus = document.getElementById('donateMsgStatus');
    var donorTo = 'info@seafor.live';
    msgForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (msgStatus) msgStatus.classList.remove('is-success', 'is-error');

      var data = new FormData(msgForm);
      var email = (data.get('donateEmail') || '').toString().trim();
      var message = (data.get('donateMessage') || '').toString().trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
        if (msgStatus) {
          msgStatus.textContent = 'Add a real email and a short message, then try again.';
          msgStatus.classList.add('is-error');
        }
        return;
      }

      var subject = 'SeaFor · message from ' + email;
      var body = ['From: ' + email, '', message].join('\n');
      var href = 'mailto:' + donorTo +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = href;

      if (msgStatus) {
        msgStatus.textContent = 'Opening your email client. If nothing happens, write to ' + donorTo + ' directly.';
        msgStatus.classList.add('is-success');
      }
    });
  }
})();
