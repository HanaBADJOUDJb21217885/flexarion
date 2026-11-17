(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu");

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle__label").textContent = open ? "Fermer" : "Menu";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (open) nav.querySelector("a")?.focus();
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------- Barre de progression ---------- */
  const progress = document.querySelector(".progress");
  let ticking = false;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.setProperty("--progress", ratio.toFixed(4));

    if (!reducedMotion.matches) {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Apparitions au défilement ---------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach((el) => revealObserver.observe(el));

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
    }, { rootMargin: "-35% 0px -45% 0px" });
    document.querySelectorAll(".timeline__item").forEach((el) => timelineObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Graphique d'impulsions du pulsar ---------- */
  const random = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const initPulsar = (canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = random(1919);
    const LINES = 42;
    const SAMPLES = 120;
    const profiles = Array.from({ length: LINES + 1 }, () => ({
      amp: 0.45 + rand() * 0.55,
      shift: (rand() - 0.5) * 0.05,
      echo: rand() * 0.45,
      echoPos: (rand() - 0.5) * 0.12,
      noise: Array.from({ length: SAMPLES }, () => rand())
    }));

    const pointer = { x: -1, y: -1, strength: 0 };
    let width = 0;
    let height = 0;
    let visible = true;
    let frame = 0;
    const start = performance.now();
    const BEAT = 1600;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    };

    const draw = (now) => {
      const t = Math.max(0, now - start) / BEAT;
      const phase = t % 1;
      const pulse = Math.exp(-phase * 6);
      const scroll = Math.floor(t);

      ctx.clearRect(0, 0, width, height);

      const compact = width < 700;
      const left = width * (compact ? 0.04 : 0.3);
      const right = width * (compact ? 0.96 : 0.98);
      const top = height * 0.12;
      const bottom = height * 0.92;
      const gap = (bottom - top) / LINES;
      const peakHeight = gap * (compact ? 5 : 7);

      for (let i = 0; i < LINES; i++) {
        const p = profiles[(i + scroll) % profiles.length];
        const base = top + i * gap;
        const highlight = i === LINES - 1;

        ctx.beginPath();
        ctx.moveTo(left, base + 2);
        for (let s = 0; s < SAMPLES; s++) {
          const u = s / (SAMPLES - 1);
          const x = left + u * (right - left);
          const d = (u - 0.5 - p.shift) / 0.045;
          const e = (u - 0.5 - p.echoPos) / 0.02;
          let v = p.amp * Math.exp(-d * d) + p.echo * Math.exp(-e * e) + p.noise[s] * 0.035;
          if (highlight) v *= 0.6 + pulse * 0.6;
          if (pointer.strength > 0) {
            const dx = (x - pointer.x) / 120;
            const dy = (base - pointer.y) / 90;
            v += pointer.strength * 0.35 * Math.exp(-(dx * dx + dy * dy)) * (0.5 + p.noise[s]);
          }
          ctx.lineTo(x, base - v * peakHeight);
        }
        ctx.lineTo(right, base + 2);
        ctx.closePath();
        ctx.fillStyle = "#0f1115";
        ctx.fill();
        ctx.lineWidth = highlight ? 2 : 1.1;
        ctx.strokeStyle = highlight ? "#ff6a3d" : `rgba(236, 230, 218, ${0.35 + 0.5 * (i / LINES)})`;
        ctx.stroke();
      }
    };

    const loop = (now) => {
      if (pointer.strength > 0 && pointer.x < 0) pointer.strength = Math.max(0, pointer.strength - 0.04);
      draw(now);
      frame = visible ? window.requestAnimationFrame(loop) : 0;
    };

    const play = () => {
      if (!frame && visible && !reducedMotion.matches && !document.hidden) {
        frame = window.requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    new ResizeObserver(resize).observe(canvas);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? play() : stop();
    }).observe(canvas);

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
    reducedMotion.addEventListener("change", () => (reducedMotion.matches ? (stop(), draw(start)) : play()));

    const host = canvas.parentElement;
    host.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.strength = 1;
    });
    host.addEventListener("pointerleave", () => { pointer.x = -1; });

    play();
  };

  document.querySelectorAll("canvas[data-pulsar]").forEach(initPulsar);

  /* ---------- Galerie ---------- */
  const lightbox = document.querySelector(".lightbox");

  if (lightbox && typeof lightbox.showModal === "function") {
    const img = lightbox.querySelector(".lightbox__img");
    const caption = lightbox.querySelector(".lightbox__caption");
    let opener = null;

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => {
        const thumb = button.querySelector("img");
        opener = button;
        img.src = button.dataset.lightbox;
        img.alt = thumb ? thumb.alt : "";
        caption.textContent = button.dataset.caption || "";
        lightbox.showModal();
      });
    });

    lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", () => opener?.focus());
  }

  /* ---------- Formulaire de contact ---------- */
  const form = document.querySelector("[data-contact-form]");

  if (form) {
    const status = form.querySelector(".form__status");
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Indiquez votre nom (2 caractères minimum)."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Indiquez une adresse e-mail valide, par exemple nom@domaine.fr."),
      subject: (v) => (v ? "" : "Choisissez l'objet de votre message."),
      message: (v) => (v.trim().length >= 20 ? "" : "Votre message doit contenir au moins 20 caractères.")
    };

    const validateField = (field) => {
      const rule = rules[field.name];
      if (!rule) return true;
      const message = rule(field.value);
      const error = document.getElementById(`${field.id}-error`);
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) error.textContent = message;
      return !message;
    };

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value) validateField(field);
      });
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("[name]")].filter((f) => rules[f.name]);
      const invalid = fields.filter((f) => !validateField(f));

      if (invalid.length) {
        status.textContent = `Le formulaire contient ${invalid.length} erreur${invalid.length > 1 ? "s" : ""}. Corrigez les champs signalés.`;
        invalid[0].focus();
        return;
      }

      const recipient = form.dataset.recipient;
      if (!recipient) {
        status.textContent = "Formulaire de démonstration : votre message est valide, mais il n'a pas été envoyé car aucun service d'envoi n'est encore relié à ce site.";
        return;
      }

      const data = new FormData(form);
      const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`[${data.get("subject")}] Message depuis le site Flexarion`)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Votre logiciel de messagerie s'ouvre avec le message prérempli. Il ne reste plus qu'à l'envoyer.";
    });
  }
})();
