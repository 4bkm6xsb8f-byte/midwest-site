const DASHBOARD_URL = "https://app.midwestdockandlift.com";
const PAGE_VIEW_ENDPOINT = `${DASHBOARD_URL}/api/analytics/page-view`;
const SALES_INQUIRY_ENDPOINT = `${DASHBOARD_URL}/api/public/sales-inquiries`;
const FAQ_ENDPOINT = `${DASHBOARD_URL}/api/public/faqs`;
const FACEBOOK_URL = "https://www.facebook.com/midwestdockandlift";
const FAVICON_VERSION = "20260422";
const form = document.querySelector("#estimate-form");
const MAX_INQUIRY_PHOTOS = 5;
const MAX_INQUIRY_PHOTO_BYTES = 12 * 1024 * 1024;
const ALLOWED_INQUIRY_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function pathPrefix() {
  const path = window.location.pathname;
  return /\/(guides|services|areas)\//.test(path) ? "../" : "";
}

function ensureFavicons() {
  const prefix = pathPrefix();
  const head = document.head;
  if (!head) {
    return;
  }

  const iconSpecs = [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: `${prefix}assets/images/midwest-icon.svg?v=${FAVICON_VERSION}`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `${prefix}assets/images/favicon-32x32.png?v=${FAVICON_VERSION}`,
    },
    {
      rel: "shortcut icon",
      href: `${prefix}favicon.ico?v=${FAVICON_VERSION}`,
    },
  ];

  iconSpecs.forEach((spec) => {
    const selector = spec.type
      ? `link[rel="${spec.rel}"][type="${spec.type}"]`
      : `link[rel="${spec.rel}"]`;
    let link = head.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.rel = spec.rel;
      if (spec.type) {
        link.type = spec.type;
      }
      head.appendChild(link);
    }

    if (spec.sizes) {
      link.sizes = spec.sizes;
    }
    link.href = spec.href;
  });

  let theme = head.querySelector('meta[name="theme-color"]');
  if (!theme) {
    theme = document.createElement("meta");
    theme.name = "theme-color";
    head.appendChild(theme);
  }
  theme.content = "#17324d";
}

function ensureStaffNavLink() {
  document.querySelectorAll(".site-nav").forEach((nav) => {
    if (!nav.querySelector(".social-link-facebook, [data-facebook-link]")) {
      const facebook = document.createElement("a");
      facebook.href = FACEBOOK_URL;
      facebook.className = "social-link social-link-facebook";
      facebook.dataset.facebookLink = "true";
      facebook.target = "_blank";
      facebook.rel = "noreferrer";
      facebook.setAttribute("aria-label", "Midwest Dock and Lift on Facebook");
      facebook.classList.add("social-link-icon-only");
      facebook.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.7-1.6H17V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4v2.2H7.5v3.2h2.8V22h3.2z"></path>
        </svg>
      `;

      const cta = nav.querySelector(".nav-cta");
      nav.insertBefore(facebook, cta || null);
    }

    if (nav.querySelector(".staff-link, [data-staff-link]")) {
      return;
    }

    const staff = document.createElement("a");
    staff.href = DASHBOARD_URL;
    staff.className = "staff-link";
    staff.dataset.staffLink = "true";
    staff.target = "_blank";
    staff.rel = "noreferrer";
    staff.textContent = "Staff Login";

    const cta = nav.querySelector(".nav-cta");
    if (cta) {
      nav.insertBefore(staff, cta);
    } else {
      nav.appendChild(staff);
    }
  });
}

function ensureFooter() {
  if (document.querySelector(".site-footer")) {
    return;
  }

  const prefix = pathPrefix();
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap footer-inner">
      <p>&copy; <span data-current-year></span> Midwest Equipment Dock and Lift Services. All rights reserved.</p>
      <div class="footer-links">
        <a href="${DASHBOARD_URL}" target="_blank" rel="noreferrer">Staff Login</a>
        <a href="${prefix}index.html#quote">Request Estimate</a>
        <a href="${prefix}index.html#resources">Seasonal Guides</a>
        <a href="${prefix}support.html">Support</a>
        <a href="${prefix}privacy.html">Privacy</a>
        <a class="social-link social-link-facebook social-link-icon-only" href="${FACEBOOK_URL}" target="_blank" rel="noreferrer" aria-label="Midwest Dock and Lift on Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.7-1.6H17V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4v2.2H7.5v3.2h2.8V22h3.2z"></path>
          </svg>
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

function initMobileNav() {
  document.querySelectorAll(".site-header").forEach((header, index) => {
    const nav = header.querySelector(".site-nav");
    const headerInner = header.querySelector(".header-inner");
    if (!(nav instanceof HTMLElement) || !(headerInner instanceof HTMLElement)) {
      return;
    }

    if (!nav.id) {
      nav.id = `site-nav-${index + 1}`;
    }

    let toggle = header.querySelector(".mobile-nav-toggle");
    if (!(toggle instanceof HTMLButtonElement)) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "mobile-nav-toggle";
      toggle.setAttribute("aria-label", "Open site menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", nav.id);
      toggle.innerHTML = '<span class="mobile-nav-toggle-bar" aria-hidden="true"></span>';
      headerInner.insertBefore(toggle, nav);
    }

    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open site menu");
    };

    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close site menu");
    };

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 760) {
          closeMenu();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 760) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!header.contains(target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  });
}

function updateCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });
}

function getSessionId() {
  const sessionKey = "midwest-pageview-session";
  const existing = window.localStorage.getItem(sessionKey);
  if (existing) {
    return existing;
  }

  const created = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  window.localStorage.setItem(sessionKey, created);
  return created;
}

async function postJson(url, payload) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || "Request failed");
    }

    return body;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function postFormData(url, payload) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: "POST",
      body: payload,
      mode: "cors",
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || "Request failed");
    }

    return body;
  } finally {
    window.clearTimeout(timeout);
  }
}

function setFormStatus(message, tone) {
  const status = document.querySelector("[data-form-status]");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.tone = tone;
}

function resetFieldErrors() {
  if (!form) {
    return;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function markInvalid(field) {
  field?.setAttribute("aria-invalid", "true");
}

function validateEstimateForm(data) {
  const nameField = document.querySelector("#name");
  const phoneField = document.querySelector("#phone");
  const emailField = document.querySelector("#email");
  const serviceField = document.querySelector("#service");
  const detailsField = document.querySelector("#details");
  const photosField = document.querySelector("#photos");
  const phoneDigits = String(data.get("phone") || "").replace(/\D/g, "");
  const email = String(data.get("email") || "").trim();
  const service = String(data.get("service") || "").trim();
  const details = String(data.get("details") || "").trim();
  const photos = Array.from(data.getAll("photos[]")).filter((file) => file instanceof File && file.name !== "");

  resetFieldErrors();

  if (String(data.get("name") || "").trim().length < 2) {
    markInvalid(nameField);
    nameField?.focus();
    throw new Error("Please enter your name so Midwest knows who to contact.");
  }

  if (phoneDigits.length < 10) {
    markInvalid(phoneField);
    phoneField?.focus();
    throw new Error("Please enter a valid phone number with at least 10 digits.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    markInvalid(emailField);
    emailField?.focus();
    throw new Error("Please enter a valid email address so we can follow up on your request.");
  }

  if (!service) {
    markInvalid(serviceField);
    serviceField?.focus();
    throw new Error("Please choose the service you need so Midwest can route your request correctly.");
  }

  if (details.length < 12) {
    markInvalid(detailsField);
    detailsField?.focus();
    throw new Error("Please add a few more details about the dock, lift, shoreline, or service you need.");
  }

  if (photos.length > MAX_INQUIRY_PHOTOS) {
    markInvalid(photosField);
    photosField?.focus();
    throw new Error(`Please upload no more than ${MAX_INQUIRY_PHOTOS} photos.`);
  }

  for (const photo of photos) {
    if (!ALLOWED_INQUIRY_PHOTO_TYPES.has(photo.type)) {
      markInvalid(photosField);
      photosField?.focus();
      throw new Error("Photos must be JPG, PNG, WEBP, HEIC, or HEIF files.");
    }

    if (photo.size > MAX_INQUIRY_PHOTO_BYTES) {
      markInvalid(photosField);
      photosField?.focus();
      throw new Error("Each uploaded photo must be 12 MB or smaller.");
    }
  }
}

function populateFaqs(entries) {
  const list = document.querySelector("[data-faq-list]");
  if (!list || !Array.isArray(entries) || entries.length === 0) {
    return;
  }

  list.innerHTML = "";
  entries.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = entry.question || "";

    const body = document.createElement("p");
    body.textContent = entry.answer || "";

    article.append(heading, body);
    list.appendChild(article);
  });
}

async function loadFaqs() {
  try {
    const response = await fetch(FAQ_ENDPOINT, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      mode: "cors",
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return;
    }

    populateFaqs(body.data || []);
  } catch (_error) {
    // Keep the baked-in fallback FAQ cards when the dashboard is unavailable.
  }
}

function trackPageView() {
  const payload = {
    site_host: window.location.hostname,
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || "",
    session_id: getSessionId(),
  };

  postJson(PAGE_VIEW_ENDPOINT, payload).catch(() => {});
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submit = form.querySelector('button[type="submit"]');
    const defaultLabel = submit?.textContent || "Send Estimate Request";

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending...";
    }

    const data = new FormData(form);
    try {
      validateEstimateForm(data);
    } catch (error) {
      if (submit) {
        submit.disabled = false;
        submit.textContent = defaultLabel;
      }
      setFormStatus(error instanceof Error ? error.message : "Please review the form and try again.", "error");
      return;
    }

    setFormStatus("Sending your request to the Midwest office...", "info");

    const payload = new FormData();
    payload.set("full_name", String(data.get("name") || "").trim());
    payload.set("primary_phone", String(data.get("phone") || "").trim());
    payload.set("email", String(data.get("email") || "").trim());
    payload.set("lake_name", String(data.get("lake") || "").trim());
    payload.set("city", String(data.get("city") || "").trim());
    payload.set("service_address", String(data.get("address") || "").trim());
    payload.set("service_type", String(data.get("service") || "").trim());
    payload.set("preferred_timing", String(data.get("timing") || "").trim());
    payload.set("project_details", String(data.get("details") || "").trim());
    payload.set("site_host", window.location.hostname);
    payload.set("page_url", window.location.href);
    payload.set("page_path", window.location.pathname);
    payload.set("referrer", document.referrer || "");
    payload.set("session_id", getSessionId());

    Array.from(data.getAll("photos[]"))
      .filter((file) => file instanceof File && file.name !== "")
      .slice(0, MAX_INQUIRY_PHOTOS)
      .forEach((file) => payload.append("photos[]", file));

    try {
      await postFormData(SALES_INQUIRY_ENDPOINT, payload);
      form.reset();
      resetFieldErrors();
      setFormStatus("Your estimate request was sent successfully. Midwest can now review it, along with any uploaded photos, in the office dashboard.", "success");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "We couldn't send your request right now. Please call 920-319-3625 or email info@midwestdockandlift.com.";
      setFormStatus(message.toLowerCase().includes("abort") ? "The request timed out. Please try again or call 920-319-3625." : message, "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = defaultLabel;
      }
    }
  });
}

ensureFavicons();
ensureStaffNavLink();
ensureFooter();
initMobileNav();
updateCurrentYear();
trackPageView();
loadFaqs();
