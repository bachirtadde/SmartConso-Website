(() => {
  "use strict";

  const API_BASE_URL = "https://api.smartconso.app/api/v1";

  const form = document.getElementById("delete-account-form");
  const mainSection = document.querySelector(".delete-account-section");
  const successSection = document.getElementById("deletion-success");
  const message = document.getElementById("form-message");
  const submitButton = document.getElementById("delete-submit");
  const confirmationInput = document.getElementById("confirmation");
  const passwordInput = document.getElementById("password");
  const loginInput = document.getElementById("login");
  const understandInput = document.getElementById("understand");
  const passwordToggle = document.querySelector("[data-password-toggle]");

  if (!form) {
    return;
  }

  const showMessage = (text, type = "error") => {
    message.textContent = text;
    message.className = `form-message is-${type}`;
    message.hidden = false;
  };

  const clearMessage = () => {
    message.textContent = "";
    message.className = "form-message";
    message.hidden = true;
  };

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    submitButton.classList.toggle("is-loading", loading);
    submitButton.setAttribute("aria-busy", String(loading));

    const label = submitButton.querySelector(".button-label");
    if (label) {
      label.textContent = loading
        ? "Suppression en cours…"
        : "Supprimer définitivement mon compte";
    }
  };

  const extractErrorMessage = async (response) => {
    try {
      const payload = await response.json();

      if (typeof payload?.detail === "string") {
        return payload.detail;
      }

      if (Array.isArray(payload?.detail)) {
        return payload.detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join(" ");
      }
    } catch (_) {
      // La réponse n'est pas au format JSON.
    }

    if (response.status === 401) {
      return "Identifiant ou mot de passe incorrect.";
    }

    if (response.status === 429) {
      return "Trop de tentatives. Réessayez dans quelques instants.";
    }

    return "Une erreur est survenue. Votre compte n’a pas été supprimé.";
  };

  const login = async (loginValue, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        login: loginValue,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }

    const payload = await response.json();

    if (!payload?.access_token) {
      throw new Error(
        "La connexion a réussi, mais aucun jeton d’accès n’a été reçu."
      );
    }

    return payload.access_token;
  };

  const deleteAccount = async (accessToken, password, confirmation) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        password,
        confirmation,
      }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }

    return response.json();
  };

  passwordToggle?.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";
    passwordToggle.textContent = isVisible ? "Afficher" : "Masquer";
    passwordToggle.setAttribute("aria-pressed", String(!isVisible));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const loginValue = loginInput.value.trim();
    const password = passwordInput.value;
    const confirmation = confirmationInput.value.trim().toUpperCase();

    if (!loginValue) {
      showMessage("Saisissez votre adresse e-mail ou votre identifiant.");
      loginInput.focus();
      return;
    }

    if (!password) {
      showMessage("Saisissez votre mot de passe actuel.");
      passwordInput.focus();
      return;
    }

    if (confirmation !== "SUPPRIMER") {
      showMessage("Saisissez exactement SUPPRIMER pour confirmer.");
      confirmationInput.focus();
      return;
    }

    if (!understandInput.checked) {
      showMessage(
        "Cochez la case confirmant que vous comprenez le caractère définitif de cette action."
      );
      understandInput.focus();
      return;
    }

    setLoading(true);
    showMessage(
      "Connexion sécurisée et suppression de votre compte en cours…",
      "info"
    );

    try {
      const accessToken = await login(loginValue, password);
      await deleteAccount(accessToken, password, confirmation);

      form.reset();
      mainSection.hidden = true;
      successSection.hidden = false;
      successSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Votre compte n’a pas été supprimé."
      );
    } finally {
      setLoading(false);
    }
  });
})();
