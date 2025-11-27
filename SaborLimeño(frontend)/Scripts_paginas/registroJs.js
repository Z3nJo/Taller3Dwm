document.addEventListener("DOMContentLoaded", function () {
    const TIEMPO_INACTIVIDAD = 5 * 60 * 1000; // 5 minutos
    let timeoutID;

    function resetIdleTimer() {
        if (timeoutID) clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            sessionStorage.removeItem("usuarioActivo");
            alert("Por inactividad, se cerró tu sesión.");
            window.location.href = "login.html";
        }, TIEMPO_INACTIVIDAD);
    }

    // Reinicia contador con cualquier actividad del usuario
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer);
    });

    // --- REGISTRO ---
    window.registrar = async function () {
        try {
            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("email").value.trim();
            const password = document.getElementById("psw").value.trim();

            // Validaciones básicas
            if (!nombre || !correo || !password) {
                new bootstrap.Modal(document.getElementById('m2')).show();
                return;
            }

            if (password.length < 8) {
                new bootstrap.Modal(document.getElementById('m3')).show();
                return;
            }

            // Validación de correo simple
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(correo)) {
                alert("Por favor ingresa un correo electrónico válido.");
                return;
            }

            // Crear objeto según tu modelo Pydantic
            const nuevoUsuario = {
                nombre: nombre,
                correo: correo,
                passw: password,
                rol: "cliente"
            };

            console.log("📤 Enviando usuario a API:", nuevoUsuario);

            // Llamada a la API FastAPI
            const response = await fetch("https://slapi.onrender.com/usuario/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoUsuario)
            });

            if (!response.ok) {
                console.error("❌ Error HTTP:", response.status, response.statusText);
                alert("Error de conexión con el servidor. Inténtalo más tarde.");
                return;
            }

            const data = await response.json();
            console.log("📥 Respuesta de la API:", data);

            if (data.status === "ok") {
                console.log("✅ Usuario registrado correctamente en MongoDB");

                // Guardar correo del usuario en sessionStorage
                sessionStorage.setItem("correoUsuario", correo);

                resetIdleTimer();

                // Limpiar inputs
                document.getElementById("nombre").value = "";
                document.getElementById("email").value = "";
                document.getElementById("psw").value = "";

                // Mostrar modal éxito
                const modalExito = new bootstrap.Modal(document.getElementById('m1'));
                modalExito.show();

                const modalEl = document.getElementById('m1');
                modalEl.addEventListener('hidden.bs.modal', () => {
                    // Redirigir al perfil después del registro
                    window.location.href = "perfilUsuario.html";
                });

            } else if (data.status === "error" && data.msg) {
                alert("⚠️ " + data.msg);
            } else {
                alert("Error desconocido. Revisa la consola.");
                console.warn("Respuesta inesperada:", data);
            }

        } catch (error) {
            console.error("🔥 Error en registrar():", error);
            alert("Error interno al intentar registrar. Ver consola para más detalles.");
        }
    };

    // --- CERRAR SESIÓN MANUAL ---
    window.cerrarSesion = function () {
        sessionStorage.removeItem("usuarioActivo");
        sessionStorage.removeItem("correoUsuario");
        window.location.href = "login.html";
    };
});