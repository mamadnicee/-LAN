/* ============================================================
   ÉLAN — SCRIPT
   محصولات، گالری Masonry، سبد خرید، واتساپ
   ============================================================ */

const CONFIG = {
  whatsapp: '989120000000',
  currency: 'تومان',
  productsFile: 'products.json',

  // گالری Masonry — عکس‌های 4K از Unsplash
  // بعداً مشتری می‌تونه این لینک‌ها رو با عکس‌های خودش عوض کنه
  gallery: [
    { src: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=90&auto=format&fit=crop', size: 'tall',  label: 'روتین صبحگاهی' },
    { src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=90&auto=format&fit=crop', size: 'wide',  label: 'رنگ‌های طبیعی' },
    { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=90&auto=format&fit=crop', size: 'square', label: 'کلکسیون کامل' },
    { src: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1600&q=90&auto=format&fit=crop', size: 'tall',  label: 'مراقبت از پوست' },
    { src: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&q=90&auto=format&fit=crop', size: 'square', label: 'جزئیات' },
    { src: 'https://images.unsplash.com/photo-1583241800698-9c2e0a1a5e2b?w=1600&q=90&auto=format&fit=crop', size: 'wide',  label: 'عطر و رایحه' },
    { src: 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=1600&q=90&auto=format&fit=crop', size: 'square', label: 'سرم‌های تخصصی' },
    { src: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=90&auto=format&fit=crop', size: 'tall',  label: 'آرایش حرفه‌ای' }
  ]
};

/* ---------- Helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const toFa = n => Number(n).toLocaleString('fa-IR');
const imgPath = n => `assets/images/${n}.jpg`;

let PRODUCTS = [];

/* ---------- 1. LOAD PRODUCTS ---------- */
async function loadProducts() {
  try {
    const res = await fetch(CONFIG.productsFile, { cache: 'no-store' });
    if (!res.ok) throw new Error('not found');
    PRODUCTS = await res.json();
  } catch (err) {
    console.warn('products.json در دسترس نیست.', err);
    PRODUCTS = [];
  }
}

/* ---------- 2. RENDER PRODUCTS ---------- */
function renderProducts() {
  const grid = $('#productsGrid');
  if (!grid) return;
  if (!PRODUCTS.length) {
    grid.innerHTML = '<div class="cart-empty" style="grid-column:1/-1;text-align:center;padding:3rem 0">محصولی برای نمایش نیست.</div>';
    return;
  }
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <article class="product-card reveal" style="transition-delay:${i * 50}ms">
      <div class="product-media">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
        <img src="${imgPath(p.id)}" alt="${p.name || ''}" loading="lazy" onerror="this.style.display='none'">
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name || ''}</h3>
        <p class="product-desc">${p.desc || ''}</p>
        <div class="product-foot">
          <span class="product-price">${toFa(p.price || 0)}<small>${CONFIG.currency}</small></span>
          <button class="add-btn" data-add="${p.id}" aria-label="افزودن به سبد">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

/* ---------- 3. RENDER GALLERY (Masonry) ---------- */
function renderGallery() {
  const wrap = $('#galleryMasonry');
  if (!wrap) return;
  wrap.innerHTML = CONFIG.gallery.map((g, i) => `
    <figure class="masonry-item masonry-item--${g.size} reveal" data-index="${i}" style="transition-delay:${i * 60}ms">
      <img src="${g.src}" alt="${g.label || ''}" loading="lazy">
      <figcaption>${g.label || ''}</figcaption>
    </figure>
  `).join('');
}

/* ---------- 4. REVEAL ---------- */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- 5. HEADER ---------- */
function initHeader() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- 6. NAV ---------- */
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

/* ---------- 7. HERO FLOAT PARALLAX ---------- */
function initHeroMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const f1 = $('.hero-img--float-1');
  const f2 = $('.hero-img--float-2');
  if (!f1 || !f2) return;

  // Float انیمیشن
  let t = 0;
  const loop = () => {
    t += 0.005;
    f1.style.transform = `translate3d(0, ${Math.sin(t) * 12}px, 0)`;
    f2.style.transform = `translate3d(0, ${Math.cos(t * 1.3) * 14}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ---------- 8. CART ---------- */
const Cart = {
  key: 'elan_cart',
  items: [],
  init() {
    try { this.items = JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { this.items = []; }
  },
  save() { localStorage.setItem(this.key, JSON.stringify(this.items)); },
  add(id) {
    const p = PRODUCTS.find(x => Number(x.id) === Number(id));
    if (!p) return;
    const ex = this.items.find(i => Number(i.id) === Number(id));
    if (ex) ex.qty++;
    else this.items.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
    this.save(); this.render(); UI.flashCount();
  },
  remove(id) {
    this.items = this.items.filter(i => Number(i.id) !== Number(id));
    this.save(); this.render();
  },
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  render() {
    const wrap = $('#cartItems');
    const count = $('#cartCount');
    if (!wrap) return;
    count.textContent = toFa(this.count());
    count.classList.toggle('active', this.count() > 0);
    $('#cartTotal').textContent = toFa(this.total()) + ' ' + CONFIG.currency;

    if (!this.items.length) {
      wrap.innerHTML = '<div class="cart-empty">سبد خرید خالی است</div>';
      return;
    }
    wrap.innerHTML = this.items.map(i => `
      <div class="cart-item">
        <img src="${imgPath(i.id)}" alt="${i.name}" onerror="this.style.display='none'">
        <div>
          <div class="cart-item-name">${i.name} × ${toFa(i.qty)}</div>
          <div class="cart-item-price">${toFa(i.price * i.qty)} ${CONFIG.currency}</div>
        </div>
        <button class="cart-item-remove" data-remove="${i.id}" aria-label="حذف">✕</button>
      </div>
    `).join('');
  }
};

const UI = {
  openCart() {
    $('#cartDrawer').classList.add('open');
    $('#overlay').classList.add('active');
    document.body.classList.add('locked');
  },
  closeCart() {
    $('#cartDrawer').classList.remove('open');
    $('#overlay').classList.remove('active');
    document.body.classList.remove('locked');
  },
  flashCount() {
    const c = $('#cartCount');
    c.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
      { duration: 400, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }
};

function initCart() {
  $('#cartBtn')?.addEventListener('click', () => UI.openCart());
  $('#cartClose')?.addEventListener('click', () => UI.closeCart());
  $('#overlay')?.addEventListener('click', () => UI.closeCart());

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) return Cart.add(add.dataset.add);
    const rm = e.target.closest('[data-remove]');
    if (rm) return Cart.remove(rm.dataset.remove);
  });

  $('#checkoutBtn')?.addEventListener('click', () => {
    if (!Cart.items.length) return alert('سبد خرید خالی است');
    const lines = Cart.items.map(i => `• ${i.name} × ${i.qty} = ${i.price * i.qty} ${CONFIG.currency}`).join('\n');
    const msg = `سلام 👋\nسفارش من از ÉLAN:\n\n${lines}\n\nجمع کل: ${Cart.total()} ${CONFIG.currency}\n\nلطفاً راهنمایی کنید.`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  Cart.render();
}

/* ---------- 9. INIT ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  Cart.init();
  await loadProducts();
  renderProducts();
  renderGallery();
  initReveal();
  initHeader();
  initNav();
  initHeroMotion();
  initCart();
});
