let carrito = [];
let idUsuario = null;
let backendActivo = false;

let contenedorCarritoEl = null;
let totalCarritoEl = null;
let modalCarritoEl = null;
let modalEditarEl = null;
let editarCantidadEl = null;
let editarDescEl = null;

let productoActual = null;

function guardarCarrito() {
  try {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  } catch (e) {
    console.error("Error guardando carrito en localStorage:", e);
  }
}

async function cargarCarrito() {
  const correoUsuario = sessionStorage.getItem("correoUsuario");
  if (!correoUsuario) {
    console.warn("No hay usuario logueado.");
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    return;
  }

  try {
    // obtener idUsuario desde backend
    const resUsuario = await fetch(`https://slapi.onrender.com/usuario/${encodeURIComponent(correoUsuario)}`);
    if (!resUsuario.ok) throw new Error("No se pudo obtener usuario");
    const usuario = await resUsuario.json();
    idUsuario = usuario._id || usuario.id || null;
    backendActivo = Boolean(idUsuario);

    // si backend activo, obtener carrito desde backend
    if (!backendActivo) {
      carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      return;
    }

    const resCarrito = await fetch(`https://slapi.onrender.com/carrito/${idUsuario}`);
    if (!resCarrito.ok) {
      // fallback a local si el endpoint falla
      throw new Error("No se pudo obtener carrito");
    }

    const data = await resCarrito.json();

    // varias estructuras:
    let base = [];
    if (Array.isArray(data)) base = data;
    else if (Array.isArray(data.items)) base = data.items;
    else if (Array.isArray(data.carrito)) base = data.carrito;
    else {
      // posible estructura diferente: buscar array en propiedades
      for (const k in data) {
        if (Array.isArray(data[k])) {
          base = data[k];
          break;
        }
      }
    }

    // 3) hidratar cada item consultando el producto
    const finalCarrito = [];

    for (const item of base) {
      const idProd = item.idProducto || item.id || item.id_producto;
      if (!idProd) continue;

      try {
        const resProd = await fetch(`https://slapi.onrender.com/producto/${encodeURIComponent(idProd)}`);
        if (!resProd.ok) throw new Error("Producto no encontrado");
        const prod = await resProd.json();

        // determinar URL de la imagen: si prod.img empieza con http usarla, si no, añadir base
        let imgUrl = prod.img || prod.imagen || prod.image || null;
        if (!imgUrl) imgUrl = "Media/sabor.png";
        else if (!/^https?:\/\//i.test(imgUrl)) {
          // asegurar que la ruta sea accesible por el servidor (ajusta host si es otro)
          imgUrl = imgUrl.replace(/^[\/]+/, ""); // quitar slashes iniciales
          imgUrl = `https://slapi.onrender.com/${imgUrl}`;
        }

        finalCarrito.push({
          id: idProd,
          cantidad: Number(item.cantidad || item.cant || item.cantidadProducto || 1),
          nombre: prod.nombre || prod.titulo || "",
          descripcion: prod.descripcion || prod.desc || "",
          precio: Number(prod.precio || prod.price || 0),
          img: imgUrl
        });
      } catch (err) {
        console.error("❌ Error cargando producto del carrito:", err);
      }
    }

    carrito = finalCarrito;
    console.log("Carrito cargado desde backend →", carrito);
    guardarCarrito();

  } catch (err) {
    console.error("Error cargando carrito:", err);
    // fallback local
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  }
}


async function syncAdd(idProducto, cantidad) {
  if (!backendActivo || !idUsuario || !idProducto) return;
  try {
    await fetch(
      `https://slapi.onrender.com/carrito/${encodeURIComponent(idUsuario)}/add?idProducto=${encodeURIComponent(idProducto)}&cantidad=${encodeURIComponent(cantidad)}`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("❌ Error syncAdd:", err);
  }
}

async function syncRemove(idProducto) {
  if (!backendActivo || !idUsuario || !idProducto) return;
  try {
    await fetch(
      `https://slapi.onrender.com/carrito/${encodeURIComponent(idUsuario)}/remove?idProducto=${encodeURIComponent(idProducto)}`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("❌ Error syncRemove:", err);
  }
}

async function syncClear() {
  if (!backendActivo || !idUsuario) return;
  try {
    await fetch(
      `https://slapi.onrender.com/carrito/${encodeURIComponent(idUsuario)}/clear`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("❌ Error syncClear:", err);
  }
}


// Helpers UI
function ensureElements() {
  if (!contenedorCarritoEl) contenedorCarritoEl = document.querySelector(".carrito-items");
  if (!totalCarritoEl) totalCarritoEl = document.getElementById("totalCarrito") || document.getElementById("total-carrito") || document.getElementById("total-carrito-js");
  if (!modalCarritoEl) modalCarritoEl = document.getElementById("modal-carrito");
  if (!modalEditarEl) modalEditarEl = document.getElementById("modal-editar-carrito");
  if (!editarCantidadEl) editarCantidadEl = document.getElementById("editar-cantidad");
  if (!editarDescEl) editarDescEl = document.getElementById("editar-desc");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function safeImgSet(imgEl) {
  if (!imgEl) return;
  imgEl.addEventListener("error", () => {
    imgEl.src = "Media/sabor.png"; // fallback local
  });
}

function calcularTotal() {
  return carrito.reduce((acc, p) => acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 0), 0);
}


function renderCarrito() {
  ensureElements();
  if (!contenedorCarritoEl) {
    // sitio no tiene modal aún
    return;
  }

  contenedorCarritoEl.innerHTML = "";

  if (!carrito || carrito.length === 0) {
    contenedorCarritoEl.innerHTML = "<p>Tu carrito está vacío</p>";
    if (totalCarritoEl) totalCarritoEl.textContent = "$0";
    return;
  }

  const frag = document.createDocumentFragment();

  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.dataset.id = item.id;

    const nombre = escapeHtml(item.nombre || "");
    const precioNum = Number(item.precio || 0);
    const cantidadNum = Number(item.cantidad || 0);
    const subtotal = precioNum * cantidadNum;

    // img puede venir en item.img
    const imgSrc = item.img || item.imgUrl || 'Media/sabor.png';

    div.innerHTML = `
      <div class="item-left" style="display:flex;gap:10px;align-items:center">
        <img class="item-img" src="${imgSrc}" width="80" height="80" alt="${nombre}">
        <div>
          <p class="item-nombre mb-1">${nombre}</p>
        </div>
      </div>
      <div class="item-right" style="margin-left:auto;text-align:right">
        <div>$${precioNum.toLocaleString()}</div>
        <div>Cantidad: <strong>${cantidadNum}</strong></div>
        <div>Subtotal: $${subtotal.toLocaleString()}</div>
      </div>
    `;

    safeImgSet(div.querySelector(".item-img"));

    // abrir modal editar (si existe)
    div.addEventListener("click", () => {
      abrirEditar(item);
    });

    frag.appendChild(div);
  });

  contenedorCarritoEl.appendChild(frag);

  if (totalCarritoEl) {
    totalCarritoEl.textContent = `$${calcularTotal().toLocaleString()}`;
  }
}


async function agregarAlCarrito(producto) {
  if (!producto || !producto.id) {
    console.warn("⚠ Intento de agregar producto inválido (sin id).", producto);
    return;
  }

  // normalizar
  producto.cantidad = Number(producto.cantidad) || 1;
  producto.precio = Number(producto.precio) || 0;

  // buscar existente por id
  const existente = carrito.find(p => (p.id || p.id_producto) === producto.id);

  if (existente) {
    existente.cantidad = (Number(existente.cantidad) || 0) + producto.cantidad;
    if (backendActivo) await syncAdd(producto.id, producto.cantidad);
  } else {
    // si producto viene con img relativa, no tocarla (debido a que en cargarCarrito ya normalizamos)
    carrito.push({
      id: producto.id,
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || 0,
      img: producto.img || producto.imgUrl || "Media/sabor.png",
      cantidad: producto.cantidad
    });
    if (backendActivo) await syncAdd(producto.id, producto.cantidad);
  }

  guardarCarrito();
  renderCarrito();
}


function abrirEditar(p) {
  ensureElements();
  productoActual = p;
  if (!modalEditarEl) return;

  const imgEl = document.getElementById("editar-img");
  const nombreEl = document.getElementById("editar-nombre");
  const precioEl = document.getElementById("editar-precio");

  if (imgEl) imgEl.src = p.img || p.imgUrl || "Media/sabor.png";
  if (nombreEl) nombreEl.textContent = p.nombre || "";
  if (editarDescEl) editarDescEl.textContent = p.descripcion || "";
  if (precioEl) precioEl.textContent = `$${Number(p.precio || 0).toLocaleString()}`;
  if (editarCantidadEl) editarCantidadEl.textContent = String(p.cantidad || 1);

  modalEditarEl.classList.add("open");
}


document.addEventListener("DOMContentLoaded", async () => {
  // localizar elementos una vez DOM listo
  contenedorCarritoEl = document.querySelector(".carrito-items");
  totalCarritoEl = document.getElementById("totalCarrito") || document.getElementById("total-carrito");
  modalCarritoEl = document.getElementById("modal-carrito");
  modalEditarEl = document.getElementById("modal-editar-carrito");
  editarCantidadEl = document.getElementById("editar-cantidad");
  editarDescEl = document.getElementById("editar-desc");

  const btnCarrito = document.getElementById("btn-carrito");
  const cerrarCarrito = document.getElementById("cerrar-carrito");
  const btnVaciar = document.getElementById("vaciar-carrito");
  const btnAgregarModal = document.getElementById("btn-agregar-modal");
  const btnSumar = document.getElementById("editar-sumar");
  const btnRestar = document.getElementById("editar-restar");
  const btnEliminar = document.getElementById("editar-eliminar");
  const btnGuardar = document.getElementById("editar-guardar");

  const correoUsuario = sessionStorage.getItem("correoUsuario");
  if (correoUsuario) {
    try {
      const res = await fetch(`https://slapi.onrender.com/usuario/${encodeURIComponent(correoUsuario)}`);
      if (res.ok) {
        const data = await res.json();
        idUsuario = data._id || data.id || null;
        backendActivo = Boolean(idUsuario);
      }
    } catch (err) {
      console.warn("No se pudo resolver usuario en backend:", err);
    }
  }

  // cargar carrito (espera para que async termine antes de render)
  await cargarCarrito();

  // listeners UI
  if (btnCarrito) btnCarrito.addEventListener("click", () => modalCarritoEl?.classList.add("open"));
  if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => modalCarritoEl?.classList.remove("open"));

  if (btnVaciar) btnVaciar.addEventListener("click", async () => {
    carrito = [];
    guardarCarrito();
    renderCarrito();
    await syncClear();
  });

  if (btnAgregarModal) {
    btnAgregarModal.addEventListener("click", () => {
      const id = document.getElementById("detalle-id")?.value;
      const nombre = document.getElementById("detalle-nombre")?.textContent?.trim() || "";
      const precio = Number((document.getElementById("detalle-precio")?.textContent || "").replace(/[^0-9\.,]/g, "").replace(",", ".") ) || 0;
      const img = document.getElementById("detalle-img")?.src || "Media/sabor.png";
      const cantidad = Number(document.getElementById("cantidad")?.textContent) || 1;

      if (!id) {
        console.warn("⚠ Modal detalle no proporcionó ID - no se agrega.");
        return;
      }

      agregarAlCarrito({ id, nombre, descripcion: "", precio, img, cantidad });

      const modalDet = document.getElementById("modal-producto");
      if (modalDet) modalDet.classList.remove("open");
    });
  }

  // editar modal controls
  if (btnSumar) btnSumar.addEventListener("click", () => {
    if (!productoActual) return;
    productoActual.cantidad = (Number(productoActual.cantidad) || 1) + 1;
    if (editarCantidadEl) editarCantidadEl.textContent = String(productoActual.cantidad);
  });

  if (btnRestar) btnRestar.addEventListener("click", () => {
    if (!productoActual) return;
    if ((Number(productoActual.cantidad) || 1) > 1) {
      productoActual.cantidad = Number(productoActual.cantidad) - 1;
      if (editarCantidadEl) editarCantidadEl.textContent = String(productoActual.cantidad);
    }
  });

  if (btnEliminar) btnEliminar.addEventListener("click", async () => {
    if (!productoActual) return;
    carrito = carrito.filter(p => p.id !== productoActual.id);
    await syncRemove(productoActual.id);
    guardarCarrito();
    renderCarrito();
    modalEditarEl?.classList.remove("open");
    productoActual = null;
  });

  if (btnGuardar) btnGuardar.addEventListener("click", async () => {
    if (!productoActual) return;
    const nuevaCantidad = Number(editarCantidadEl?.textContent) || 1;
    const diferencia = nuevaCantidad - Number(productoActual.cantidad || 0);
    productoActual.cantidad = nuevaCantidad;
    if (diferencia !== 0 && backendActivo) {
      await syncAdd(productoActual.id, diferencia);
    }
    guardarCarrito();
    renderCarrito();
    modalEditarEl?.classList.remove("open");
    productoActual = null;
  });

  // delegación + de las cards
  document.body.addEventListener("click", (e) => {
    if (!e.target?.classList?.contains("add-btn")) return;
    const card = e.target.closest(".card-item");
    if (!card) return;

    const id = card.dataset.id || card.getAttribute("data-id");
    const nombre = card.querySelector(".card-title")?.textContent?.trim() || "";
    const precioTxt = card.querySelector(".price")?.textContent || "0";
    const precio = Number(precioTxt.replace(/[^0-9\.,-]/g, "").replace(",", ".")) || 0;
    const img = card.querySelector("img")?.src || "Media/sabor.png";

    agregarAlCarrito({ id, nombre, descripcion: card.dataset.descripcion || "", precio, img, cantidad: 1 });
  });

  // inicial render
  renderCarrito();

  // Exponer global
  window.agregarAlCarrito = agregarAlCarrito;
  window.carrito = carrito;
});