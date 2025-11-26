document.addEventListener("DOMContentLoaded", function() {
    let intentosFallidos = 0;
    const MAX_INTENTOS = 5;
    const BLOQUEO_MINUTOS = 5;

    // --- Sesión e inactividad ---
    const TIEMPO_INACTIVIDAD = 5 * 60 * 1000;
    let timeoutID;

    function resetIdleTimer() {
        if (timeoutID) clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            sessionStorage.removeItem("usuarioActivo");
            alert("Por inactividad, se cerró tu sesión.");
            window.location.href = "loginDsp.html";
        }, TIEMPO_INACTIVIDAD);
    }

    ['mousemove','keydown','scroll','click'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer);
    });

    // --- Función de login ---
    async function logear() {
        console.log("✅ logear() ejecutado correctamente");

        const correoInput = document.getElementById("nombre");
        const passwordInput = document.getElementById("psw");

        if (!correoInput || !passwordInput) {
            console.error("❌ No se encontraron los campos de entrada.");
            return;
        }

        const correo = correoInput.value.trim();
        const password = passwordInput.value.trim();

        if (!correo || !password) {
            const modal = document.getElementById('m1');
            if (modal) new bootstrap.Modal(modal).show();
            return;
        }

        // Bloqueos locales
        let bloqueos = JSON.parse(localStorage.getItem("bloqueos")) || {};
        const ahora = Date.now();

        if (bloqueos[correo] && ahora < bloqueos[correo]) {
            const modal = document.getElementById('m3');
            if (modal) new bootstrap.Modal(modal).show();
            return;
        }

        try {
            console.log("📡 Enviando datos al backend...");
            const respuesta = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: correo, passw: password })
            });

            const data = await respuesta.json();
            console.log("📩 Respuesta del backend:", data);

            if (data.status === "ok") {

                // VALIDAR QUE SEA DESPACHADOR
                if (!data.usuario || data.usuario.rol !== "despachador") {
                    console.warn("⛔ Usuario NO autorizado para esta sección.");
                    const modal = document.getElementById('m12'); 
                    if (modal) new bootstrap.Modal(modal).show();
                    return;
                }

                // Rol correcto permitir acceso
                console.log("🟢 Usuario con rol despachador validado.");

                sessionStorage.setItem("correoUsuario", correoInput.value);
                resetIdleTimer();
                intentosFallidos = 0;

                window.location.href = "pedidosPendientes.html";

            } else {

                intentosFallidos++;

                if (intentosFallidos >= MAX_INTENTOS) {
                    const desbloqueo = ahora + BLOQUEO_MINUTOS * 60 * 1000;
                    bloqueos[correo] = desbloqueo;
                    localStorage.setItem("bloqueos", JSON.stringify(bloqueos));

                    const modal = document.getElementById('m3');
                    if (modal) new bootstrap.Modal(modal).show();
                    intentosFallidos = 0;

                } else {
                    const modal = document.getElementById('m2');
                    if (modal) new bootstrap.Modal(modal).show();
                }
            }

        } catch (error) {
            console.error("💥 Error al iniciar sesión:", error);
            alert("Error de conexión con el servidor.");
        }
    }

    window.logear = logear;

    const btn = document.getElementById("btnLog");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            logear();
        });
    }

    window.cerrarSesion = function() {
        sessionStorage.removeItem("usuarioActivo");
        window.location.href = "loginDsp.html";
    };
});
