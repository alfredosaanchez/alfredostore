import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { SPECS_DB } from './specs-db.js';

// ── WhatsApp number ───────────────────────────────────────────────────────
const WA_NUMBER = "584146834774";

// ── WA SVG icon ───────────────────────────────────────────────────────────
const WA_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882l6.198-1.625A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.791 9.791 0 0 1-4.988-1.365l-.358-.213-3.68.965.981-3.594-.233-.369A9.79 9.79 0 0 1 2.182 12c0-5.415 4.403-9.818 9.818-9.818 5.414 0 9.818 4.403 9.818 9.818 0 5.414-4.404 9.818-9.818 9.818z"/></svg>`;

// ── Build product card HTML ───────────────────────────────────────────────
function buildCard(product) {
  const name    = product.nombre || '';
  const price   = product.precio || '';
  const imgUrl  = product.imagen || '';
  const marca   = product.marca  || '';
  const hasSpecs = !!SPECS_DB[name];
  const waText  = encodeURIComponent(`Hola, me interesa el equipo: ${name}`);
  const waHref  = `https://wa.me/${WA_NUMBER}?text=${waText}`;

  const priceHTML = price
    ? `<p class="price-tag">${price}</p>`
    : `<p class="price-na">Consultar</p>`;

  const imgHTML = imgUrl
    ? `<img src="${imgUrl}" alt="${name}" loading="lazy" style="object-fit:contain;max-height:148px;max-width:100%;">`
    : `<span style="color:var(--muted);font-size:.75rem;">📷 Imagen del equipo</span>`;

  return `
    <article class="product-card fade-up" data-name="${name}" data-price="${price}" data-img="${imgUrl}" data-wa="${waHref}">
      <div class="img-slot ${hasSpecs ? 'has-specs' : ''}" role="${hasSpecs ? 'button' : ''}" ${hasSpecs ? 'tabindex="0"' : ''}>
        ${imgHTML}
      </div>
      ${hasSpecs ? '<p class="specs-hint">🔍 Toca la imagen para ver especificaciones</p>' : ''}
      <div class="card-body">
        <h3>${name}</h3>
        ${priceHTML}
        <a href="${waHref}" target="_blank" rel="noopener" class="btn-whatsapp">
          ${WA_ICON} Comprar por WhatsApp
        </a>
      </div>
    </article>`;
}

// ── Render sections from Firestore data ──────────────────────────────────
function renderCatalog(productos, marcas) {
  // Group products by brand
  const byBrand = {};
  productos.forEach(p => {
    const m = p.marca || 'Otras';
    if (!byBrand[m]) byBrand[m] = [];
    byBrand[m].push(p);
  });

  // Build nav pills and sections
  const navEl  = document.getElementById('cat-nav-inner');
  const mainEl = document.getElementById('catalog-main');

  // Order: use marcas order from DB, then any extra
  const brandOrder = marcas.map(m => m.nombre);
  Object.keys(byBrand).forEach(b => { if (!brandOrder.includes(b)) brandOrder.push(b); });

  navEl.innerHTML  = '';
  mainEl.innerHTML = '';

  brandOrder.forEach(brand => {
    const prods = byBrand[brand];
    if (!prods || prods.length === 0) return;

    const id = brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const marcaData = marcas.find(m => m.nombre === brand) || {};
    const subtitle  = marcaData.subtitulo || '';

    // Nav pill
    navEl.innerHTML += `<a href="#${id}" class="cat-pill">${brand}</a>`;

    // Section
    const cards = prods.map(buildCard).join('');
    mainEl.innerHTML += `
      <section id="${id}" class="catalog-section" aria-labelledby="${id}-title">
        <div class="section-header">
          <h2 id="${id}-title">${brand}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
        <div class="product-grid">${cards}</div>
      </section>`;
  });

  // Wire up specs modal clicks
  wireSpecsModal();
  // Wire up nav highlight
  wireNavHighlight();
}

// ── Load from Firestore ──────────────────────────────────────────────────
export async function loadCatalog() {
  const mainEl = document.getElementById('catalog-main');
  mainEl.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

  try {
    const [prodSnap, marcaSnap] = await Promise.all([
      getDocs(query(collection(db, 'productos'), orderBy('orden', 'asc'))),
      getDocs(query(collection(db, 'marcas'),    orderBy('orden', 'asc'))),
    ]);

    const productos = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const marcas    = marcaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (productos.length === 0) {
      mainEl.innerHTML = '<p class="empty-state">No hay productos aún. Inicia sesión en el panel admin para agregarlos.</p>';
      return;
    }

    renderCatalog(productos, marcas);
  } catch (err) {
    console.error(err);
    mainEl.innerHTML = '<p class="empty-state">Error al cargar el catálogo. Intenta recargar la página.</p>';
  }
}

// ── Specs Modal ──────────────────────────────────────────────────────────
function wireSpecsModal() {
  const modal      = document.getElementById('specs-modal');
  const closeBtn   = document.getElementById('specs-modal-close');
  const modalImg   = document.getElementById('specs-modal-img');
  const modalTitle = document.getElementById('specs-modal-title');
  const modalPrice = document.getElementById('specs-modal-price');
  const modalList  = document.getElementById('specs-modal-list');
  const modalWA    = document.getElementById('specs-modal-wa');

  function openModal(card) {
    const name  = card.dataset.name;
    const price = card.dataset.price;
    const img   = card.dataset.img;
    const wa    = card.dataset.wa;
    const specs = SPECS_DB[name];
    if (!specs) return;

    modalImg.src   = img || '';
    modalImg.alt   = name;
    modalImg.style.display = img ? 'block' : 'none';
    modalTitle.textContent = name;
    modalPrice.textContent = price || 'Consultar';
    modalList.innerHTML = specs.map(([emoji, label, val]) =>
      `<li><span class="emoji">${emoji}</span><span><strong style="color:#e8e8f0">${label}:</strong> ${val}</span></li>`
    ).join('');
    modalWA.href = wa;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.img-slot.has-specs').forEach(slot => {
    slot.addEventListener('click', () => openModal(slot.closest('.product-card')));
    slot.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(slot.closest('.product-card')); });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── Active nav pill on scroll ────────────────────────────────────────────
function wireNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const OFFSET   = 130;

  function getActive() {
    let activeId = null, closest = -Infinity;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= OFFSET && top > closest) { closest = top; activeId = sec.id; }
    });
    if (!activeId && sections.length) activeId = sections[0].id;
    return activeId;
  }

  function highlight() {
    const id = getActive();
    document.querySelectorAll('.cat-pill').forEach(p => {
      const active = p.getAttribute('href') === '#' + id;
      p.classList.toggle('active', active);
      if (active) p.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', highlight, { passive: true });
  highlight();
}
