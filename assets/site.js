const form = document.querySelector("#estimate-form");

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
      "Photo Reminder:",
      "Please reply with photos of the shoreline, dock, lift, and current setup."
    ];

    const subject = encodeURIComponent(`Estimate Request: ${data.get("service") || "Waterfront Service"}`);
    const body = encodeURIComponent(lines.join("\n"));

    window.location.href = `mailto:info@midwestdockandlift.com?subject=${subject}&body=${body}`;
  });
}
