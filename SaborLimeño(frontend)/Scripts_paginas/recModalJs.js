function correoInput(event) {
    const modalEl = document.getElementById('m11'); 
    if (modalEl) {
        new bootstrap.Modal(modalEl, {}).show(); 
    }
}

async function recModal(event) {
    let correo = document.getElementById("recEmail").value.trim();

    if (correo === "") {
        alert("Debes ingresar un correo electrónico.");
        return;
    }

    try {
        // Solicitar token al backend
        const res = await fetch("http://127.0.0.1:8000/auth/enviar-token-recuperacion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo })
        });

        const data = await res.json();
        console.log("[DEBUG] Respuesta backend generar token:", data);

        if (data.status === "error") {
            alert(data.msg);
            return;
        }

        // Guardar correo y token en localStorage
        localStorage.setItem("correoRecuperacion", correo);
        localStorage.setItem("tokenRecuperacion", data.token);
        console.log("[DEBUG] Token guardado:", data.token);

        // Mostrar modal para ingresar token
        const modalEl = document.getElementById('m4');
        if (modalEl) {
            new bootstrap.Modal(modalEl, {}).show();
        }

    } catch (error) {
        console.error("[ERROR] recModal:", error);
        alert("Hubo un error al solicitar la recuperación de contraseña.");
    }
}