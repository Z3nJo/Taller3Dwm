async function recuperar() {
    const tokenIngresado = document.getElementById("token").value.trim();

    if (!tokenIngresado) {
        new bootstrap.Modal(document.getElementById('m5')).show(); // Modal de campo vacío
        return;
    }

    try {
        // Verificar token con backend
        const res = await fetch("https://slapi.onrender.com/auth/verificar-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenIngresado })
        });

        const data = await res.json();
        console.log("[DEBUG] Verificación token backend:", data);

        if (data.status === "ok") {
            // Guardamos el correo asociado al token
            localStorage.setItem("correoRecuperacion", data.correo);

            // Token válido: mostrar modal para cambiar contraseña
            new bootstrap.Modal(document.getElementById('m6')).show();
        } else {
            // Token inválido o expirado
            new bootstrap.Modal(document.getElementById('m7')).show();
        }

    } catch (error) {
        console.error("[ERROR] recuperar():", error);
        alert("Error al verificar el token.");
    }
}

async function cambiarContraseña() {
    const newPassword = document.getElementById("newPsw").value.trim();
    const confirmarPassword = document.getElementById("confirmarPsw").value.trim();
    const token = document.getElementById("token").value.trim(); // token ingresado en el modal

    if (!newPassword || !confirmarPassword) {
        new bootstrap.Modal(document.getElementById('m8')).show(); // Modal campos vacíos
        return;
    }

    if (newPassword !== confirmarPassword) {
        new bootstrap.Modal(document.getElementById('m9')).show(); // Modal contraseñas no coinciden
        return;
    }

    const correoRecuperacion = localStorage.getItem("correoRecuperacion");
    if (!correoRecuperacion) {
        alert("No se indicó ningún correo para recuperación.");
        return;
    }

    if (!token) {
        alert("No se proporcionó el token de recuperación.");
        return;
    }

    try {
        // Llamar al endpoint /usuario/recuperar con la nueva contraseña
        const res = await fetch("https://slapi.onrender.com/usuario/recuperar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correo: correoRecuperacion,
                token: token,
                nueva_passw: newPassword,
                confirm_passw: confirmarPassword
            })
        });

        const data = await res.json();
        console.log("[DEBUG] Recuperación backend:", data);

        if (data.status === "ok") {
            new bootstrap.Modal(document.getElementById('m10')).show();
            localStorage.removeItem("correoRecuperacion");
            localStorage.removeItem("tokenRecuperacion");
            document.getElementById("token").value = "";
            document.getElementById("newPsw").value = "";
            document.getElementById("confirmarPsw").value = "";
        } else {
            alert(data.msg || "Error al actualizar contraseña.");
        }

    } catch (error) {
        console.error("[ERROR] cambiarContraseña():", error);
        alert("Hubo un error al actualizar la contraseña.");
    }
}