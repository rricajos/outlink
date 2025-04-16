// --- Global Variables ---
let domains = [];
let defaultDomain = null;
let editingIndex = null;

// --- Load Configuration from localStorage ---
function loadConfiguration() {
  const savedDomains = localStorage.getItem("domains");
  const savedDefault = localStorage.getItem("defaultDomain");

  if (savedDomains) {
    domains = JSON.parse(savedDomains);
  } else {
    domains = ["@FCBarcelona.net", "@BLM.net"];
  }

  defaultDomain = savedDefault || domains[0];
}

// --- Save Configuration to localStorage ---
function saveConfiguration() {
  localStorage.setItem("domains", JSON.stringify(domains));
  localStorage.setItem("defaultDomain", defaultDomain);
}

// --- Render Domains in Dropdown and Management Table ---
function updateDomains() {
  const select = document.getElementById("domain");
  const table = document.querySelector("#domain-table tbody");
  select.innerHTML = "";
  table.innerHTML = "";

  const selectedDomain = localStorage.getItem("selectedDomain");

  domains.forEach((domain, i) => {
    // Populate dropdown
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;

    // Pre-select the last used domain or first available
    if (domain === selectedDomain || (!selectedDomain && i === 0)) {
      option.selected = true;
    }

    select.appendChild(option);

    // Populate table
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${domain}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editDomain(${i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDomain(${i})">Delete</button>
      </td>`;
    table.appendChild(row);
  });

  localStorage.setItem("domains", JSON.stringify(domains));
}


// --- Add or Save Domain ---
function addDomain() {
  const input = document.getElementById("new-domain");
  const button = document.getElementById("domain-action-btn");
  const value = input.value.trim();

  if (!value.startsWith("@") || value.length < 5) {
    alert("Please enter a valid domain starting with '@'.");
    return;
  }

  if (editingIndex !== null) {
    // Save changes to edited domain
    domains[editingIndex] = value;
    editingIndex = null;
    button.innerHTML = "Add Domain";
  } else {
    if (domains.includes(value)) {
      alert("This domain already exists.");
      return;
    }
    domains.push(value);
  }

  input.value = "";
  updateDomains();
}

// --- Edit Domain ---
function editDomain(index) {
  const input = document.getElementById("new-domain");
  const button = document.getElementById("domain-action-btn");

  // Fill the input with the selected domain
  input.value = domains[index];
  input.focus();

  // Store the index being edited
  editingIndex = index;

  // Change button appearance and label
  button.innerHTML = "💾 Save Changes";
  button.classList.remove("btn-success");
  button.classList.add("btn-warning");
}



// --- Delete Domain ---
function deleteDomain(index) {
  const domainToRemove = domains[index];
  if (confirm(`Delete domain "${domainToRemove}"?`)) {
    domains.splice(index, 1);
    if (domainToRemove === defaultDomain) {
      defaultDomain = domains[0] || null;
    }
    updateDomains();
  }
}

// --- Set a Domain as Default ---
function setDefaultDomain(index) {
  defaultDomain = domains[index];
  updateDomains();
}

// --- Generate the Login URL ---
function generateURL() {
  const username = document.getElementById("username").value.trim();
  const domain = document.getElementById("domain").value;
  const service = document.getElementById("service").value;
  const output = document.getElementById("result");
  const message = document.getElementById("message");

  if (!username) {
    alert("Please enter a username.");
    return;
  }

  const email = `${username}${domain}`;
  let url = "";

  // Generate URL depending on selected service
  switch (service) {
    case "outlook":
      url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=1b730954-1685-4b74-9bfd-dac224a7b894&response_type=code&redirect_uri=${encodeURIComponent("https://localhost")}&scope=openid&login_hint=${encodeURIComponent(email)}`;
      break;
    case "teams":
      url = `https://teams.microsoft.com/?login_hint=${encodeURIComponent(email)}`;
      break;
    case "onedrive":
      url = `https://onedrive.live.com/?login_hint=${encodeURIComponent(email)}`;
      break;
    case "sharepoint":
      url = `https://${email.split("@")[1]}.sharepoint.com/?login_hint=${encodeURIComponent(email)}`;
      break;
    default:
      alert("Invalid service selected.");
      return;
  }

  output.style.display = "block";
  output.value = url;

  // Copy URL to clipboard
  navigator.clipboard.writeText(url)
    .then(() => {
      message.textContent = "✅ URL copied to clipboard.";
    })
    .catch(err => {
      message.textContent = "⚠️ Failed to copy URL.";
      console.error(err);
    });
}

// --- Save Selected Service to localStorage ---
function saveSelectedService(service) {
  localStorage.setItem("selectedService", service);
}

// --- Load Previously Selected Service ---
function loadSelectedService() {
  const savedService = localStorage.getItem("selectedService");
  const select = document.getElementById("service");
  if (savedService && select) {
    select.value = savedService;
  }
}

// --- Reset Configuration to Defaults ---
function resetConfiguration() {
  if (confirm("Are you sure you want to reset all settings?")) {
    // Reset predefined domains
    const defaultDomains = ["@FCBarcelona.net", "@BLM.net"];
    localStorage.setItem("domains", JSON.stringify(defaultDomains));
    localStorage.removeItem("selectedDomain");
    localStorage.removeItem("username");
    localStorage.removeItem("selectedService");
    localStorage.removeItem("darkMode");

    // Force reload
    location.reload();
  }
}


// --- Toggle Light/Dark Mode ---
function toggleMode() {
  const body = document.body;
  const button = document.getElementById("toggle-mode");
  const isDark = body.classList.toggle("dark-mode");

  localStorage.setItem("darkMode", isDark ? "true" : "false");
  button.innerHTML = isDark ? "🌞 Light Mode" : "🌙 Dark Mode";
}

// --- Apply Saved Theme on Load ---
function applySavedMode() {
  const mode = localStorage.getItem("darkMode");
  const button = document.getElementById("toggle-mode");

  if (mode === "true") {
    document.body.classList.add("dark-mode");
    button.innerHTML = "🌞 Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    button.innerHTML = "🌙 Dark Mode";
  }
}

// --- Main Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Restore saved values
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    document.getElementById("username").value = savedUsername;
  }

  // Load preferences and initialize app
  applySavedMode();
  loadSelectedService();
  loadConfiguration();
  updateDomains();

  // Bind events
  document.getElementById("service").addEventListener("change", e =>
    saveSelectedService(e.target.value)
  );

  document.getElementById("username").addEventListener("input", e =>
    localStorage.setItem("username", e.target.value)
  );

  document.getElementById("domain").addEventListener("change", e =>
    localStorage.setItem("selectedDomain", e.target.value)
  );

  document.getElementById("url-generator").addEventListener("submit", e => {
    e.preventDefault();
    generateURL();
  });
});
