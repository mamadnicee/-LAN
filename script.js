const CONFIG = {
  gallery: [
    // { img: 'g1',  label: 'Signature Glow' },
    // { img: 'g2',  label: 'Velvet Matte' },
    // { img: 'g3',  label: 'Rose Elixir' },
    // { img: 'g4',  label: 'Pure Radiance' },
    // { img: 'g5',  label: 'Silk Serum' },
    // { img: 'g6',  label: 'Golden Hour' },
    // { img: 'g7',  label: 'Cloud Blush' },
    // { img: 'g8',  label: 'Aurora Mist' },
    // { img: 'g9',  label: 'Crystal Dew' },
    // { img: 'g10', label: 'Night Bloom' }
  ]
};

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const imgPath = n => `assets/images/${n}.jpg`;

function renderGallery() {
  const track = $('#galleryTrack');
  const dots  = $('#galleryDots');
  const empty = $('#galleryEmpty');
  const nav   = $('#galleryNav');
  if (!track) return;

  if (!CONFIG.gallery.length) {
    if (empty) empty.style.display = 'flex';
    if (nav) nav.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (nav) nav.style.display = 'flex';

  track.innerHTML = CONFIG.gallery.map((g, i) => `
    <div class="gallery-item" data-index="${i}">
      <img src="${imgPath(g.img)}" alt="${g.label || ''}" loading="lazy" draggable="false"
           onerror="this.parentElement.style.background='linear-gradient(135deg,#c9f1a8,#e02b52)';this.style.display='none'">
    </div>
  `).join('');

  if (dots) {
    dots.innerHTML = CONFIG.gallery.map((_, i) =>
      `<button data-dot="${i}" ${i === 0 ? 'class="active"' : ''} aria-label="تصویر ${i + 1}"></button>`
    ).join('');
  }
}

function initGallery() {
  const track = $('#galleryTrack');
  const wrap  = $('#galleryWrap');
  const dots  = $('#galleryDots');
  const arrows = $$('.gallery-arrow');
  if (!track) return;

  const itemWidth = () => {
    const item = track.querySelector('.gallery-item');
    if (!item) return 320;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return item.getBoundingClientRect().width + gap;
  };

  const scrollByStep = dir => {
    const step = itemWidth();
    track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  arrows.forEach(a => a.addEventListener('click', () => scrollByStep(a.dataset.dir)));

  dots?.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.dot;
    track.scrollTo({ left: itemWidth() * i, behavior: 'smooth' });
  });

  const updateActiveDot = () => {
    if (!dots || !track.querySelector('.gallery-item')) return;
    const w = itemWidth();
    const idx = Math.round(track.scrollLeft / w);
    $$('#galleryDots button').forEach((b, k) => b.classList.toggle('active', k === idx));
  };
  track.addEventListener('scroll', () => {
    clearTimeout(track._t);
    track._t = setTimeout(updateActiveDot, 60);
  }, { passive: true });

  let isDown = false, startX = 0, startScroll = 0;
  const onDown = (clientX) => {
    isDown = true;
    startX = clientX;
    startScroll = track.scrollLeft;
    wrap.classList.add('dragging');
    track.style.scrollBehavior = 'auto';
  };
  const onMove = (clientX) => {
    if (!isDown) return;
    track.scrollLeft = startScroll - (clientX - startX) * 1.4;
  };
  const onUp = () => {
    if (!isDown) return;
    isDown = false;
    wrap.classList.remove('dragging');
    track.style.scrollBehavior = 'smooth';
  };

  track.addEventListener('mousedown', e => { e.preventDefault(); onDown(e.pageX); });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mousemove', e => onMove(e.pageX));

  track.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove',  e => onMove(e.touches[0].clientX),  { passive: true });
  track.addEventListener('touchend', onUp);

  track.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

function initHeader() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initNav() {
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  nav?.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      burger.classList.remove('open');
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

function initHeroMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroImg = $('.hero-img');
  let raf;
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      if (heroImg) heroImg.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.03)`;
    });
  }, { passive: true });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const blobs = $$('.blob');
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - .5) * 2;
      my = (e.clientY / window.innerHeight - .5) * 2;
    });
    const loop = () => {
      cx += (mx - cx) * .04;
      cy += (my - cy) * .04;
      blobs.forEach((o, i) => {
        const depth = (i + 1) * 10;
        o.style.marginLeft = `${cx * depth}px`;
        o.style.marginTop  = `${cy * depth}px`;
      });
      requestAnimationFrame(loop);
    };
    loop();
  }
}

function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1200px) translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  initGallery();
  initReveal();
  initHeader();
  initNav();
  initHeroMotion();
  initTilt();
});
