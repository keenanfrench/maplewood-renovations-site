// Maplewood Renovations — shared page behaviour
(function () {
  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll reveal
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  // Project filters
  const filters = document.querySelectorAll('.filter');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    document.querySelectorAll('.proj[data-cat]').forEach(p => {
      p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f);
    });
  }));

  // Demo contact form — portfolio concept, nothing is sent
  const form = document.querySelector('#quote-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector('.form-status');
      status.classList.add('show');
      status.focus();
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
