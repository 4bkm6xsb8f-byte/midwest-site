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
    staff.href = "https://app.midwestdockandlift.com";
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
      <p>&copy; 2026 Midwest Equipment Dock and Lift Services. All rights reserved.</p>
      <div class="footer-links">
        <a href="https://app.midwestdockandlift.com" target="_blank" rel="noreferrer">Staff Login</a>
        <a href="${prefix}index.html#quote">Request Estimate</a>
        <a href="${prefix}index.html#resources">Seasonal Guides</a>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const lines = [
      `Name: ${data.get("name") || ""}`,
      `Phone: ${data.get("phone") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Lake / Waterbody: ${data.get("lake") || ""}`,
      `City: ${data.get("city") || ""}`,
      `Property Address: ${data.get("address") || ""}`,
      `Service Needed: ${data.get("service") || ""}`,
      `Preferred Timing: ${data.get("timing") || ""}`,
      "",
      "Project Details:",
      `${data.get("details") || ""}`,
      "",
      "Please reply with photos of the shoreline, dock, lift, and current setup."
    ];

    const subject = encodeURIComponent(`Estimate Request: ${data.get("service") || "Waterfront Service"}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:info@midwestdockandlift.com?subject=${subject}&body=${body}`;
  });
}

ensureStaffNavLink();
ensureFooter();
