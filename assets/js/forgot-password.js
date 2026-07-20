(() => {
  "use strict";

  const API_BASE_URL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:8000/api/v1"
      : "https://api.smartconso.app/api/v1";

  const form = document.getElementById("forgot-password-form");
  const emailInput = document.getElementById("email");
  const message = document.getElementById("forgot-message");
  const submit = document.getElementById("forgot-submit");

  if (!form) return;

  const showMessage = (text, type) => {
    message.textContent = text;
    message.className = `form-message is-${type}`;
    message.hidden = false;
  };

  const setLoading = (loading) => {
    submit.disabled = loading;
    submit.classList.toggle("is-loading", loading);
    submit.setAttribute("aria-busy", String(loading));
    submit.querySelector(".button-label").textContent = loading
      ? "Envoi en cours…"
      : "Recevoir le lien de réinitialisation";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email || !emailInput.validity.valid) {
      showMessage("Saisissez une adresse e-mail valide.", "error");
      emailInput.focus();
      return;
    }

    setLoading(true);
    showMessage("Envoi de la demande en cours…", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error();
      }

      form.reset();
      showMessage(
        "Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d’être envoyé.",
        "success"
      );
    } catch (_) {
      showMessage(
        "La demande n’a pas pu être envoyée. Réessayez dans quelques instants.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
