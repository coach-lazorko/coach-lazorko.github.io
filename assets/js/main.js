const header = document.getElementById('header');
const nav = document.getElementById('nav');
const burger = document.querySelector('.burger');
const fab = document.querySelector('.fab');

/* ---------- Header shadow + floating button on scroll ---------- */
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 20);
  fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
function setMenu(open) {
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
});

/* ---------- Reveal on scroll ---------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((el) => revealObserver.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Active menu item ---------- */
const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObserver.observe(s));
}

/* ---------- Contact form (Formspree) ---------- */
const form = document.getElementById('contact-form');
if (form) {
  const status = form.querySelector('.form__status');
  const submit = form.querySelector('button[type="submit"]');

  const setStatus = (text, type = '') => {
    status.textContent = text;
    status.className = `form__status${type ? ` is-${type}` : ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (form.action.includes('YOUR_FORM_ID')) {
      setStatus('Форму ще не підключено. Будь ласка, напишіть нам у Telegram або зателефонуйте.', 'error');
      return;
    }

    submit.disabled = true;
    setStatus('Надсилаємо…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus('Дякуємо! Заявку надіслано — ми зв’яжемося з вами найближчим часом.', 'success');
    } catch {
      setStatus('Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у Telegram.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

/* ---------- Current year ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
