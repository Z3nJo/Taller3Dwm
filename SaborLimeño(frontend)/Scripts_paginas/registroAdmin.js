document.addEventListener("DOMContentLoaded", function () {

    // REGISTRAR USUARIO (ADMIN)
    window.registrar = async function () {
        try {
            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("email").value.trim();
            const password = document.getElementById("psw").value.trim();
            const rol = document.getElementById("rol")?.value || "cliente"; 

            if (!nombre || !correo || !password) {
                new bootstrap.Modal(document.getElementById('m2')).show();
                return;
            }

            if (password.length < 8) {
                new bootstrap.Modal(document.getElementById('m3')).show();
                return;
            }

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(correo)) {
                alert("Por favor ingresa un correo electrónico válido.");
                return;
            }

            // Objeto compatible con tu modelo Pydantic Usuario
            const nuevoUsuario = {
                nombre: nombre,
                correo: correo,
                passw: password,
                rol: rol
            };

            console.log("📤 Enviando usuario a API:", nuevoUsuario);

            const response = await fetch("http://127.0.0.1:8000/usuario/registro", {
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
                sessionStorage.setItem("correoUsuario", correo);

                document.getElementById("nombre").value = "";
                document.getElementById("email").value = "";
                document.getElementById("psw").value = "";

                const modalExito = new bootstrap.Modal(document.getElementById('m1'));
                modalExito.show();
                const modalEl = document.getElementById('m1');
                modalEl.addEventListener('hidden.bs.modal', () => {
                });

            } else if (data.status === "error" && data.msg) {
                alert("⚠️ " + data.msg);
            } else {
                alert("Error desconocido. Revisa la consola.");
                console.warn("Respuesta inesperada:", data);
            }

        } catch (error) {
            console.error("🔥 Error en registrarAdmin():", error);
            alert("Error interno al intentar registrar. Ver consola para más detalles.");
        }
    };

    // CERRAR SESIÓN MANUAL
    window.cerrarSesion = function () {
        sessionStorage.removeItem("usuarioActivo");
        sessionStorage.removeItem("correoUsuario");
    };

});
