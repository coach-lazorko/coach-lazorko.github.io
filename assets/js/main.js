const header = document.getElementById('header');
const nav = document.getElementById('nav');
const burger = document.querySelector('.burger');
const fab = document.querySelector('.fab');
const toTop = document.querySelector('.to-top');

/* ---------- Header shadow + floating button on scroll ---------- */
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 20);
  fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
  toTop.classList.toggle('is-visible', y > window.innerHeight * 1.5);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Back to top ---------- */
toTop.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  // кнопка зникає, тож переносимо фокус на логотип угорі
  document.querySelector('.brand').focus({ preventScroll: true });
});

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

/* ---------- Contact form → Cloudflare Worker → Telegram ---------- */
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
    const endpoint = form.getAttribute('action');
    if (!endpoint) {
      setStatus('Форму ще не підключено. Будь ласка, напишіть нам у Telegram або зателефонуйте.', 'error');
      return;
    }

    submit.disabled = true;
    setStatus('Надсилаємо…');
    try {
      const res = await fetch(endpoint, {
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

/* ---------- Videos ----------
   У data-video — посилання на YouTube (відео або Shorts), Instagram Reels чи файл .mp4.
   YouTube та .mp4 відкриваються у вікні на сайті, Instagram — в Instagram. */
const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function parseVideo(url) {
  if (!url) return null;
  let u;
  try { u = new URL(url, window.location.href); } catch { return null; }
  const host = u.hostname.replace(/^(www|m)\./, '');

  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const id = host === 'youtu.be'
      ? u.pathname.slice(1).split('/')[0]
      : u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/) || [])[1];
    if (id && /^[\w-]{6,}$/.test(id)) {
      return { type: 'youtube', id, vertical: u.pathname.startsWith('/shorts/') };
    }
  }
  if (host === 'instagram.com') {
    const m = u.pathname.match(/^\/(p|reels?|tv)\/([\w-]+)/);
    if (m) return { type: 'instagram', url: `https://www.instagram.com/${m[1] === 'p' ? 'p' : 'reel'}/${m[2]}/`, vertical: true };
  }
  if (/^https?:$/.test(u.protocol) && /\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return { type: 'file', src: u.href };
  return null;
}

const videoDialog = document.getElementById('video-dialog');
const videoFrame = videoDialog?.querySelector('.lightbox__frame');

function openVideo(html, vertical, title) {
  videoFrame.innerHTML = html;
  videoFrame.classList.toggle('is-vertical', vertical);
  videoDialog.showModal();
}

if (videoDialog) {
  videoDialog.querySelector('.lightbox__close').addEventListener('click', () => videoDialog.close());
  // клік по темному фону закриває відео
  videoDialog.addEventListener('click', (e) => {
    if (e.target === videoDialog) videoDialog.close();
  });
  // зупиняємо відтворення при закритті
  videoDialog.addEventListener('close', () => { videoFrame.innerHTML = ''; });
}

document.querySelectorAll('.video[data-video]').forEach((card) => {
  const info = parseVideo(card.dataset.video.trim());
  if (!info) return; // невідоме посилання — лишаємо заглушку

  const title = card.dataset.title || 'Відео';
  const safeTitle = escapeHtml(title);
  const play = '<span class="video__play"><svg aria-hidden="true"><use href="#i-play"/></svg></span>';
  const caption = `<span class="video__title">${safeTitle}</span>`;
  const isVertical = () => card.classList.contains('video--vertical') || 'vertical' in card.dataset;
  if (info.vertical) card.classList.add('video--vertical');

  if (info.type === 'instagram') {
    card.innerHTML = `
      <a class="video__btn video__btn--ig" href="${info.url}" target="_blank" rel="noopener"
         aria-label="Дивитись в Instagram: ${safeTitle}">
        <svg class="video__corner video__corner--left" aria-hidden="true"><use href="#i-instagram"/></svg>
        <svg class="video__corner video__corner--right" aria-hidden="true"><use href="#i-external"/></svg>
        ${play}${caption}
      </a>`;
    return;
  }

  let preview;
  let player;
  if (info.type === 'youtube') {
    preview = `<img src="https://i.ytimg.com/vi/${info.id}/hqdefault.jpg" alt="" loading="lazy">`;
    player = () => `<iframe src="https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&rel=0&playsinline=1"
      title="${safeTitle}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  } else {
    const src = escapeHtml(info.src);
    preview = `<video src="${src}#t=0.5" preload="metadata" muted playsinline></video>`;
    player = () => `<video src="${src}" controls autoplay playsinline></video>`;
  }

  card.innerHTML = `<button class="video__btn" type="button" aria-label="Дивитись: ${safeTitle}">${preview}${play}${caption}</button>`;
  card.querySelector('button').addEventListener('click', () => openVideo(player(), isVertical(), title));

  // для файлів орієнтацію визначаємо за самим відео
  const previewVideo = card.querySelector('video');
  if (previewVideo && !('vertical' in card.dataset)) {
    previewVideo.addEventListener('loadedmetadata', () => {
      card.classList.toggle('video--vertical', previewVideo.videoHeight > previewVideo.videoWidth);
    });
  }
});

/* ---------- Current year ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
