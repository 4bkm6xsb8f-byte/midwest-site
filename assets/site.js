const DASHBOARD_URL = "https://app.midwestdockandlift.com";
const PAGE_VIEW_ENDPOINT = `${DASHBOARD_URL}/api/analytics/page-view`;
const SALES_INQUIRY_ENDPOINT = `${DASHBOARD_URL}/api/public/sales-inquiries`;
const FAQ_ENDPOINT = `${DASHBOARD_URL}/api/public/faqs`;
const form = document.querySelector("#estimate-form");

function pathPrefix() {
  const path = window.location.pathname;
  return /\/(guides|services|areas)\//.test(path) ? "../" : "";
}

function ensureStaffNavLink() {
  document.querySelectorAll(".site-nav").forEach((nav) => {
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
      </div>
    </div>
  `;

  document.body.appendChild(footer);
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
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
    mode: "cors",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

function setFormStatus(message, tone) {
  const status = document.querySelector("[data-form-status]");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.tone = tone;
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

    setFormStatus("Sending your request to the Midwest office...", "info");

    const data = new FormData(form);
    const payload = {
      full_name: String(data.get("name") || "").trim(),
      primary_phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      lake_name: String(data.get("lake") || "").trim(),
      city: String(data.get("city") || "").trim(),
      service_address: String(data.get("address") || "").trim(),
      service_type: String(data.get("service") || "").trim(),
      preferred_timing: String(data.get("timing") || "").trim(),
      project_details: String(data.get("details") || "").trim(),
      site_host: window.location.hostname,
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer || "",
      session_id: getSessionId(),
    };

    try {
      await postJson(SALES_INQUIRY_ENDPOINT, payload);
      form.reset();
      setFormStatus("Your estimate request was sent. Midwest can now review it in the office dashboard.", "success");
    } catch (_error) {
      setFormStatus("We couldn't send your request right now. Please call 920-319-3625 or email info@midwestdockandlift.com.", "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = defaultLabel;
      }
    }
  });
}

ensureStaffNavLink();
ensureFooter();
updateCurrentYear();
trackPageView();
loadFaqs();
