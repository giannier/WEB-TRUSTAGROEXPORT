/* =========================================================================
   DOCTOR TRUST — Widget de chat con IA
   Asesor agronómico. Reemplaza el botón de WhatsApp.
   Plan del proyecto: ver DOCTOR-TRUST.md

   ⚙️  PARA CONECTARLO A n8n: pega la URL del webhook en CONFIG.webhookUrl.
       Mientras esté vacío, el widget funciona en MODO DEMO (respuestas simuladas).
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  CONFIGURACIÓN                                                      */
  /* ------------------------------------------------------------------ */
  const CONFIG = {
    // ⬇️ URL DEL WEBHOOK DE n8n (dejar vacío = modo demo con respuestas simuladas)
    webhookUrl: "https://n8n.corporacionyanayacu.com/webhook/34105e6c-f769-4c35-83aa-d98110b92352",

    whatsapp: "51987664321",     // escalado a asesor humano
    maxImages: 3,                // máx. fotos por sesión (control de costo)
    maxImageWidth: 1024,         // se redimensiona antes de enviar
    imageQuality: 0.8,           // calidad JPEG
    historyTurns: 8,             // turnos enviados como contexto
    maxChars: 1000,              // largo máximo del mensaje
  };

  const DEMO = !CONFIG.webhookUrl;

  const SUGERENCIAS = [
    "Mi palto tiene hojas amarillas",
    "¿Qué le aplico a la uva en floración?",
    "Se me rajan los frutos",
    "Necesito jabas para exportación",
  ];

  /* ------------------------------------------------------------------ */
  /*  ESTADO                                                             */
  /* ------------------------------------------------------------------ */
  let isOpen = false;
  let isSending = false;
  let imagesSent = 0;
  let pendingImage = null;
  let lastFocused = null;
  const history = [];

  const sessionId = (function () {
    try {
      let id = localStorage.getItem("dt_session");
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
        localStorage.setItem("dt_session", id);
      }
      return id;
    } catch (e) {
      return String(Date.now());
    }
  })();

  /* ------------------------------------------------------------------ */
  /*  ICONOS                                                             */
  /* ------------------------------------------------------------------ */
  const ICON = {
    sprout: '<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M12 21V10M12 10c0-3-2-5-5-5 0 3 2 5 5 5Zm0-1c0-2 2-4 5-4 0 3-2 4-5 4Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-5 w-5"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4"><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20z"/></svg>',
  };

  /* ------------------------------------------------------------------ */
  /*  UTILIDADES                                                         */
  /* ------------------------------------------------------------------ */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // Markdown mínimo: **negrita** y saltos de línea
  function fmt(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  /** Redimensiona y comprime la imagen en el navegador antes de enviarla */
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        const img = new Image();
        img.onerror = reject;
        img.onload = function () {
          const scale = Math.min(1, CONFIG.maxImageWidth / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", CONFIG.imageQuality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  CONSTRUCCIÓN DEL DOM                                               */
  /* ------------------------------------------------------------------ */
  const launcher = el(
    "button",
    "group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-brand-500 p-3 text-white shadow-[0_12px_32px_-8px_rgba(116,179,60,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 sm:pr-5",
    '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20">' + ICON.sprout + "</span>" +
      '<span class="hidden text-sm font-semibold sm:block">Doctor Trust</span>'
  );
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir chat con Doctor Trust");

  const panel = el(
    "div",
    "pointer-events-none fixed inset-0 z-50 opacity-0 transition-all duration-300 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[640px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
  );
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Chat con Doctor Trust");

  panel.innerHTML =
    '<div class="flex h-full flex-col overflow-hidden bg-[#f6f7f3] shadow-2xl sm:rounded-3xl">' +
      // Header
      '<header class="flex items-center gap-3 bg-forest-950 px-4 py-3">' +
        '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white">' + ICON.sprout + "</span>" +
        '<div class="min-w-0 flex-1">' +
          '<p class="font-display text-sm font-bold leading-tight text-white">Doctor Trust</p>' +
          '<p class="flex items-center gap-1.5 text-[11px] text-white/60"><span class="inline-block h-1.5 w-1.5 rounded-full bg-brand-400"></span>Asesor agronómico · en línea</p>' +
        "</div>" +
        '<a href="https://wa.me/' + CONFIG.whatsapp + '" target="_blank" rel="noopener" class="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Hablar con un asesor por WhatsApp" title="Hablar con un asesor">' + ICON.wa + "</a>" +
        '<button type="button" data-dt-close class="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar chat">' + ICON.close + "</button>" +
      "</header>" +
      // Mensajes
      '<div data-dt-messages class="flex-1 space-y-3 overflow-y-auto p-4"></div>' +
      // Preview de imagen
      '<div data-dt-preview class="hidden border-t border-forest-100 bg-white px-3 pt-3"></div>' +
      // Composer
      '<footer class="border-t border-forest-100 bg-white p-3">' +
        '<div class="flex items-end gap-2">' +
          '<button type="button" data-dt-image class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-forest-500 transition-colors hover:bg-forest-50 hover:text-brand-600" aria-label="Adjuntar foto de tu planta" title="Adjuntar foto">' + ICON.camera + "</button>" +
          '<input type="file" data-dt-file accept="image/*" class="hidden" />' +
          '<textarea data-dt-input rows="1" maxlength="' + CONFIG.maxChars + '" placeholder="Escribe tu consulta..." class="max-h-28 flex-1 resize-none rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900 placeholder:text-forest-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"></textarea>' +
          '<button type="button" data-dt-send class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40" aria-label="Enviar mensaje">' + ICON.send + "</button>" +
        "</div>" +
        '<p class="mt-2 text-center text-[10px] leading-tight text-forest-400">Recomendación orientativa. Para un diagnóstico definitivo, consulta a nuestro equipo técnico.</p>' +
      "</footer>" +
    "</div>";

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const $messages = panel.querySelector("[data-dt-messages]");
  const $input = panel.querySelector("[data-dt-input]");
  const $send = panel.querySelector("[data-dt-send]");
  const $file = panel.querySelector("[data-dt-file]");
  const $preview = panel.querySelector("[data-dt-preview]");

  /* ------------------------------------------------------------------ */
  /*  RENDER DE MENSAJES                                                 */
  /* ------------------------------------------------------------------ */
  function scrollDown() {
    $messages.scrollTop = $messages.scrollHeight;
  }

  function addMessage(role, text, imageUrl) {
    const isUser = role === "user";
    const row = el("div", "flex items-end gap-2 " + (isUser ? "justify-end" : ""));

    if (!isUser) {
      row.appendChild(
        el("span", "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500 text-white", ICON.sprout)
      );
    }

    const bubble = el(
      "div",
      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm " +
        (isUser ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-white text-forest-800")
    );

    if (imageUrl) {
      const im = el("img", "mb-2 max-h-44 w-full rounded-lg object-cover");
      im.src = imageUrl;
      im.alt = "Foto enviada";
      bubble.appendChild(im);
    }
    if (text) bubble.appendChild(el("div", "", fmt(text)));

    row.appendChild(bubble);
    $messages.appendChild(row);
    scrollDown();
    return bubble;
  }

  function addProducts(products) {
    if (!products || !products.length) return;
    const wrap = el("div", "ml-9 flex flex-wrap gap-2");
    products.forEach(function (p) {
      const a = el(
        "a",
        "inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white",
        ICON.sprout.replace("h-5 w-5", "h-3.5 w-3.5") + escapeHtml(p.nombre)
      );
      a.href = p.url || "lineas.html";
      wrap.appendChild(a);
    });
    $messages.appendChild(wrap);
    scrollDown();
  }

  function addHumanCta() {
    const wrap = el("div", "ml-9");
    const a = el(
      "a",
      "inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105",
      ICON.wa + "Hablar con un asesor"
    );
    a.href = "https://wa.me/" + CONFIG.whatsapp;
    a.target = "_blank";
    a.rel = "noopener";
    wrap.appendChild(a);
    $messages.appendChild(wrap);
    scrollDown();
  }

  let $typing = null;
  function typing(on) {
    if (on) {
      if ($typing) return;
      $typing = el("div", "flex items-end gap-2");
      $typing.innerHTML =
        '<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500 text-white">' + ICON.sprout + "</span>" +
        '<div class="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">' +
          '<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-300"></span>' +
          '<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-300" style="animation-delay:.15s"></span>' +
          '<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-300" style="animation-delay:.3s"></span>' +
        "</div>";
      $messages.appendChild($typing);
      scrollDown();
    } else if ($typing) {
      $typing.remove();
      $typing = null;
    }
  }

  function addChips() {
    const wrap = el("div", "ml-9 flex flex-wrap gap-2");
    SUGERENCIAS.forEach(function (s) {
      const b = el(
        "button",
        "rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs text-forest-700 transition-colors hover:border-brand-500 hover:text-brand-600",
        escapeHtml(s)
      );
      b.type = "button";
      b.addEventListener("click", function () {
        wrap.remove();
        submit(s);
      });
      wrap.appendChild(b);
    });
    $messages.appendChild(wrap);
    scrollDown();
  }

  /* ------------------------------------------------------------------ */
  /*  IMAGEN                                                             */
  /* ------------------------------------------------------------------ */
  function showPreview(dataUrl) {
    $preview.classList.remove("hidden");
    $preview.innerHTML =
      '<div class="relative inline-block"><img src="' + dataUrl + '" alt="Vista previa" class="h-16 w-16 rounded-lg object-cover" />' +
      '<button type="button" data-dt-rmimg class="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-forest-900 text-white" aria-label="Quitar foto">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-3 w-3"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button></div>';
    $preview.querySelector("[data-dt-rmimg]").addEventListener("click", clearPreview);
  }

  function clearPreview() {
    pendingImage = null;
    $preview.classList.add("hidden");
    $preview.innerHTML = "";
    $file.value = "";
  }

  $file.addEventListener("change", function () {
    const f = $file.files && $file.files[0];
    if (!f) return;
    if (imagesSent >= CONFIG.maxImages) {
      addMessage("assistant", "Ya recibí " + CONFIG.maxImages + " fotos en esta conversación. Si necesitas enviar más, te paso con un asesor.");
      addHumanCta();
      $file.value = "";
      return;
    }
    compressImage(f)
      .then(function (dataUrl) {
        pendingImage = dataUrl;
        showPreview(dataUrl);
        $input.focus();
      })
      .catch(function () {
        addMessage("assistant", "No pude leer esa imagen. Intenta con otra foto (JPG o PNG).");
      });
  });

  panel.querySelector("[data-dt-image]").addEventListener("click", function () {
    $file.click();
  });

  /* ------------------------------------------------------------------ */
  /*  ENVÍO                                                              */
  /* ------------------------------------------------------------------ */
  async function submit(forcedText) {
    const text = (forcedText != null ? forcedText : $input.value).trim();
    if ((!text && !pendingImage) || isSending) return;

    const img = pendingImage;
    addMessage("user", text, img);
    history.push({ role: "user", content: text || "[foto]" });
    if (img) imagesSent++;

    $input.value = "";
    $input.style.height = "auto";
    clearPreview();

    isSending = true;
    $send.disabled = true;
    typing(true);

    try {
      const data = DEMO ? await demoReply(text, !!img) : await callBackend(text, img);
      typing(false);
      addMessage("assistant", data.reply);
      history.push({ role: "assistant", content: data.reply });
      addProducts(data.products);
      if (data.needsHuman) addHumanCta();
    } catch (err) {
      typing(false);
      addMessage("assistant", "Ups, no pude conectarme en este momento. Puedes intentar de nuevo o hablar directo con un asesor.");
      addHumanCta();
    } finally {
      isSending = false;
      $send.disabled = false;
      if (history.length > CONFIG.historyTurns * 2) history.splice(0, history.length - CONFIG.historyTurns * 2);
    }
  }

  /** Llamada real al webhook de n8n */
  async function callBackend(text, image) {
    const res = await fetch(CONFIG.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId,
        message: text,
        image: image || null,
        history: history.slice(-CONFIG.historyTurns * 2),
        meta: { page: location.pathname, ts: new Date().toISOString() },
      }),
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    if (!data || !data.reply) throw new Error("respuesta vacía");
    return data;
  }

  /* ------------------------------------------------------------------ */
  /*  MODO DEMO (respuestas simuladas hasta conectar n8n)                */
  /* ------------------------------------------------------------------ */
  function demoReply(text, hasImage) {
    const t = (text || "").toLowerCase();
    let reply, products = [], needsHuman = false;

    if (hasImage) {
      reply =
        "Gracias por la foto 🌱 Por lo que observo, el amarillamiento **en las hojas nuevas con las nervaduras aún verdes** apunta a una **deficiencia de hierro (clorosis férrica)**, común cuando el pH del suelo está alto.\n\n" +
        "Para confirmarlo necesito saber:\n• ¿Qué cultivo es y qué edad tiene?\n• ¿Hace cuánto notas el síntoma?\n• ¿Cuándo fue tu última fertilización?";
      products = [{ nombre: "Ynsufert®", url: "lineas.html#ynsufert" }];
    } else if (/palt|aguacate|hoja.*amarill|amarill/.test(t)) {
      reply =
        "Entiendo. El amarillamiento en palto puede tener varias causas y conviene diferenciarlas bien:\n\n" +
        "• **Hojas nuevas** amarillas con venitas verdes → falta de **hierro**\n" +
        "• **Hojas viejas** amarillas parejas → falta de **nitrógeno**\n\n" +
        "¿En qué hojas lo ves, en las nuevas o en las viejas? Si puedes, **sube una foto** de cerca y te lo confirmo.";
    } else if (/uva|vid|floraci/.test(t)) {
      reply =
        "En **vid durante floración** el objetivo es asegurar el cuajado y la firmeza de la baya. Lo clave en esa etapa es el **calcio y el boro**.\n\n" +
        "¿Qué variedad manejas y en qué zona estás? Con eso te armo el programa nutricional exacto.";
      products = [{ nombre: "Ynsufert®", url: "lineas.html#ynsufert" }];
    } else if (/raj|revent|parte.*frut/.test(t)) {
      reply =
        "El **rajado del fruto** casi siempre se relaciona con una **deficiencia de calcio** sumada a riegos irregulares (mucha agua después de un periodo seco).\n\n" +
        "Se trabaja en dos frentes: **calcio foliar** desde cuajado y **regularizar el riego**.\n\n" +
        "¿Qué cultivo es y en qué etapa está?";
      products = [{ nombre: "Ynsufert®", url: "lineas.html#ynsufert" }];
    } else if (/jaba|parihuela|empaqu|caja|export/.test(t)) {
      reply =
        "Para **empaque de exportación** manejamos la línea **Ynsupack®**: jabas cosecheras, parihuelas, cajas y clamshells.\n\n" +
        "¿Qué producto vas a empacar y qué volumen manejas por campaña? Así te recomiendo el formato correcto.";
      products = [{ nombre: "Ynsupack®", url: "lineas.html#ynsupack" }];
    } else if (/precio|costo|cuanto cuesta|cotiz/.test(t)) {
      reply = "Los precios y disponibilidad los maneja nuestro equipo comercial. Te paso con un asesor para que te dé una cotización al toque.";
      needsHuman = true;
    } else {
      reply =
        "Con gusto te ayudo 🌱 Para darte una recomendación precisa, cuéntame:\n\n" +
        "• ¿Qué **cultivo** manejas?\n• ¿Qué **síntoma** observas y hace cuánto?\n• ¿En qué **etapa** está (floración, cuajado, llenado)?\n\n" +
        "Si puedes **subir una foto** de la planta, mejor todavía.";
    }

    // Simula el tiempo de respuesta del agente
    const wait = 700 + Math.random() * 700;
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ reply: reply, products: products, needsHuman: needsHuman });
      }, wait);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  ABRIR / CERRAR                                                     */
  /* ------------------------------------------------------------------ */
  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;
    panel.classList.remove("pointer-events-none", "opacity-0");
    launcher.classList.add("scale-0", "opacity-0");
    if (window.matchMedia("(max-width: 639px)").matches) document.body.style.overflow = "hidden";

    if (!$messages.children.length) {
      addMessage(
        "assistant",
        "¡Hola! Soy **Doctor Trust**, tu asesor agronómico 🌱\n\nCuéntame qué le pasa a tu cultivo o **sube una foto** de la planta y te ayudo a encontrar una solución."
      );
      addChips();
    }
    setTimeout(function () { $input.focus(); }, 320);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.add("pointer-events-none", "opacity-0");
    launcher.classList.remove("scale-0", "opacity-0");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  launcher.addEventListener("click", open);
  panel.querySelector("[data-dt-close]").addEventListener("click", close);
  $send.addEventListener("click", function () { submit(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) close();
  });

  // Enter envía, Shift+Enter salta de línea. Autoajuste de altura.
  $input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });
  $input.addEventListener("input", function () {
    $input.style.height = "auto";
    $input.style.height = Math.min($input.scrollHeight, 112) + "px";
  });

  if (DEMO) console.info("[Doctor Trust] MODO DEMO — pega la URL del webhook en CONFIG.webhookUrl (assets/js/doctor-trust.js) para conectarlo a n8n.");
})();
