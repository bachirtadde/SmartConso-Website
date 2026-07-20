(() => {
  "use strict";

  const API_BASE_URL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:8000/api/v1"
      : "https://api.smartconso.app/api/v1";

  const params = new URLSearchParams(location.search);
  const token =
    params.get("token") ||
    params.get("reset_token") ||
    params.get("code") ||
    "";

  const form = document.getElementById("reset-password-form");
  const invalidTokenMessage = document.getElementById("invalid-token-message");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const message = document.getElementById("reset-message");
  const submit = document.getElementById("reset-submit");
  const success = document.getElementById("reset-success");

  if (!form) return;

  const showMessage = (text, type = "error") => {
    message.textContent = text;
    message.className = `form-message is-${type}`;
    message.hidden = false;
  };

  const setLoading = (loading) => {
    submit.disabled = loading;
    submit.classList.toggle("is-loading", loading);
    submit.setAttribute("aria-busy", String(loading));
    submit.querySelector(".button-label").textContent = loading
      ? "Modification en cours…"
      : "Modifier mon mot de passe";
  };

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Afficher" : "Masquer";
      button.setAttribute("aria-pressed", String(!visible));
    });
  });

  if (!token) {
    invalidTokenMessage.hidden = false;
    form.hidden = true;
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 8) {
      showMessage("Le mot de passe doit comporter au moins 8 caractères.");
      newPasswordInput.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Les deux mots de passe ne correspondent pas.");
      confirmPasswordInput.focus();
      return;
    }

    setLoading(true);
    showMessage("Vérification du lien et modification en cours…", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const payload = await response.json();
          detail = typeof payload?.detail === "string" ? payload.detail : "";
        } catch (_) {}

        throw new Error(
          detail || "Le lien est invalide ou a expiré. Demandez un nouveau lien."
        );
      }

      form.reset();
      form.hidden = true;
      message.hidden = true;
      success.hidden = false;
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Le mot de passe n’a pas pu être modifié."
      );
    } finally {
      setLoading(false);
    }
  });
})();
