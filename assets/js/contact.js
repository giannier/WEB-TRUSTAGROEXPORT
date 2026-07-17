/* =========================================================================
   TRUST AGRO EXPORT — contact.js
   Envío del formulario de cotización vía fetch a enviar.php (cPanel/PHP).
   Mejora progresiva: si JS falla, el formulario hace POST normal a enviar.php.
   ========================================================================= */
(function () {
  "use strict";
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const submitBtn = form.querySelector("[data-submit]");
  const label = form.querySelector("[data-submit-label]");
  const okMsg = form.querySelector("[data-form-success]");
  const errMsg = form.querySelector("[data-form-error]");

  const setError = (input, on) => {
    input.classList.toggle("border-red-400", on);
    input.classList.toggle("ring-2", on);
    input.classList.toggle("ring-red-200", on);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    okMsg.classList.add("hidden");
    errMsg.classList.add("hidden");

    // Validación básica
    let valid = true;
    let firstInvalid = null;
    ["nombre", "email", "telefono"].forEach((name) => {
      const input = form.elements[name];
      const empty = !input.value.trim();
      const badEmail = name === "email" && input.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value);
      const bad = empty || badEmail;
      setError(input, bad);
      if (bad) { valid = false; firstInvalid = firstInvalid || input; }
    });
    if (!valid) { firstInvalid && firstInvalid.focus(); return; }

    // Honeypot
    if (form.elements["website"] && form.elements["website"].value) return;

    // Estado de carga
    const original = label.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");
    label.textContent = "Enviando…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({ ok: res.ok }));
      if (res.ok && data.ok) {
        form.reset();
        okMsg.classList.remove("hidden");
        okMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        throw new Error(data.message || "error");
      }
    } catch (err) {
      errMsg.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      label.textContent = original;
    }
  });
})();
