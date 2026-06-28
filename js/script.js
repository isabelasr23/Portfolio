const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const filterButtons = document.querySelectorAll(".filter-button");
const skillItems = document.querySelectorAll(".skill-item");
const revealSections = document.querySelectorAll(".section-reveal");
const contactForm = document.querySelector(".contact-form");
const projectCarousel = document.querySelector(".projects-carousel");
const carouselPrev = document.querySelector(".carousel-prev");
const carouselNext = document.querySelector(".carousel-next");
const prototypeTrack = document.querySelector(".prototype-track");
const prototypePrev = document.querySelector(".prototype-prev");
const prototypeNext = document.querySelector(".prototype-next");
const prototypeDots = document.querySelectorAll(".prototype-dots button");

function moveFilterIndicator() {
  const filterBar = document.querySelector(".filter-bar");
  const activeButton = document.querySelector(".filter-button.is-active");

  if (!filterBar || !activeButton) {
    return;
  }

  filterBar.style.setProperty("--filter-indicator-left", `${activeButton.offsetLeft}px`);
  filterBar.style.setProperty("--filter-indicator-width", `${activeButton.offsetWidth}px`);
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    moveFilterIndicator();

    skillItems.forEach((item) => {
      const shouldShow = filter === "todas" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

moveFilterIndicator();
window.addEventListener("resize", moveFilterIndicator);

if (projectCarousel && carouselPrev && carouselNext) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getCarouselStep() {
    const firstCard = projectCarousel.querySelector(".project-card");
    const grid = projectCarousel.querySelector(".projects-grid");
    const gap = grid ? parseFloat(getComputedStyle(grid).columnGap) || 0 : 0;

    return firstCard ? firstCard.getBoundingClientRect().width + gap : projectCarousel.clientWidth;
  }

  function updateCarouselControls() {
    const maxScroll = projectCarousel.scrollWidth - projectCarousel.clientWidth - 1;

    carouselPrev.disabled = projectCarousel.scrollLeft <= 1;
    carouselNext.disabled = projectCarousel.scrollLeft >= maxScroll;
  }

  function moveCarousel(direction) {
    projectCarousel.scrollBy({
      left: getCarouselStep() * direction,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  carouselPrev.addEventListener("click", () => moveCarousel(-1));
  carouselNext.addEventListener("click", () => moveCarousel(1));

  projectCarousel.addEventListener("scroll", updateCarouselControls, { passive: true });
  window.addEventListener("resize", updateCarouselControls);
  updateCarouselControls();
}

if (prototypeTrack && prototypePrev && prototypeNext && prototypeDots.length) {
  let activePrototype = 0;
  const prototypeDotsWrap = document.querySelector(".prototype-dots");
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  function getPrototypeTotal() {
    return mobileQuery.matches ? prototypeTrack.querySelectorAll(".prototype-phone").length : prototypeTrack.children.length;
  }

  function renderPrototypeDots(total) {
    if (!prototypeDotsWrap) {
      return;
    }

    prototypeDotsWrap.innerHTML = "";

    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Visualização ${index + 1}`);
      dot.addEventListener("click", () => updatePrototype(index));
      prototypeDotsWrap.appendChild(dot);
    }
  }

  function updatePrototype(index) {
    const total = getPrototypeTotal();
    activePrototype = (index + total) % total;
    prototypeTrack.style.setProperty("--prototype-index", activePrototype);

    prototypeDotsWrap?.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activePrototype);
    });
  }

  function setupPrototypeCarousel() {
    const total = getPrototypeTotal();
    activePrototype = Math.min(activePrototype, total - 1);
    renderPrototypeDots(total);
    updatePrototype(activePrototype);
  }

  prototypePrev.addEventListener("click", () => updatePrototype(activePrototype - 1));
  prototypeNext.addEventListener("click", () => updatePrototype(activePrototype + 1));
  mobileQuery.addEventListener("change", setupPrototypeCarousel);
  setupPrototypeCarousel();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealSections.forEach((section) => revealObserver.observe(section));

const validationMessages = {
  nome: "Informe seu nome.",
  email: "Informe um e-mail válido.",
  assunto: "Informe o assunto.",
  mensagem: "Escreva uma mensagem com pelo menos 10 caracteres.",
};

function setFieldError(field, message) {
  const label = field.closest("label");
  const error = label ? label.querySelector(".field-error") : null;

  field.classList.toggle("is-invalid", Boolean(message));
  if (error) {
    error.textContent = message;
  }
}

function validateField(field) {
  let message = "";

  if (!field.validity.valid) {
    message = validationMessages[field.name] || "Preencha este campo.";
  }

  setFieldError(field, message);
  return !message;
}

if (contactForm) {
  const fields = contactForm.querySelectorAll("input:not([type='hidden']), textarea");
  const status = contactForm.querySelector(".form-status");

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    const validationResults = Array.from(fields).map((field) => validateField(field));
    const isValid = validationResults.every(Boolean);

    if (!isValid) {
      event.preventDefault();
      if (status) {
        status.textContent = "Revise os campos destacados.";
      }
      return;
    }

    if (status) {
      status.textContent = "Enviando mensagem...";
    }
  });
}
