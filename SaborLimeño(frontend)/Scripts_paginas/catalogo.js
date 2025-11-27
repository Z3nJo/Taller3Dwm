(async function () {
  const API_URL = "https://slapi.onrender.com";

  // Estado global
  let productos = {};
  let editMode = false;

  const ORDEN_CATEGORIAS = [
    "Entradas",
    "Platos de fondo",
    "Postres",
    "Bebidas"
  ];

  // DOM elements
  const catalogoDiv = document.getElementById('catalogo');
  const menu = document.getElementById('menu');
  const hamburger = document.getElementById('hamburger');
  const btnBuscar = document.getElementById('btn-buscar');
  const modalProducto = document.getElementById('modal-producto');
  const detalleImg = document.getElementById('detalle-img');
  const detalleNombre = document.getElementById('detalle-nombre');
  const detalleDesc = document.getElementById('detalle-desc');
  const detallePrecio = document.getElementById('detalle-precio');
  const cantidadSpan = document.getElementById('cantidad');
  const btnSumar = document.getElementById('sumar');
  const btnRestar = document.getElementById('restar');
  const btnAgregarModal = document.getElementById('btn-agregar-modal');
  const cerrarDetalleBtn = document.getElementById('cerrar-detalle');
  const estadoNoDisp = document.getElementById('estado-no-disponible');
  const cantidadContainer = document.getElementById('cantidad-container');
  const modalBusqueda = document.getElementById('modal-busqueda');
  const inputBusqueda = document.getElementById('input-busqueda');
  const resultadosDiv = document.getElementById('resultados-busqueda');
  const cerrarBusquedaBtn = document.getElementById('cerrar-modal');
  const TIEMPO_INACTIVIDAD = 5 * 60 * 1000; // 5 min
  let timeoutID = null;

  // Helpers para imagenes
  function getImagenURL(img) {
      // Fallback local (frontend)
      const FALLBACK = "Media/sabor.png";

      if (!img) return FALLBACK;

      // Si img ya es full URL (http/https), devolverla tal cual
      if (/^https?:\/\//i.test(img)) return img;

      // Normalizar: quitar slashes al inicio
      img = img.replace(/^\/+/, "");

      // Si la ruta ya contiene "media/" la dejamos, si no la asumimos tal cual
      // Resultado final apuntando al backend
      return `https://slapi.onrender.com/${img}`;
  }

  function safeImg(imgEl, fallback) {
    if (!imgEl) return;
    imgEl.addEventListener('error', () => {
      imgEl.src = fallback || 'Media/sabor.png';
    });
  }

  // Inactividad
  function resetIdleTimer() {
      if (timeoutID) clearTimeout(timeoutID);

      timeoutID = setTimeout(async () => {
          console.log("⏳ Cerrando sesión por inactividad...");

          const correo = sessionStorage.getItem("correoUsuario");

          if (correo) {
              try {
                  // Obtener usuario desde el correo
                  const userRes = await fetch(`https://slapi.onrender.com/usuario/${encodeURIComponent(correo)}`);

                  if (userRes.ok) {
                      const user = await userRes.json();

                      // CORRECCIÓN: el ID real está en _id (Mongo)
                      const idUsuario = user._id;

                      console.log("🗑 Borrando carrito del usuario", idUsuario);

                      if (idUsuario) {
                          await fetch(`https://slapi.onrender.com/carrito/${idUsuario}/delete`, {
                              method: "DELETE"
                          });
                      } else {
                          console.warn("⚠️ No se encontró _id en el usuario:", user);
                      }
                  }
              } catch (err) {
                  console.error("❌ Error eliminando carrito:", err);
              }
          }

          // Cerrar sesión
          sessionStorage.removeItem("correoUsuario");

          alert("Por inactividad, se cerró tu sesión.");
          window.location.href = "login.html";

      }, TIEMPO_INACTIVIDAD);
  }

  function inicializarInactividad() {
      resetIdleTimer();

      document.addEventListener("mousemove", resetIdleTimer);
      document.addEventListener("keydown", resetIdleTimer);
      document.addEventListener("click", resetIdleTimer);
      document.addEventListener("scroll", resetIdleTimer);
  }

  document.addEventListener("DOMContentLoaded", inicializarInactividad);

  // Utilidades
  function slug(s) {
    return s.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  }

  // Cargar productos desde backend (GET /producto)
  async function cargarProductos() {
    try {
      const res = await fetch("https://slapi.onrender.com/producto");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();

      // Reorganizar por categoría (para mostrar igual que antes)
      const agrupados = {};
      data.forEach(p => {
        const categoria = p.categoria || "Sin categoría";
        if (!agrupados[categoria]) agrupados[categoria] = [];

        // Normalizar id y construir objeto tal cual espera la UI
        const idVal = p.id || p._id || slug(p.nombre);

        agrupados[categoria].push({
          id: idVal,
          nombre: p.nombre,
          precio: Number(p.precio) || 0,
          // Normalizamos la URL de la imagen a una URL usable en el frontend
          img: getImagenURL(p.img),
          descripcion: p.descripcion || "Sin descripción.",
          disponible: (typeof p.stock === "number") ? (p.stock > 0) : Boolean(p.stock)
        });
      });

      productos = agrupados;
      mostrarCatalogo();
      generarMenu();
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      if (catalogoDiv) catalogoDiv.innerHTML = "<p class='muted'>No se pudieron cargar los productos.</p>";
    }
  }

  // Mostrar catálogo (por categorías)
  function mostrarCatalogo(requestEditMode = false) {
    editMode = !!requestEditMode;
    catalogoDiv.innerHTML = '';

    // Recorrer categorías en ORDEN_CATEGORIAS para mantener layout esperado
    for (const categoria of ORDEN_CATEGORIAS) {
      if (!productos[categoria]) continue;

      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = categoria;
      catalogoDiv.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'row-grid';

      productos[categoria].forEach(prod => {
        const card = document.createElement('article');
        card.className = 'card-item';
        card.setAttribute('data-id', prod.id);
        card.setAttribute('role', 'button');
        card.tabIndex = 0;

        const thumb = document.createElement('div');
        thumb.className = 'card-thumb';
        const img = document.createElement('img');
        img.alt = prod.nombre;
        img.src = prod.img || getImagenURL(null);
        safeImg(img, getImagenURL(null));
        thumb.appendChild(img);

        const body = document.createElement('div');
        body.className = 'card-body';
        const h = document.createElement('h3');
        h.className = 'card-title';
        h.textContent = prod.nombre;
        const p = document.createElement('p');
        p.className = 'muted price';
        p.textContent = `$${prod.precio.toLocaleString()}`;
        body.appendChild(h);
        body.appendChild(p);

        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = `$${prod.precio.toLocaleString()}`;
        footer.appendChild(price);

        const actions = document.createElement('div');

        // Botón Agregar carrito
        const btnAdd = document.createElement('button');
        btnAdd.className = 'add-btn';
        btnAdd.innerHTML = '+';
        btnAdd.title = 'Agregar al carrito';
        if (!prod.disponible) btnAdd.disabled = true;

        btnAdd.addEventListener('click', (e) => {
          e.stopPropagation();
          agregarCarrito(prod.id, 1);
        });
        actions.appendChild(btnAdd);

        // Botones admin (editar / eliminar) si corresponde
        if (editMode) {
          const btnEdit = document.createElement('button');
          btnEdit.className = 'edit-btn admin-btn';
          btnEdit.innerHTML = '✏️';
          btnEdit.title = 'Editar producto';
          btnEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.openEditarProducto === 'function') {
              window.openEditarProducto(prod.id);
            }
          });
          actions.appendChild(btnEdit);

          const btnDel = document.createElement('button');
          btnDel.className = 'delete-btn admin-btn';
          btnDel.innerHTML = '🗑';
          btnDel.title = 'Eliminar producto';
          btnDel.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.eliminarProducto === 'function') {
              window.eliminarProducto(prod.id);
            }
          });
          actions.appendChild(btnDel);
        }

        footer.appendChild(actions);

        card.appendChild(thumb);
        card.appendChild(body);
        card.appendChild(footer);

        // Click para ver detalles solo si no estamos en edicion
        if (!editMode) {
          card.addEventListener('click', () => verDetalles(prod.id));
        }

        grid.appendChild(card);
      });

      catalogoDiv.appendChild(grid);
    }
  }

  // Localizar producto por id (busqueda en productos agrupados)
  function localizarProducto(id) {
    for (const cat in productos) {
      const p = productos[cat].find(x => x.id === id);
      if (p) return p;
    }
    return null;
  }

  // Agregar al carrito (usa carrito.js)
  function agregarCarrito(id, cantidad = 1) {
    const prod = localizarProducto(id);
    if (!prod) return alert('Producto no encontrado');
    if (!prod.disponible) return alert('Producto no disponible');

    const item = {
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      img: prod.img,
      cantidad
    };

    if (window.agregarAlCarrito) {
      window.agregarAlCarrito(item);
    } else {
      console.warn("⚠️ agregarAlCarrito() no está disponible.");
    }
  }

  // Ver detalles de producto (modal)
  function verDetalles(id) {
    const p = localizarProducto(id);
    if (!p) return;

    detalleImg.src = p.img || getImagenURL(null);
    safeImg(detalleImg, getImagenURL(null));
    detalleNombre.textContent = p.nombre;
    detalleDesc.textContent = p.descripcion;
    detallePrecio.textContent = p.disponible ? `$${p.precio.toLocaleString()}` : 'No disponible';
    cantidadSpan.textContent = '1';

    if (!p.disponible) {
      estadoNoDisp.classList.remove('d-none');
      if (cantidadContainer) cantidadContainer.style.display = 'none';
      if (btnAgregarModal) btnAgregarModal.disabled = true;
    } else {
      estadoNoDisp.classList.add('d-none');
      if (cantidadContainer) quantityDisplaySafe(); 
      if (cantidadContainer) cantidadContainer.style.display = 'flex';
      if (btnAgregarModal) {
        btnAgregarModal.disabled = false;
        btnAgregarModal.onclick = () => {
          agregarCarrito(p.id, parseInt(cantidadSpan.textContent, 10));
          closeModal(modalProducto);
        };
      }
    }

    openModal(modalProducto);
  }

  function quantityDisplaySafe() {
  }

  // Manejo de modales
  function openModal(el) {
    if (!el) return;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(el) {
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Manejo de cantidad
  btnSumar?.addEventListener('click', () => {
    cantidadSpan.textContent = String(parseInt(cantidadSpan.textContent || '1', 10) + 1);
  });
  btnRestar?.addEventListener('click', () => {
    const n = Math.max(1, parseInt(cantidadSpan.textContent || '1', 10) - 1);
    cantidadSpan.textContent = String(n);
  });
  cerrarDetalleBtn?.addEventListener('click', () => closeModal(modalProducto));
  modalProducto?.addEventListener('click', (e) => { if (e.target === modalProducto) closeModal(modalProducto); });

  // Modal búsqueda
  btnBuscar?.addEventListener('click', () => {
    if (inputBusqueda) inputBusqueda.value = '';
    if (resultadosDiv) resultadosDiv.innerHTML = '';
    openModal(modalBusqueda);
    inputBusqueda?.focus();
  });
  cerrarBusquedaBtn?.addEventListener('click', () => closeModal(modalBusqueda));
  modalBusqueda?.addEventListener('click', (e) => { if (e.target === modalBusqueda) closeModal(modalBusqueda); });

  function debounce(fn, wait = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  inputBusqueda?.addEventListener('input', debounce(() => {
    const q = (inputBusqueda.value || '').toLowerCase().trim();
    resultadosDiv.innerHTML = '';
    if (!q) return;
    const fragment = document.createDocumentFragment();
    let found = 0;
    for (const cat in productos) {
      for (const p of productos[cat]) {
        if (p.nombre && p.nombre.toLowerCase().includes(q)) {
          const item = document.createElement('div');
          item.className = 'resultado-item';
          item.style.padding = '8px 6px';
          item.style.cursor = 'pointer';
          item.innerHTML = `<strong>${p.nombre}</strong> — <span class="muted">$${p.precio.toLocaleString()}</span>`;
          item.addEventListener('click', () => { verDetalles(p.id); closeModal(modalBusqueda); });
          fragment.appendChild(item);
          found++;
        }
      }
    }
    if (found === 0) resultadosDiv.innerHTML = '<p class="muted">No se encontraron productos</p>';
    else resultadosDiv.appendChild(fragment);
  }, 160));

  // Menú lateral
  function generarMenu() {
    menu.innerHTML = '';
    for (const cat of Object.keys(productos)) {
      const div = document.createElement('div');
      div.className = 'cat';
      div.textContent = cat;
      div.addEventListener('click', () => {
        const titles = Array.from(document.querySelectorAll('.section-title'));
        const t = titles.find(x => x.textContent === cat);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        menu.classList.remove('show');
      });
      menu.appendChild(div);
    }
  }

  hamburger?.addEventListener('click', () => menu.classList.toggle('show'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [modalProducto, modalBusqueda].forEach(m => m?.classList.remove('open'));
      menu.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Usuario actual
  window.usuarioActual = null;

  async function cargarUsuarioActual() {
    const correo = sessionStorage.getItem("correoUsuario");
    if (!correo) {
      console.warn("⚠ No hay correoUsuario en sessionStorage.");
      return null;
    }

    try {
      const correoEncoded = encodeURIComponent(correo);
      const res = await fetch(`https://slapi.onrender.com/usuario/${correoEncoded}`);
      if (!res.ok) {
        console.warn("⚠ No se pudo obtener usuario desde backend.");
        return null;
      }

      const usuario = await res.json();
      window.usuarioActual = usuario;

      console.log("✔ Usuario cargado:", usuario);
      return usuario;

    } catch (err) {
      console.error("❌ Error cargando usuarioActual:", err);
      return null;
    }
  }

  await cargarUsuarioActual();
  await cargarProductos();

  // Exponer funciones globales (compatibilidad)
  window.mostrarCatalogo = mostrarCatalogo;
  window.localizarProducto = localizarProducto;
  window.productos = productos;
  window.cargarProductosBackend = cargarProductos;

})();