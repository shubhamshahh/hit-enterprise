// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Ticket date stamp
const ticketDate = document.getElementById("ticketDate");
if (ticketDate) {
  ticketDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Header scroll state (transparent-over-hero -> solid on scroll)
const siteHeader = document.getElementById("siteHeader");
function updateHeaderState() {
  if (window.scrollY > 40) siteHeader.classList.add("is-scrolled");
  else siteHeader.classList.remove("is-scrolled");
}
updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

// Infinite scroll marquee handled natively in HTML/CSS for smoother rendering

// Scroll reveal (also triggers staggered children via the .stagger class)
const revealEls = document.querySelectorAll(".reveal");
const countEls = document.querySelectorAll("[data-count]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = parseInt(el.getAttribute("data-count"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

if ("IntersectionObserver" in window && countEls.length) {
  const countIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  countEls.forEach((el) => countIo.observe(el));
} else {
  countEls.forEach(animateCount);
}

// Prefill chemical field from product cards (bound dynamically after fetching catalog)

// Rotating hero certificate card — cycles through a few stock chemicals
const heroCerts = [
  { name: "Hydrochloric Acid, 32%", status: "QC Passed", cas: "7647-01-0", purity: "32% ± 0.5%", packing: "35 kg Carboy", batch: "HE-2026-0714" },
  { name: "Caustic Lye, Flakes", status: "QC Passed", cas: "1310-73-2", purity: "98% min", packing: "50 kg Bag", batch: "HE-2026-0522" },
  { name: "Citric Acid, Anhydrous", status: "QC Passed", cas: "77-92-9", purity: "99.5%", packing: "25 kg Bag", batch: "HE-2026-0389" },
  { name: "SMBS (Sodium Metabisulfite)", status: "QC Passed", cas: "7681-57-4", purity: "97%", packing: "50 kg Bag", batch: "HE-2026-0661" },
  { name: "IPA (Isopropyl Alcohol)", status: "QC Passed", cas: "67-63-0", purity: "99.9%", packing: "Drum", batch: "HE-2026-0247" },
];

(function initHeroCertRotation() {
  const card = document.getElementById("heroCert");
  if (!card) return;

  const fields = {
    name: document.getElementById("certName"),
    status: document.getElementById("certStatus"),
    cas: document.getElementById("certCas"),
    purity: document.getElementById("certPurity"),
    packing: document.getElementById("certPacking"),
    batch: document.getElementById("certBatch"),
  };
  const dotsWrap = document.getElementById("certDots");

  heroCerts.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("is-active");
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll("span");

  let index = 0;

  function applyCert(data) {
    fields.name.textContent = data.name;
    fields.status.textContent = data.status;
    fields.cas.textContent = data.cas;
    fields.purity.textContent = data.purity;
    fields.packing.textContent = data.packing;
    fields.batch.textContent = data.batch;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    if (i === index && card.dataset.inited) return;
    index = i;
    card.dataset.inited = "1";
    card.classList.add("is-fading");
    setTimeout(() => {
      applyCert(heroCerts[index]);
      card.classList.remove("is-fading");
    }, 280);
  }

  function showNext() {
    goTo((index + 1) % heroCerts.length);
  }

  setInterval(showNext, 3400);

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });
})();

// Request form submission
const form = document.getElementById("requestForm");
const status = document.getElementById("formStatus");

if (form) {
  const submitFormBtn = document.getElementById("submitFormBtn");
  const submitWhatsappBtn = document.getElementById("submitWhatsappBtn");
  const submitEmailBtn = document.getElementById("submitEmailBtn");
  const actionButtons = [submitFormBtn, submitWhatsappBtn, submitEmailBtn];

  async function handleSubmission(source) {
    status.className = "form-status";
    status.textContent = "";

    // Validate required fields manually since we bypass default submit on some buttons
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const chemical = form.chemical.value.trim();
    const quantity = form.quantity.value.trim();
    const company = form.company.value.trim();
    const email = form.email.value.trim();
    const unit = form.unit.value;
    const industry = form.industry.value;
    const message = form.message.value.trim();

    if (!name || !phone || !chemical || !quantity) {
      status.textContent = "Please fill in all required fields (*).";
      status.classList.add("show", "err");
      return;
    }

    const payload = {
      name,
      company,
      phone,
      email,
      chemical,
      quantity,
      unit,
      industry,
      message,
      source
    };

    // Disable all buttons
    actionButtons.forEach(btn => {
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.7";
      }
    });

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      status.textContent = `Request received (Ref #${data.id}). Our team will contact you shortly.`;
      status.classList.add("show", "ok");

      // Construct prefilled text for direct channels
      const msgText = `Hello Hit Enterprise,\n\nI would like to request a quote for:\n- Chemical: ${chemical}\n- Quantity: ${quantity} ${unit}\n- Name: ${name}\n- Company: ${company || "N/A"}\n- Phone: ${phone}\n- Email: ${email || "N/A"}\n- Industry: ${industry || "N/A"}\n- Details: ${message || "N/A"}`;

      if (source === "whatsapp") {
        window.open(`https://wa.me/919825707215?text=${encodeURIComponent(msgText)}`, "_blank");
      } else if (source === "email") {
        window.open(`mailto:hhshahin04@gmail.com?subject=Chemical Request - ${chemical}&body=${encodeURIComponent(msgText)}`, "_blank");
      }

      form.reset();
    } catch (err) {
      status.textContent = err.message || "Could not submit request. Please try again.";
      status.classList.add("show", "err");
    } finally {
      // Re-enable all buttons
      actionButtons.forEach(btn => {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = "1";
        }
      });
    }
  }

  // Bind actions
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmission("form");
  });

  if (submitWhatsappBtn) {
    submitWhatsappBtn.addEventListener("click", () => handleSubmission("whatsapp"));
  }

  if (submitEmailBtn) {
    submitEmailBtn.addEventListener("click", () => handleSubmission("email"));
  }
}

// Load and render products dynamically from server database
async function loadPublicProducts() {
  console.log("[Hit Enterprise] Initializing dynamic catalog fetch...");
  const grid = document.getElementById("productGrid");
  if (!grid) {
    console.warn("[Hit Enterprise] #productGrid element not found!");
    return;
  }

  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to fetch products from backend API");
    const products = await res.json();
    console.log("[Hit Enterprise] Catalog fetched successfully. Items count:", products.length);

    if (!products || !products.length) {
      console.log("[Hit Enterprise] Database catalog is empty. Displaying fallback HTML products.");
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card reveal is-visible">
        <div class="product-card-top">
          <h3>${escapeHtml(p.name)}</h3>
          ${p.cas ? `<span class="product-cas">${escapeHtml(p.cas)}</span>` : ""}
        </div>
        <p>${escapeHtml(p.applications || "Industrial chemical product.")}</p>
        <span class="product-spec">${escapeHtml(p.purity || p.grade || "Technical Grade")}${p.packaging ? ` &middot; ${escapeHtml(p.packaging)}` : ""}</span>
        <a class="product-card-cta" href="#request" data-chemical="${escapeHtml(p.name)}">Request this <span>&rarr;</span></a>
      </div>
    `).join("");

    // Re-bind click prefill triggers for newly generated cards
    bindPrefillTriggers();
    console.log("[Hit Enterprise] Dynamic catalog rendered successfully!");

  } catch (err) {
    console.error("[Hit Enterprise] Error loading products catalog from server:", err);
    // Keep fallback static HTML products
  }
}

function bindPrefillTriggers() {
  document.querySelectorAll("[data-chemical]").forEach((link) => {
    link.addEventListener("click", () => {
      const field = document.getElementById("chemical");
      if (field) field.value = link.getAttribute("data-chemical");
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// Initialise catalog fetching
loadPublicProducts();
