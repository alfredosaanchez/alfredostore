import { db, auth, CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from './firebase-config.js';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── State ─────────────────────────────────────────────────────────────────
let editingProdId  = null;
let editingMarcaId = null;
let marcasCache    = [];
let productosCache = [];
let specsRows      = [];

// ── Auth ──────────────────────────────────────────────────────────────────
export function initAuth() {
  onAuthStateChanged(auth, user => {
    if (user) {
      document.getElementById('admin-login-screen').style.display = 'none';
      document.getElementById('admin-panel-screen').style.display = 'block';
      document.getElementById('admin-user-email').textContent = user.email;
      loadMarcas();
      loadProductos();
      loadSpecsList();
    } else {
      document.getElementById('admin-login-screen').style.display = 'flex';
      document.getElementById('admin-panel-screen').style.display = 'none';
    }
  });
}

export async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');
  errEl.style.display = 'none';
  btn.textContent = 'Ingresando...'; btn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    errEl.textContent = 'Correo o contraseña incorrectos.';
    errEl.style.display = 'block';
    btn.textContent = 'Ingresar'; btn.disabled = false;
  }
}

export async function handleLogout() { await signOut(auth); }

// ── Tabs ──────────────────────────────────────────────────────────────────
export function switchTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.admin-tab-panel').forEach(p => p.style.display = p.id === `tab-${tab}` ? 'block' : 'none');
}

// ── Cloudinary Upload ─────────────────────────────────────────────────────
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res  = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload failed');
  return data.secure_url;
}

function wireImagePreview(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  });
}

// ── MARCAS ────────────────────────────────────────────────────────────────
async function loadMarcas() {
  const tbody = document.getElementById('marcas-tbody');
  tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:2rem">Cargando...</td></tr>';
  const snap = await getDocs(query(collection(db, 'marcas'), orderBy('orden', 'asc')));
  marcasCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const sel = document.getElementById('prod-marca');
  sel.innerHTML = '<option value="">-- Selecciona marca --</option>';
  marcasCache.forEach(m => { sel.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`; });

  if (marcasCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:2rem">No hay marcas aún.</td></tr>';
    return;
  }
  tbody.innerHTML = marcasCache.map(m => `
    <tr>
      <td>${m.nombre}</td>
      <td>${m.subtitulo || '—'}</td>
      <td style="display:flex;gap:.5rem;">
        <button class="admin-btn admin-btn-sm admin-btn-edit" onclick="window._editMarca('${m.id}')">✏️ Editar</button>
        <button class="admin-btn admin-btn-sm admin-btn-del"  onclick="window._deleteMarca('${m.id}','${m.nombre}')">🗑️ Eliminar</button>
      </td>
    </tr>`).join('');
}

export function openMarcaForm(id = null) {
  editingMarcaId = id;
  const marca = id ? marcasCache.find(m => m.id === id) : null;
  document.getElementById('marca-form-title').textContent = id ? 'Editar Marca' : 'Nueva Marca';
  document.getElementById('marca-nombre').value    = marca?.nombre    || '';
  document.getElementById('marca-subtitulo').value = marca?.subtitulo || '';
  document.getElementById('marca-orden').value     = marca?.orden     || marcasCache.length + 1;
  document.getElementById('marca-form-wrap').style.display = 'block';
  document.getElementById('marca-nombre').focus();
}

export function closeMarcaForm() {
  editingMarcaId = null;
  document.getElementById('marca-form-wrap').style.display = 'none';
}

export async function saveMarca(e) {
  e.preventDefault();
  const btn = document.getElementById('marca-save-btn');
  btn.textContent = 'Guardando...'; btn.disabled = true;
  const data = {
    nombre:    document.getElementById('marca-nombre').value.trim(),
    subtitulo: document.getElementById('marca-subtitulo').value.trim(),
    orden:     Number(document.getElementById('marca-orden').value) || 0,
    updatedAt: serverTimestamp(),
  };
  try {
    if (editingMarcaId) {
      await updateDoc(doc(db, 'marcas', editingMarcaId), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'marcas'), data);
    }
    closeMarcaForm();
    await loadMarcas();
    showToast('Marca guardada correctamente ✅');
  } catch (err) { alert('Error: ' + err.message); }
  finally { btn.textContent = 'Guardar'; btn.disabled = false; }
}

window._editMarca   = (id) => openMarcaForm(id);
window._deleteMarca = async (id, nombre) => {
  if (!confirm(`¿Eliminar la marca "${nombre}"?`)) return;
  await deleteDoc(doc(db, 'marcas', id));
  await loadMarcas();
  showToast('Marca eliminada ✅');
};

// ── PRODUCTOS ─────────────────────────────────────────────────────────────
async function loadProductos() {
  const grid = document.getElementById('productos-grid');
  grid.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
  const snap = await getDocs(query(collection(db, 'productos'), orderBy('orden', 'asc')));
  productosCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (productosCache.length === 0) {
    grid.innerHTML = '<p class="empty-state">No hay productos aún.</p>';
    return;
  }
  grid.innerHTML = productosCache.map(p => `
    <div class="admin-prod-card">
      <div class="admin-prod-img">
        ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : '<span>📷</span>'}
      </div>
      <div class="admin-prod-info">
        <p class="admin-prod-name">${p.nombre}</p>
        <p class="admin-prod-brand">${p.marca || '—'}</p>
        <p class="admin-prod-price">${p.precio || 'Consultar'}</p>
      </div>
      <div class="admin-prod-actions">
        <button class="admin-btn admin-btn-sm admin-btn-edit" onclick="window._editProd('${p.id}')">✏️</button>
        <button class="admin-btn admin-btn-sm admin-btn-del"  onclick="window._deleteProd('${p.id}','${p.nombre.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    </div>`).join('');
}

export function openProdForm(id = null) {
  editingProdId = id;
  document.getElementById('prod-form-title').textContent = id ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('prod-form').reset();
  document.getElementById('prod-img-preview').style.display = 'none';
  document.getElementById('prod-form-wrap').style.display = 'block';
  if (id) {
    const data = productosCache.find(p => p.id === id);
    if (data) {
      document.getElementById('prod-nombre').value  = data.nombre  || '';
      document.getElementById('prod-marca').value   = data.marca   || '';
      document.getElementById('prod-precio').value  = data.precio  || '';
      document.getElementById('prod-orden').value   = data.orden   || '';
      document.getElementById('prod-img-url').value = data.imagen  || '';
      if (data.imagen) {
        const prev = document.getElementById('prod-img-preview');
        prev.src = data.imagen; prev.style.display = 'block';
      }
    }
  }
  wireImagePreview('prod-img-file', 'prod-img-preview');
  document.getElementById('prod-img-url').oninput = function() {
    const prev = document.getElementById('prod-img-preview');
    if (this.value) { prev.src = this.value; prev.style.display = 'block'; }
    else prev.style.display = 'none';
  };
}

export function closeProdForm() {
  editingProdId = null;
  document.getElementById('prod-form-wrap').style.display = 'none';
}

export async function saveProd(e) {
  e.preventDefault();
  const btn = document.getElementById('prod-save-btn');
  btn.textContent = 'Guardando...'; btn.disabled = true;
  try {
    let imgUrl = document.getElementById('prod-img-url').value.trim();
    const fileInput = document.getElementById('prod-img-file');
    if (fileInput.files[0]) {
      btn.textContent = 'Subiendo imagen...';
      imgUrl = await uploadImage(fileInput.files[0]);
    }
    const data = {
      nombre:    document.getElementById('prod-nombre').value.trim(),
      marca:     document.getElementById('prod-marca').value,
      precio:    document.getElementById('prod-precio').value.trim(),
      imagen:    imgUrl,
      orden:     Number(document.getElementById('prod-orden').value) || 0,
      updatedAt: serverTimestamp(),
    };
    if (editingProdId) {
      await updateDoc(doc(db, 'productos', editingProdId), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'productos'), data);
    }
    closeProdForm();
    await loadProductos();
    await loadSpecsList();
    showToast('Producto guardado correctamente ✅');
  } catch (err) { alert('Error: ' + err.message); }
  finally { btn.textContent = 'Guardar'; btn.disabled = false; }
}

window._editProd   = (id) => openProdForm(id);
window._deleteProd = async (id, nombre) => {
  if (!confirm(`¿Eliminar "${nombre}"?`)) return;
  await deleteDoc(doc(db, 'productos', id));
  await loadProductos();
  await loadSpecsList();
  showToast('Producto eliminado ✅');
};

// ── ESPECIFICACIONES ──────────────────────────────────────────────────────
export async function loadSpecsList() {
  const container = document.getElementById('specs-list');
  if (!container) return;
  container.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

  const [prodSnap, specsSnap] = await Promise.all([
    getDocs(query(collection(db, 'productos'), orderBy('orden', 'asc'))),
    getDocs(collection(db, 'specs')),
  ]);

  const productos  = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const specsExist = new Set(specsSnap.docs.map(d => d.id));

  if (productos.length === 0) {
    container.innerHTML = '<p class="empty-state">Agrega productos primero.</p>';
    return;
  }

  container.innerHTML = productos.map(p => {
    const tiene = specsExist.has(p.id);
    return `
      <div class="specs-list-item">
        <div class="specs-list-info">
          <span class="specs-badge ${tiene ? 'has' : 'none'}">${tiene ? '✅ Con specs' : '⭕ Sin specs'}</span>
          <span class="specs-prod-name">${p.nombre}</span>
          <span class="specs-prod-brand">${p.marca || ''}</span>
        </div>
        <button class="admin-btn admin-btn-sm admin-btn-edit"
          onclick="window._editSpecs('${p.id}','${p.nombre.replace(/'/g,"\\'")}')">
          ${tiene ? '✏️ Editar specs' : '➕ Agregar specs'}
        </button>
      </div>`;
  }).join('');
}

window._editSpecs = async (prodId, prodNombre) => {
  document.getElementById('specs-editor-wrap').style.display = 'block';
  document.getElementById('specs-editor-title').textContent  = `Especificaciones: ${prodNombre}`;
  document.getElementById('specs-prod-id').value = prodId;
  specsRows = [];

  try {
    const snap = await getDoc(doc(db, 'specs', prodId));
    if (snap.exists()) specsRows = (snap.data().items || []).map(r => [...r]);
  } catch {}

  // Si está vacío, agrega filas de ejemplo
  if (specsRows.length === 0) {
    specsRows = [
      ['📱','Pantalla',''],
      ['⚙️','Procesador',''],
      ['💾','RAM',''],
      ['💾','Almacenamiento',''],
      ['📷','Cámara principal',''],
      ['📷','Cámara frontal',''],
      ['🔋','Batería',''],
      ['🔥','Sistema operativo',''],
    ];
  }

  renderSpecsRows();
  document.getElementById('specs-editor-wrap').scrollIntoView({ behavior: 'smooth' });
};

function renderSpecsRows() {
  const container = document.getElementById('specs-rows');
  container.innerHTML = specsRows.map((row, i) => `
    <div class="specs-row">
      <input class="specs-input specs-emoji" type="text"
             placeholder="📱" value="${escHtml(row[0] || '')}" maxlength="4"
             oninput="window._updateSpecRow(${i}, 0, this.value)" />
      <input class="specs-input specs-label" type="text"
             placeholder="Pantalla" value="${escHtml(row[1] || '')}"
             oninput="window._updateSpecRow(${i}, 1, this.value)" />
      <input class="specs-input specs-value" type="text"
             placeholder='6.7&quot; AMOLED 120Hz' value="${escHtml(row[2] || '')}"
             oninput="window._updateSpecRow(${i}, 2, this.value)" />
      <button class="admin-btn admin-btn-sm admin-btn-del"
              onclick="window._removeSpecRow(${i})">🗑️</button>
    </div>`).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

window._updateSpecRow = (i, col, val) => { if (specsRows[i]) specsRows[i][col] = val; };
window._removeSpecRow = (i) => { specsRows.splice(i, 1); renderSpecsRows(); };

export function addSpecRow() {
  specsRows.push(['', '', '']);
  renderSpecsRows();
  const rows = document.querySelectorAll('.specs-row');
  if (rows.length) rows[rows.length - 1].querySelector('.specs-emoji').focus();
}

export function closeSpecsEditor() {
  document.getElementById('specs-editor-wrap').style.display = 'none';
  specsRows = [];
}

export async function saveSpecs() {
  const prodId = document.getElementById('specs-prod-id').value;
  if (!prodId) return;

  // Leer valores actuales de los inputs
  document.querySelectorAll('.specs-row').forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    if (specsRows[i]) {
      specsRows[i] = [inputs[0].value.trim(), inputs[1].value.trim(), inputs[2].value.trim()];
    }
  });

  const items = specsRows.filter(r => r[1] || r[2]);
  const btn   = document.getElementById('specs-save-btn');
  btn.textContent = 'Guardando...'; btn.disabled = true;

  try {
    await setDoc(doc(db, 'specs', prodId), { items, updatedAt: serverTimestamp() });
    closeSpecsEditor();
    await loadSpecsList();
    showToast('Especificaciones guardadas ✅');
  } catch (err) { alert('Error: ' + err.message); }
  finally { btn.textContent = 'Guardar specs'; btn.disabled = false; }
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('admin-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
