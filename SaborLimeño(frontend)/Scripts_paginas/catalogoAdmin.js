// catalogoAdmin.js
(function () {

  // ELEMENTOS DEL DOM
  const btnEditar = document.getElementById("btn-editar");
  const adminControls = document.getElementById("admin-controls");
  const btnAbrirAgregar = document.getElementById("btn-abrir-agregar");
  const btnFinalizar = document.getElementById("btn-finalizar");

  const modalAgregar = document.getElementById("modal-agregar-producto");
  const cerrarModalAgregar = document.getElementById("cerrar-modal-agregar");
  const cancelarAgregar = document.getElementById("cancelar-agregar");
  const formAgregar = document.getElementById("form-agregar-producto");
  const modalAgregarTitle = document.getElementById("modal-agregar-title");

  // Inputs
  const inpNombre = document.getElementById("nombre-producto");
  const inpCategoria = document.getElementById("categoria-producto");
  const inpPrecio = document.getElementById("precio-producto");
  const inpImagen = document.getElementById("imagen-producto");
  const inpFile = document.getElementById("imagen-producto-file"); 
  const inpFilename = document.getElementById("filename-producto"); 
  const inpDescripcion = document.getElementById("descripcion-producto");
  const inpDisponible = document.getElementById("disponible-producto");


  // CONFIG API
  const API_PRODUCTOS = "https://slapi.onrender.com/producto";
  const API_USUARIO = "https://slapi.onrender.com/usuario";
  const API_UPLOAD_IMAGE = "https://slapi.onrender.com/producto/upload-image";

  let isEditing = false;
  let editTarget = { categoria: null, id: null };

  // CARGAR USUARIO
  async function cargarUsuario() {
    const correo = sessionStorage.getItem("correoUsuario");
    if (!correo) return null;
    try {
      const res = await fetch(`${API_USUARIO}/${encodeURIComponent(correo)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("❌ Error cargando usuario:", err);
      return null;
    }
  }

  // INICIAR ADMIN
  async function initAdmin() {
    const user = await cargarUsuario();
    if (!user || user.rol !== "admin") {
      btnEditar.style.display = "none";
      adminControls.style.display = "none";
      return;
    }
    window.usuarioActual = user;
    activarLogicaAdmin();
  }

  // LÓGICA ADMIN
  function activarLogicaAdmin() {

    btnEditar.addEventListener("click", () => {
      isEditing = true;
      btnEditar.style.display = "none";
      adminControls.classList.add("show");
      btnFinalizar.style.display = "inline-block";
      window.mostrarCatalogo(true);
    });

    btnFinalizar.addEventListener("click", () => {
      isEditing = false;
      btnEditar.style.display = "inline-block";
      btnFinalizar.style.display = "none";
      adminControls.classList.remove("show");
      window.mostrarCatalogo(false);
    });

    btnAbrirAgregar.addEventListener("click", () => {
      isEditing = false;
      editTarget = { categoria: null, id: null };
      modalAgregarTitle.textContent = "Agregar producto";
      formAgregar.reset();
      inpImagen.value = "";
      inpFilename.value = "";
      openModal(modalAgregar);
    });

    cerrarModalAgregar.addEventListener("click", () => closeModal(modalAgregar));
    cancelarAgregar.addEventListener("click", () => closeModal(modalAgregar));
    modalAgregar.addEventListener("click", (e) => {
      if (e.target === modalAgregar) closeModal(modalAgregar);
    });

    // GUARDAR PRODUCTO
    formAgregar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = inpNombre.value.trim();
      const categoria = inpCategoria.value.trim();
      const precio = parseFloat(inpPrecio.value);
      const descripcion = inpDescripcion.value.trim();
      const stock = inpDisponible.checked ? 1 : 0;
      const filename = inpFilename.value.trim();

      if (!nombre || !categoria) return alert("Nombre y categoría son obligatorios");

      const payload = {
        nombre,
        categoria,
        precio,
        descripcion,
        stock,
        img: "/media/plato.png" // placeholder por defecto
      };

      const archivoImagen = inpFile.files?.[0] || null;

      try {
        // Subir imagen si seleccionó archivo
        if (archivoImagen) {
          const urlImagen = await subirImagen(archivoImagen, filename || null);
          payload.img = urlImagen;
        } else if (filename) {
          // Solo cambió nombre de archivo
          payload.img = "/media/" + filename;
        }

        // PUT o POST según sea edición o creación
        if (isEditing && editTarget.id) {
          await actualizarProductoBackend(editTarget.id, payload);
          alert("Producto actualizado");
        } else {
          await crearProductoBackend(payload);
          alert("Producto agregado");
        }

        // Recargar catálogo
        if (window.cargarProductosBackend) await window.cargarProductosBackend();
        window.mostrarCatalogo(isEditing);
        closeModal(modalAgregar);

      } catch (err) {
        console.error(err);
        alert("Error al guardar producto");
      }
    });

// EDITAR DESDE TARJETA
window.openEditarProducto = function (id) {
  for (const cat in window.productos) {
    const p = window.productos[cat].find(x => x.id === id);
    if (p) {
      isEditing = true;
      editTarget = { categoria: cat, id };
      modalAgregarTitle.textContent = "Editar producto";

      // Solo asignamos los valores si los inputs existen
      if (inpNombre) inpNombre.value = p.nombre || "";
      if (inpCategoria) inpCategoria.value = cat || "";
      if (inpPrecio) inpPrecio.value = p.precio || 0;
      if (inpDescripcion) inpDescripcion.value = p.descripcion || "";
      if (inpDisponible) inpDisponible.checked = p.disponible ? true : false;
      if (inpImagen) inpImagen.value = p.img || "";
      if (inpFile) inpFile.value = ""; 
      if (inpFilename) inpFilename.value = "";

      openModal(modalAgregar);
      return;
    }
  }
  alert("Producto no encontrado");
};

  // GUARDAR PRODUCTO (CREAR O EDITAR)
  formAgregar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = inpNombre.value.trim();
    const categoria = inpCategoria.value.trim();
    const precio = parseFloat(inpPrecio.value);
    const descripcion = inpDescripcion.value.trim();
    const stock = inpDisponible.checked ? 1 : 0;
    const filename = inpFilename.value.trim();

    if (!nombre || !categoria) return alert("Nombre y categoría son obligatorios");

    const payload = {
      nombre,
      categoria,
      precio,
      descripcion,
      stock,
      img: "/media/plato.png"
    };

    const archivoImagen = inpFile.files?.[0] || null;

    try {
      // Subir imagen si seleccionó archivo
      if (archivoImagen) {
        const urlImagen = await subirImagen(archivoImagen, filename || null);
        payload.img = urlImagen;
      } else if (filename) {
        // Solo cambió nombre de archivo
        payload.img = "/media/" + filename;
      }

      // PUT o POST según sea edición o creación
      if (isEditing && editTarget.id) {
        await actualizarProductoBackend(editTarget.id, payload);
        alert("Producto actualizado");
      } else {
        await crearProductoBackend(payload);
        alert("Producto agregado");
      }

      // Recargar catálogo
      if (window.cargarProductosBackend) await window.cargarProductosBackend();
      window.mostrarCatalogo(isEditing);
      closeModal(modalAgregar);

    } catch (err) {
      console.error(err);
      alert("Error al guardar producto");
    }
  });

    // 8) ELIMINAR
    window.eliminarProducto = async function (id) {
      if (!confirm("¿Eliminar este producto?")) return;
      await eliminarProductoBackend(id);
      if (window.cargarProductosBackend) await window.cargarProductosBackend();
      window.mostrarCatalogo(isEditing);
      alert("Producto eliminado");
    };
  }

  // SUBIR IMAGEN
  async function subirImagen(file, filename = null) {
    const formData = new FormData();
    formData.append("file", file);
    if (filename) formData.append("filename", filename);

    const resp = await fetch(API_UPLOAD_IMAGE, {
      method: "POST",
      body: formData
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      throw new Error("Error subiendo imagen: " + (text || resp.status));
    }

    const data = await resp.json();
    return data.url || "/media/plato.png";
  }

  // CREAR PRODUCTO BACKEND
  async function crearProductoBackend(payload) {
    const usuarioHeader = window.usuarioActual?.correo || "admin";

    const resp = await fetch(`${API_PRODUCTOS}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "usuario": usuarioHeader
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      console.error("Error creando producto. Status:", resp.status, "Response:", text);
      throw new Error("Error creando producto: " + (text || resp.status));
    }

    return await resp.json();
  }

  // ACTUALIZAR PRODUCTO BACKEND
  async function actualizarProductoBackend(id, payload) {
    const usuarioHeader = window.usuarioActual?.correo || "admin";

    const resp = await fetch(`${API_PRODUCTOS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "usuario": usuarioHeader
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      console.error("Error actualizando producto. Status:", resp.status, "Response:", text);
      throw new Error("Error actualizando producto: " + (text || resp.status));
    }

    return await resp.json();
  }

  // ELIMINAR PRODUCTO BACKEND
  async function eliminarProductoBackend(id) {
    const usuarioHeader = window.usuarioActual?.correo || "admin";

    const resp = await fetch(`${API_PRODUCTOS}/${id}`, {
      method: "DELETE",
      headers: { "usuario": usuarioHeader }
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      console.error("Error eliminando producto. Status:", resp.status, "Response:", text);
      throw new Error("Error eliminando producto: " + (text || resp.status));
    }

    return await resp.json();
  }

  // MODALES
  function openModal(el) {
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(el) {
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  initAdmin();

})();