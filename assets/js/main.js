/* =========================================================================
   TRUST AGRO EXPORT — main.js
   Interacciones: header sticky, menú móvil, reveal on scroll (Framer-like),
   contadores animados, parallax sutil del hero y formularios.
   Sin dependencias externas. Respeta prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* -------------------- 1. Header al hacer scroll -------------------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------- 2. Menú móvil -------------------- */
  const menu = document.querySelector("[data-mobile-menu]");
  const toggleBtn = document.querySelector("[data-menu-toggle]");
  if (menu && toggleBtn) {
    const panel = menu.querySelector("[data-menu-panel]");
    const backdrop = menu.querySelector("[data-menu-backdrop]");

    const openMenu = () => {
      menu.classList.add("is-open");
      menu.style.pointerEvents = "auto";
      requestAnimationFrame(() => {
        panel.classList.remove("translate-x-full");
        backdrop.classList.remove("opacity-0");
      });
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      panel.classList.add("translate-x-full");
      backdrop.classList.add("opacity-0");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(() => {
        menu.classList.remove("is-open");
        menu.style.pointerEvents = "none";
      }, 450);
    };

    on(toggleBtn, "click", openMenu);
    menu.querySelectorAll("[data-menu-close]").forEach((el) => on(el, "click", closeMenu));
    on(backdrop, "click", closeMenu);
    on(document, "keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && closeMenu());
  }

  /* -------------------- 3. Reveal on scroll -------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* -------------------- 4. Contadores animados -------------------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-counter")) || 0;
      const prefix = el.getAttribute("data-prefix") || "+";
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReduced) { el.textContent = prefix + target + suffix; return; }
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
      }),
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* -------------------- 5. Parallax sutil del hero -------------------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !prefersReduced) {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* -------------------- 6. Newsletter (demo) -------------------- */
  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    on(form, "submit", (e) => {
      e.preventDefault();
      const msg = form.querySelector("[data-newsletter-msg]");
      const input = form.querySelector("input[type=email]");
      if (input && input.value) {
        if (msg) msg.classList.remove("hidden");
        input.value = "";
        setTimeout(() => msg && msg.classList.add("hidden"), 4000);
      }
    });
  });

  /* -------------------- 7. Año dinámico footer -------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* -------------------- 8. Reproductor de video (modal) -------------------- */
  const videoModal = document.querySelector("[data-video-modal]");
  if (videoModal) {
    const videoEl = videoModal.querySelector("[data-video-el]");
    let lastFocusV = null;

    const openVideo = (e) => {
      if (e) e.preventDefault();
      lastFocusV = document.activeElement;
      videoModal.classList.remove("pointer-events-none", "opacity-0");
      document.body.style.overflow = "hidden";
      if (videoEl) {
        try { videoEl.currentTime = 0; } catch (_) {}
        const p = videoEl.play();
        if (p && p.catch) p.catch(() => {}); // si el navegador bloquea el autoplay, quedan los controles
      }
    };
    const closeVideo = () => {
      videoModal.classList.add("pointer-events-none", "opacity-0");
      document.body.style.overflow = "";
      if (videoEl) videoEl.pause();
      if (lastFocusV && lastFocusV.focus) lastFocusV.focus();
    };

    document.querySelectorAll("[data-video-open]").forEach((b) => on(b, "click", openVideo));
    videoModal.querySelectorAll("[data-video-close]").forEach((b) => on(b, "click", closeVideo));
    on(document, "keydown", (e) => e.key === "Escape" && !videoModal.classList.contains("opacity-0") && closeVideo());
  }
})();
