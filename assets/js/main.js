(() => {
  "use strict";

  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const navigation = document.querySelector("[data-main-navigation]");
  const navigationToggle = document.querySelector("[data-navigation-toggle]");
  const currentYearElements = document.querySelectorAll(
    "[data-current-year]"
  );
  const betaForm = document.querySelector("[data-beta-form]");
  const formFeedback = document.querySelector("[data-form-feedback]");
  const contactForm = document.querySelector("[data-contact-form]");

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const API_BASE_URL = [
    "localhost",
    "127.0.0.1"
  ].includes(window.location.hostname)
    ? "http://localhost:8000/api/v1"
    : "https://api.smartconso.app/api/v1";

  /*
   * -------------------------------------------------------
   * Année automatique
   * -------------------------------------------------------
   */

  const setCurrentYear = () => {
    const currentYear = String(new Date().getFullYear());

    currentYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  };

  /*
   * -------------------------------------------------------
   * Header au défilement
   * -------------------------------------------------------
   */

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  /*
   * -------------------------------------------------------
   * Navigation mobile
   * -------------------------------------------------------
   */

  const closeNavigation = () => {
    if (!navigation || !navigationToggle) {
      return;
    }

    navigation.classList.remove("is-open");
    navigationToggle.setAttribute("aria-expanded", "false");
    navigationToggle.setAttribute("aria-label", "Ouvrir le menu");
    body.classList.remove("navigation-open");
  };

  const openNavigation = () => {
    if (!navigation || !navigationToggle) {
      return;
    }

    navigation.classList.add("is-open");
    navigationToggle.setAttribute("aria-expanded", "true");
    navigationToggle.setAttribute("aria-label", "Fermer le menu");
    body.classList.add("navigation-open");
  };

  const toggleNavigation = () => {
    if (!navigationToggle) {
      return;
    }

    const isOpen =
      navigationToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeNavigation();
      return;
    }

    openNavigation();
  };

  const initializeNavigation = () => {
    if (!navigation || !navigationToggle) {
      return;
    }

    navigationToggle.addEventListener("click", toggleNavigation);

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
      }
    });

    document.addEventListener("click", (event) => {
      const isOpen =
        navigationToggle.getAttribute("aria-expanded") === "true";

      if (!isOpen) {
        return;
      }

      const clickedInsideNavigation = navigation.contains(event.target);
      const clickedToggle = navigationToggle.contains(event.target);

      if (!clickedInsideNavigation && !clickedToggle) {
        closeNavigation();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeNavigation();
      }
    });
  };

  /*
   * -------------------------------------------------------
   * Défilement fluide vers les ancres
   * -------------------------------------------------------
   */

  const initializeSmoothAnchors = () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start"
        });

        if (
          target instanceof HTMLElement &&
          !target.hasAttribute("tabindex")
        ) {
          target.setAttribute("tabindex", "-1");
        }

        window.setTimeout(() => {
          target.focus({
            preventScroll: true
          });
        }, prefersReducedMotion() ? 0 : 450);
      });
    });
  };

  /*
   * -------------------------------------------------------
   * Apparition progressive des éléments
   * -------------------------------------------------------
   */

  const initializeRevealAnimations = () => {
    const elements = document.querySelectorAll(
      [
        ".section-heading",
        ".step-card",
        ".feature-card",
        ".benefit-card",
        ".screenshots-placeholder article",
        ".faq-list details",
        ".beta-form",
        ".beta-form-aside > article",
        ".contact-form",
        ".contact-form-intro",
        ".beta-form-aside > article",
        ".product-preview-grid > div"
      ].join(",")
    );

    if (!elements.length) {
      return;
    }

    elements.forEach((element, index) => {
      element.classList.add("reveal-item");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 6, 5) * 65}ms`
      );
    });

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-revealed");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-revealed");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  };

  /*
   * -------------------------------------------------------
   * Animation légère des nombres
   * -------------------------------------------------------
   */

  const animateNumber = (element, targetValue) => {
    if (prefersReducedMotion()) {
      element.textContent = String(targetValue);
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(targetValue * easedProgress);

      element.textContent = String(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(update);
      }
    };

    window.requestAnimationFrame(update);
  };

  const initializeNumberAnimations = () => {
    const numberElements = document.querySelectorAll("[data-count-to]");

    if (!numberElements.length) {
      return;
    }

    const startAnimation = (element) => {
      if (element.dataset.countAnimated === "true") {
        return;
      }

      const targetValue = Number(element.dataset.countTo);

      if (!Number.isFinite(targetValue)) {
        return;
      }

      element.dataset.countAnimated = "true";
      animateNumber(element, targetValue);
    };

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      numberElements.forEach(startAnimation);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          startAnimation(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.65
      }
    );

    numberElements.forEach((element) => {
      observer.observe(element);
    });
  };

  /*
   * -------------------------------------------------------
   * Bouton retour en haut
   * -------------------------------------------------------
   */

  const createBackToTopButton = () => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Revenir en haut de la page");
    button.setAttribute("title", "Retour en haut");
    button.innerHTML = '<span aria-hidden="true">↑</span>';

    body.appendChild(button);

    const updateVisibility = () => {
      button.classList.toggle("is-visible", window.scrollY > 520);
    };

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, {
      passive: true
    });
  };

  /*
   * -------------------------------------------------------
   * FAQ
   * Une seule question ouverte à la fois
   * -------------------------------------------------------
   */

  const initializeFaq = () => {
    const faqLists = document.querySelectorAll(".faq-list");

    faqLists.forEach((faqList) => {
      const detailsElements = faqList.querySelectorAll("details");

      detailsElements.forEach((detailsElement) => {
        detailsElement.addEventListener("toggle", () => {
          if (!detailsElement.open) {
            return;
          }

          detailsElements.forEach((otherDetailsElement) => {
            if (otherDetailsElement !== detailsElement) {
              otherDetailsElement.open = false;
            }
          });
        });
      });
    });
  };

  /*
   * -------------------------------------------------------
   * Retour formulaire bêta
   * -------------------------------------------------------
   */

  const clearFormFeedback = () => {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = true;
    formFeedback.textContent = "";
    formFeedback.classList.remove("is-error");
  };

  const showFormFeedback = (message, isError = false) => {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = false;
    formFeedback.textContent = message;
    formFeedback.classList.toggle("is-error", isError);

    formFeedback.setAttribute(
      "role",
      isError ? "alert" : "status"
    );

    formFeedback.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest"
    });
  };

  const validateBetaForm = () => {
    if (!betaForm) {
      return false;
    }

    clearFormFeedback();

    const honeypot = betaForm.querySelector('[name="company"]');

    if (honeypot && honeypot.value.trim() !== "") {
      showFormFeedback(
        "Votre candidature n’a pas pu être envoyée.",
        true
      );

      return false;
    }

    if (!betaForm.checkValidity()) {
      betaForm.reportValidity();

      showFormFeedback(
        "Veuillez vérifier les champs obligatoires avant d’envoyer votre candidature.",
        true
      );

      return false;
    }

    const motivation = betaForm.querySelector('[name="motivation"]');
    const motivationLength = motivation?.value.trim().length ?? 0;

    if (motivationLength < 20 || motivationLength > 1000) {
      showFormFeedback(
        "Votre motivation doit contenir entre 20 et 1 000 caractères.",
        true
      );

      motivation?.focus();

      return false;
    }

    return true;
  };

  const initializeBetaForm = () => {
    if (!betaForm) {
      return;
    }

    const formOpenedAt = Date.now();
    const submitButton = betaForm.querySelector(
      'button[type="submit"]'
    );
    const defaultButtonText =
      submitButton?.textContent.trim() ||
      "Envoyer ma candidature";

    betaForm.addEventListener("input", clearFormFeedback);
    betaForm.addEventListener("change", clearFormFeedback);

    betaForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validateBetaForm()) {
        return;
      }

      if (Date.now() - formOpenedAt < 2500) {
        showFormFeedback(
          "Veuillez patienter quelques secondes avant d’envoyer le formulaire.",
          true
        );
        return;
      }

      const formData = new FormData(betaForm);

      const payload = {
        first_name: String(
          formData.get("first_name") || ""
        ).trim(),
        email: String(
          formData.get("email") || ""
        ).trim(),
        platform: String(
          formData.get("platform") || ""
        ),
        shopping_frequency: String(
          formData.get("shopping_frequency") || ""
        ),
        device_model:
          String(
            formData.get("device_model") || ""
          ).trim() || null,
        os_version:
          String(
            formData.get("os_version") || ""
          ).trim() || null,
        motivation: String(
          formData.get("motivation") || ""
        ).trim(),
        privacy_policy_accepted:
          formData.get("privacy_policy_accepted") === "true",
        marketing_consent:
          formData.get("marketing_consent") === "true",
        privacy_policy_version: String(
          formData.get("privacy_policy_version") || "1.0"
        ),
        source: String(
          formData.get("source") || "website"
        ),
        company: String(
          formData.get("company") || ""
        ).trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = "Envoi en cours…";
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/beta/applications`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        let responseData = null;

        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }

        if (!response.ok) {
          const apiMessage =
            responseData?.detail ||
            responseData?.message ||
            "Impossible d’enregistrer votre candidature pour le moment.";

          throw new Error(
            typeof apiMessage === "string"
              ? apiMessage
              : "Impossible d’enregistrer votre candidature pour le moment."
          );
        }

        betaForm.reset();

        showFormFeedback(
          responseData?.message ||
            "Votre candidature a bien été enregistrée. Merci pour votre intérêt pour SmartConso."
        );
      } catch (error) {
        console.error(
          "Échec de l’envoi de la candidature bêta :",
          error
        );

        showFormFeedback(
          error instanceof Error && error.message
            ? error.message
            : "Impossible d’envoyer votre candidature pour le moment.",
          true
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          submitButton.textContent = defaultButtonText;
        }
      }
    });
  };


  /*
   * -------------------------------------------------------
   * Formulaire de contact
   * -------------------------------------------------------
   */

  const initializeContactForm = () => {
    if (!contactForm) {
      return;
    }

    const statusElement = contactForm.querySelector(
      "[data-contact-status]"
    );
    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );
    const submitLabel = contactForm.querySelector(
      "[data-submit-label]"
    );
    const spinner = contactForm.querySelector(".button-spinner");
    const messageField = contactForm.elements.message;
    const messageCount = contactForm.querySelector(
      "[data-message-count]"
    );

    const fieldMessages = {
      name: "Indiquez votre nom.",
      email: "Indiquez une adresse e-mail valide.",
      category: "Sélectionnez une catégorie.",
      subject: "Indiquez le sujet de votre demande.",
      message: "Votre message doit contenir au moins 20 caractères.",
      consent: "Vous devez accepter l’utilisation de vos informations."
    };

    const trackedFieldNames = [
      "name",
      "email",
      "category",
      "subject",
      "message",
      "consent"
    ];

    const clearContactStatus = () => {
      if (!statusElement) {
        return;
      }

      statusElement.hidden = true;
      statusElement.textContent = "";
      statusElement.classList.remove(
        "form-status-success",
        "form-status-error"
      );
    };

    const showContactStatus = (message, isError = false) => {
      if (!statusElement) {
        return;
      }

      statusElement.hidden = false;
      statusElement.textContent = message;
      statusElement.classList.toggle(
        "form-status-success",
        !isError
      );
      statusElement.classList.toggle(
        "form-status-error",
        isError
      );
      statusElement.setAttribute(
        "role",
        isError ? "alert" : "status"
      );
    };

    const getErrorElement = (fieldName) =>
      contactForm.querySelector(
        `[data-error-for="${fieldName}"]`
      );

    const clearFieldError = (fieldName) => {
      const field = contactForm.elements[fieldName];
      const errorElement = getErrorElement(fieldName);

      if (field) {
        field.removeAttribute("aria-invalid");
      }

      if (errorElement) {
        errorElement.textContent = "";
      }
    };

    const showFieldError = (fieldName, message) => {
      const field = contactForm.elements[fieldName];
      const errorElement = getErrorElement(fieldName);

      if (field) {
        field.setAttribute("aria-invalid", "true");
      }

      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    const validateContactField = (fieldName) => {
      const field = contactForm.elements[fieldName];

      if (!field) {
        return true;
      }

      clearFieldError(fieldName);

      if (fieldName === "message") {
        const messageLength = field.value.trim().length;
        const isValid =
          messageLength >= 20 && messageLength <= 5000;

        if (!isValid) {
          showFieldError(
            fieldName,
            fieldMessages[fieldName]
          );
        }

        return isValid;
      }

      if (!field.checkValidity()) {
        showFieldError(
          fieldName,
          fieldMessages[fieldName]
        );

        return false;
      }

      return true;
    };

    const updateMessageCount = () => {
      if (!messageField || !messageCount) {
        return;
      }

      messageCount.textContent = String(
        messageField.value.length
      );
    };

    const setContactSubmitting = (isSubmitting) => {
      if (!submitButton) {
        return;
      }

      submitButton.disabled = isSubmitting;
      submitButton.setAttribute(
        "aria-busy",
        String(isSubmitting)
      );

      if (submitLabel) {
        submitLabel.textContent = isSubmitting
          ? "Envoi en cours…"
          : "Envoyer le message";
      }

      if (spinner) {
        spinner.hidden = !isSubmitting;
      }
    };

    trackedFieldNames.forEach((fieldName) => {
      const field = contactForm.elements[fieldName];

      if (!field) {
        return;
      }

      const inputEvent =
        field.type === "checkbox" ||
        field.tagName === "SELECT"
          ? "change"
          : "input";

      field.addEventListener(inputEvent, () => {
        clearFieldError(fieldName);
        clearContactStatus();
      });

      field.addEventListener("blur", () => {
        const shouldValidate =
          field.type === "checkbox"
            ? field.checked
            : field.value.trim() !== "";

        if (shouldValidate) {
          validateContactField(fieldName);
        }
      });
    });

    if (messageField) {
      messageField.addEventListener(
        "input",
        updateMessageCount
      );
    }

    updateMessageCount();

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearContactStatus();

      let isValid = true;

      trackedFieldNames.forEach((fieldName) => {
        if (!validateContactField(fieldName)) {
          isValid = false;
        }
      });

      const honeypot = contactForm.elements.website;

      if (honeypot && honeypot.value.trim() !== "") {
        contactForm.reset();
        updateMessageCount();

        showContactStatus(
          "Votre message a bien été pris en compte."
        );

        return;
      }

      if (!isValid) {
        showContactStatus(
          "Certains champs sont incomplets ou incorrects. Vérifiez le formulaire.",
          true
        );

        const firstInvalidField =
          contactForm.querySelector('[aria-invalid="true"]');

        firstInvalidField?.focus();

        return;
      }

      const payload = {
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        category: contactForm.elements.category.value,
        subject: contactForm.elements.subject.value.trim(),
        message: contactForm.elements.message.value.trim(),
        consent: contactForm.elements.consent.checked,
        website: ""
      };

      setContactSubmitting(true);

      try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        let responseData = null;

        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }

        if (!response.ok) {
          const apiMessage =
            responseData?.detail ||
            responseData?.message ||
            "Le service de contact est momentanément indisponible.";

          throw new Error(
            typeof apiMessage === "string"
              ? apiMessage
              : "Le service de contact est momentanément indisponible."
          );
        }

        contactForm.reset();
        updateMessageCount();
        trackedFieldNames.forEach(clearFieldError);

        showContactStatus(
          "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais."
        );
      } catch (error) {
        console.error(
          "Échec de l’envoi du formulaire de contact :",
          error
        );

        showContactStatus(
          error instanceof Error && error.message
            ? error.message
            : "Impossible d’envoyer votre message pour le moment. Réessayez ultérieurement.",
          true
        );
      } finally {
        setContactSubmitting(false);
      }
    });
  };

  /*
   * -------------------------------------------------------
   * Initialisation
   * -------------------------------------------------------
   */

  setCurrentYear();
  updateHeaderState();
  initializeNavigation();
  initializeSmoothAnchors();
  initializeRevealAnimations();
  initializeNumberAnimations();
  createBackToTopButton();
  initializeFaq();
  initializeBetaForm();
  initializeContactForm();

  window.addEventListener("scroll", updateHeaderState, {
    passive: true
  });
})();

