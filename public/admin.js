// Executive Admin Dashboard Logic — Hit Enterprise

let activeTab = "overview";
let activeFilter = "all";
let activeSourceFilter = "all";
let inquiriesData = [];
let productsData = [];

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const adminScreen = document.getElementById("adminScreen");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const searchInput = document.getElementById("searchInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Sidebar Toggle Elements
const adminSidebar = document.getElementById("adminSidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarCollapseBtn = document.getElementById("sidebarCollapseBtn");

// Theme Switcher Logic
function initTheme() {
  const currentTheme = localStorage.getItem("hitAdminTheme") || "light";
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  const iconEl = document.getElementById("themeToggleIcon");
  const textEl = document.getElementById("themeToggleText");

  if (theme === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
    if (iconEl) iconEl.textContent = "🌙";
    if (textEl) textEl.textContent = "Dark Mode";
  } else {
    document.body.classList.remove("theme-light");
    document.body.classList.add("theme-dark");
    if (iconEl) iconEl.textContent = "☀️";
    if (textEl) textEl.textContent = "Light Mode";
  }
  localStorage.setItem("hitAdminTheme", theme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.contains("theme-light");
    applyTheme(isLight ? "dark" : "light");
  });
}

initTheme();

// Show/Hide Password Toggle
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordBtn.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      togglePasswordBtn.textContent = "👁️";
    }
  });
}

// Sidebar toggle on mobile
if (sidebarToggleBtn && adminSidebar) {
  sidebarToggleBtn.addEventListener("click", () => {
    adminSidebar.classList.add("is-open");
  });
}

if (sidebarCloseBtn && adminSidebar) {
  sidebarCloseBtn.addEventListener("click", () => {
    adminSidebar.classList.remove("is-open");
  });
}

// Close mobile sidebar when clicking outside of it
document.addEventListener("click", (e) => {
  if (adminSidebar && adminSidebar.classList.contains("is-open")) {
    // Check if click was outside sidebar and not on toggle button
    if (!adminSidebar.contains(e.target) && (!sidebarToggleBtn || !sidebarToggleBtn.contains(e.target))) {
      adminSidebar.classList.remove("is-open");
    }
  }
});

// Collapsible sidebar on desktop
if (sidebarCollapseBtn && adminSidebar) {
  sidebarCollapseBtn.addEventListener("click", () => {
    const isCollapsed = adminSidebar.classList.toggle("collapsed");
    document.getElementById("adminScreen").classList.toggle("sidebar-collapsed", isCollapsed);
    
    // Update collapse button text/icon
    const label = sidebarCollapseBtn.querySelector("span");
    const icon = sidebarCollapseBtn.querySelector("svg");
    if (isCollapsed) {
      if (label) label.style.display = "none";
      sidebarCollapseBtn.title = "Expand Sidebar";
      if (icon) icon.style.transform = "rotate(180deg)";
    } else {
      if (label) label.style.display = "inline";
      sidebarCollapseBtn.title = "Collapse Sidebar";
      if (icon) icon.style.transform = "none";
    }
  });
}

// Collapsible sidebar sub-menus click toggles
document.querySelectorAll(".tab-toggle-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const group = btn.closest(".sidebar-menu-group");
    const subMenu = group.querySelector(".sidebar-sub-menu");
    const chevron = btn.querySelector(".chevron-icon");
    
    // Toggle active menu group
    const isExpanded = subMenu.style.display === "block";
    subMenu.style.display = isExpanded ? "none" : "block";
    btn.classList.toggle("menu-open", !isExpanded);
    if (chevron) {
      chevron.style.transform = isExpanded ? "rotate(0deg)" : "rotate(90deg)";
    }
    
    // Switch to main tab
    const tabId = btn.getAttribute("data-tab");
    switchTab(tabId);
  });
});

// Bind Inquiries sub-menu tab clicks
document.querySelectorAll("#subMenuInquiries .sub-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.id === "subRequestCreateBtn") {
      switchTab("inquiries");
      openNewRequestModal();
      return;
    }

    document.querySelectorAll("#subMenuInquiries .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeSourceFilter = btn.getAttribute("data-sub-source");
    loadInquiries();
    
    // Switch to inquiries tab if not already active
    switchTab("inquiries");
  });
});

// Bind Products sub-menu clicks
const subProductListBtn = document.getElementById("subProductListBtn");
const subProductAddBtn = document.getElementById("subProductAddBtn");
if (subProductListBtn) {
  subProductListBtn.addEventListener("click", () => {
    document.querySelectorAll("#subMenuProducts .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subProductListBtn.classList.add("active");
    switchTab("products");
  });
}
if (subProductAddBtn) {
  subProductAddBtn.addEventListener("click", () => {
    document.querySelectorAll("#subMenuProducts .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subProductAddBtn.classList.add("active");
    switchTab("products");
    openProductModal(null);
  });
}

// Bind Settings sub-menu clicks
const subSettingsTestBtn = document.getElementById("subSettingsTestBtn");
const subSettingsChannelsBtn = document.getElementById("subSettingsChannelsBtn");
if (subSettingsTestBtn) {
  subSettingsTestBtn.addEventListener("click", () => {
    document.querySelectorAll("#subMenuSettings .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subSettingsTestBtn.classList.add("active");
    switchTab("settings");
    document.getElementById("settingsTestSection").scrollIntoView({ behavior: "smooth" });
  });
}
if (subSettingsChannelsBtn) {
  subSettingsChannelsBtn.addEventListener("click", () => {
    document.querySelectorAll("#subMenuSettings .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subSettingsChannelsBtn.classList.add("active");
    switchTab("settings");
    document.getElementById("settingsChannelsSection").scrollIntoView({ behavior: "smooth" });
  });
}

// Auth helper
function getStoredUsername() {
  return sessionStorage.getItem("hitAdminUsername");
}
function getStoredPassword() {
  return sessionStorage.getItem("hitAdminPassword");
}

function showAdmin() {
  loginScreen.style.display = "none";
  adminScreen.style.display = "flex";
  loadAllData();
}

function showLogin() {
  loginScreen.style.display = "flex";
  adminScreen.style.display = "none";
}

async function attemptLogin(username, password) {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    sessionStorage.setItem("hitAdminUsername", username);
    sessionStorage.setItem("hitAdminPassword", password);
    return true;
  } catch (err) {
    return false;
  }
}

loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  loginError.style.display = "none";
  loginBtn.disabled = true;
  loginBtn.textContent = "Verifying...";
  const ok = await attemptLogin(username, password);
  loginBtn.disabled = false;
  loginBtn.textContent = "Log In to Dashboard";
  if (ok) {
    showAdmin();
  } else {
    loginError.style.display = "block";
  }
});

[usernameInput, passwordInput].forEach(input => {
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loginBtn.click();
    });
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("hitAdminUsername");
  sessionStorage.removeItem("hitAdminPassword");
  showLogin();
});

// CSV Export
exportCsvBtn.addEventListener("click", () => {
  const password = getStoredPassword();
  if (!password) return;
  window.open(`/api/admin/export?x_pass=${encodeURIComponent(password)}`, "_blank");
});

// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  if (!btn.classList.contains("tab-toggle-btn")) {
    btn.addEventListener("click", (e) => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
      // Close sidebar on mobile after clicking
      if (adminSidebar) adminSidebar.classList.remove("is-open");
    });
  }
});

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetBtn) targetBtn.classList.add("active");
  if (targetPane) targetPane.classList.add("active");

  if (tabId === "overview") loadStats();
  if (tabId === "inquiries") loadInquiries();
  if (tabId === "products") loadProducts();
}

document.getElementById("viewAllInquiriesBtn").addEventListener("click", () => {
  switchTab("inquiries");
  // Open sub-menu if not already open
  const group = document.getElementById("menuGroupInquiries");
  const subMenu = group.querySelector(".sidebar-sub-menu");
  const toggleBtn = group.querySelector(".tab-toggle-btn");
  if (subMenu) {
    subMenu.style.display = "block";
    toggleBtn.classList.add("menu-open");
    const chevron = toggleBtn.querySelector(".chevron-icon");
    if (chevron) chevron.style.transform = "rotate(90deg)";
  }
});

document.getElementById("refreshStatsBtn").addEventListener("click", () => {
  loadAllData();
});

// -------------------------------------------------------------
// DATA FETCHING
// -------------------------------------------------------------
async function fetchAdmin(endpoint, options = {}) {
  const password = getStoredPassword();
  if (!password) {
    showLogin();
    return null;
  }
  const headers = {
    "x-admin-password": password,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401) {
    sessionStorage.removeItem("hitAdminUsername");
    sessionStorage.removeItem("hitAdminPassword");
    showLogin();
    return null;
  }
  return res;
}

async function loadAllData() {
  await Promise.all([loadStats(), loadInquiries(), loadProducts()]);
}

// STATS / OVERVIEW
async function loadStats() {
  const res = await fetchAdmin("/api/admin/stats");
  if (!res || !res.ok) return;
  const stats = await res.json();

  document.getElementById("kpiTotal").textContent = stats.total || 0;
  document.getElementById("kpiNew").textContent = stats.newCount || 0;
  document.getElementById("kpiActive").textContent = (stats.contactedCount || 0) + (stats.quotedCount || 0);
  document.getElementById("kpiTopChemical").textContent = stats.topChemical || "N/A";

  const newInquiriesBadge = document.getElementById("newInquiriesBadge");
  if (newInquiriesBadge) {
    if (stats.newCount > 0) {
      newInquiriesBadge.textContent = stats.newCount;
      newInquiriesBadge.style.display = "inline-block";
    } else {
      newInquiriesBadge.style.display = "none";
    }
  }
}

// -------------------------------------------------------------
// INQUIRIES & QUOTES PIPELINE
// -------------------------------------------------------------
async function loadInquiries() {
  const res = await fetchAdmin(`/api/admin/inquiries?status=${activeFilter}&source=${activeSourceFilter}&search=${encodeURIComponent(searchInput.value || "")}`);
  if (!res || !res.ok) return;
  inquiriesData = await res.json();

  renderInquiriesTable(inquiriesData, "inquiriesTableWrap");

  // Render recent preview on overview tab if visible
  if (activeTab === "overview") {
    renderInquiriesTable(inquiriesData.slice(0, 5), "recentTableWrap", true);
  }
}

// Search & Filter event handlers
let searchTimeout = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadInquiries();
  }, 250);
});

document.querySelectorAll("#statusFilterGroup .filter-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#statusFilterGroup .filter-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.getAttribute("data-filter");
    loadInquiries();
  });
});

function renderInquiriesTable(rows, containerId, isCompact = false) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;

  if (!rows || !rows.length) {
    wrap.innerHTML = '<div class="empty-state">No chemical inquiries match your search or filter criteria.</div>';
    return;
  }

  // Render BOTH desktop table and mobile list cards
  const html = `
    <!-- DESKTOP VIEW -->
    <div class="table-scroll desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Source</th>
            <th>Contact Client</th>
            <th>Chemical & Qty</th>
            <th>Industry</th>
            <th>Notes</th>
            <th>Status</th>
            <th>Quick Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r) => rowHtml(r, isCompact)).join("")}
        </tbody>
      </table>
    </div>

    <!-- MOBILE VIEW (CARD ACCORDION LIST) -->
    <div class="mobile-only mobile-cards-list">
      ${rows.map((r) => cardHtml(r)).join("")}
    </div>
  `;
  wrap.innerHTML = html;

  // Bind actions for BOTH views
  const bindEvents = (element) => {
    // Status Change handler
    element.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        await fetchAdmin(`/api/admin/inquiries/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });
        loadStats();
        loadInquiries();
      });
    });

    // Admin Notes button handler
    element.querySelectorAll(".btn-notes").forEach((btn) => {
      btn.addEventListener("click", () => {
        openNotesModal(btn.getAttribute("data-id"));
      });
    });

    // Reply button handler
    element.querySelectorAll(".btn-reply").forEach((btn) => {
      btn.addEventListener("click", () => {
        openReplyModal(btn.getAttribute("data-id"));
      });
    });

    // Delete button handler
    element.querySelectorAll(".btn-delete-inquiry").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Are you sure you want to delete inquiry #${id}?`)) {
          await fetchAdmin(`/api/admin/inquiries/${id}`, { method: "DELETE" });
          loadStats();
          loadInquiries();
        }
      });
    });

    // Collapsible details trigger inside mobile cards
    element.querySelectorAll(".btn-toggle-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const detailsPanel = element.querySelector(`#details-${id}`);
        const isCollapsed = detailsPanel.style.display === "none";
        detailsPanel.style.display = isCollapsed ? "block" : "none";
        btn.classList.toggle("active", isCollapsed);
        btn.title = isCollapsed ? "Hide Details" : "Show Details";
      });
    });
  };

  bindEvents(wrap);
}

function cleanPhoneNumber(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function getSourceBadge(source) {
  switch (String(source).toLowerCase()) {
    case "whatsapp":
      return '<span class="source-badge source-whatsapp">💬 WhatsApp</span>';
    case "email":
      return '<span class="source-badge source-email">✉️ Email</span>';
    case "form":
    default:
      return '<span class="source-badge source-form">📋 Form</span>';
  }
}

function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return String(name || "?").substring(0, 2).toUpperCase();
}

function getAvatarClass(name) {
  const firstChar = String(name || "A").trim().charAt(0).toUpperCase();
  const code = firstChar.charCodeAt(0);
  if (code >= 65 && code <= 70) return "avatar-blue"; // A-F
  if (code >= 71 && code <= 76) return "avatar-green"; // G-L
  if (code >= 77 && code <= 82) return "avatar-orange"; // M-R
  if (code >= 83 && code <= 88) return "avatar-purple"; // S-X
  return "avatar-teal"; // Y-Z & others
}

function rowHtml(r, isCompact) {
  const date = new Date(r.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cleanPhone = cleanPhoneNumber(r.phone);
  const sourceBadge = getSourceBadge(r.source);

  return `
    <tr class="status-row-${r.status}">
      <td class="td-date">${date}</td>
      <td class="td-source">${sourceBadge}</td>
      <td class="td-contact">
        <div class="client-row">
          <div class="client-avatar ${getAvatarClass(r.name)}">${escapeHtml(getInitials(r.name))}</div>
          <div class="client-details">
            <strong class="client-name">${escapeHtml(r.name)}</strong>
            ${r.company ? `<div class="client-company">${escapeHtml(r.company)}</div>` : ""}
            <div class="contact-links">
              <a href="tel:${cleanPhone}" class="contact-link call" title="Call Phone">📞 ${escapeHtml(r.phone)}</a>
              ${r.email ? `<a href="mailto:${escapeHtml(r.email)}" class="contact-link email">✉️ ${escapeHtml(r.email)}</a>` : ""}
            </div>
          </div>
        </div>
      </td>
      <td class="td-chemical">
        <strong class="chem-title">${escapeHtml(r.chemical)}</strong>
        <div class="chem-qty">${escapeHtml(r.quantity)} ${escapeHtml(r.unit || "kg")}</div>
      </td>
      <td class="td-industry">${escapeHtml(r.industry) || "&mdash;"}</td>
      <td class="td-notes">
        ${r.message ? `<div class="customer-msg">${escapeHtml(r.message)}</div>` : ""}
        ${r.adminNotes ? `<div class="admin-notes-badge">📝 ${escapeHtml(r.adminNotes)}</div>` : ""}
      </td>
      <td class="td-status">
        <select class="status-select badge-${r.status}" data-id="${r.id}">
          <option value="new" ${r.status === "new" ? "selected" : ""}>🟢 New</option>
          <option value="contacted" ${r.status === "contacted" ? "selected" : ""}>🟡 Contacted</option>
          <option value="quoted" ${r.status === "quoted" ? "selected" : ""}>🔵 Quoted</option>
          <option value="closed" ${r.status === "closed" ? "selected" : ""}>⚪ Closed</option>
        </select>
      </td>
      <td class="td-actions">
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-action-reply btn-reply" data-id="${r.id}" data-tooltip="Reply to Inquiry">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
          </button>
          <button class="btn btn-action-notes btn-notes" data-id="${r.id}" data-tooltip="Inquiry Notes">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          ${!isCompact ? `
          <button class="btn btn-action-delete btn-delete-inquiry" data-id="${r.id}" data-tooltip="Delete Record">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

// Collapsible Mobile card item
function cardHtml(r) {
  const date = new Date(r.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cleanPhone = cleanPhoneNumber(r.phone);
  const sourceBadge = getSourceBadge(r.source);

  return `
    <div class="mobile-data-card status-row-${r.status}">
      <div class="mobile-card-header">
        <span class="mobile-card-date">${date}</span>
        ${sourceBadge}
        <select class="status-select badge-${r.status}" data-id="${r.id}" style="margin-left: auto;">
          <option value="new" ${r.status === "new" ? "selected" : ""}>🟢 New</option>
          <option value="contacted" ${r.status === "contacted" ? "selected" : ""}>🟡 Contacted</option>
          <option value="quoted" ${r.status === "quoted" ? "selected" : ""}>🔵 Quoted</option>
          <option value="closed" ${r.status === "closed" ? "selected" : ""}>⚪ Closed</option>
        </select>
      </div>
      
      <div class="mobile-card-body">
        <div class="mobile-card-row">
          <span class="lbl">Client:</span>
          <span class="val">
            <strong class="client-name">${escapeHtml(r.name)}</strong>
            ${r.company ? `<span class="client-company">(${escapeHtml(r.company)})</span>` : ""}
          </span>
        </div>
        <div class="mobile-card-row">
          <span class="lbl">Chemical:</span>
          <span class="val"><strong class="chem-title">${escapeHtml(r.chemical)}</strong></span>
        </div>
        <div class="mobile-card-row">
          <span class="lbl">Quantity:</span>
          <span class="val chem-qty">${escapeHtml(r.quantity)} ${escapeHtml(r.unit || "kg")}</span>
        </div>
        
        <!-- Collapsible Details panel -->
        <div class="mobile-card-details" id="details-${r.id}" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--adm-topbar-border);">
          <div class="mobile-card-row">
            <span class="lbl">Industry:</span>
            <span class="val">${escapeHtml(r.industry) || "&mdash;"}</span>
          </div>
          <div class="mobile-card-row">
            <span class="lbl">Message:</span>
            <span class="val customer-msg">${escapeHtml(r.message) || "&mdash;"}</span>
          </div>
          ${r.adminNotes ? `
          <div class="mobile-card-row">
            <span class="lbl">Admin Notes:</span>
            <span class="val"><span class="admin-notes-badge">📝 ${escapeHtml(r.adminNotes)}</span></span>
          </div>
          ` : ""}
          <div class="mobile-card-row" style="margin-top: 12px; gap: 8px;">
            <a href="tel:${cleanPhone}" class="btn btn-secondary btn-sm flex-1" style="justify-content: center;">📞 Call</a>
            ${r.email ? `<a href="mailto:${escapeHtml(r.email)}" class="btn btn-secondary btn-sm flex-1" style="justify-content: center;">✉️ Email</a>` : ""}
          </div>
        </div>
      </div>
      
      <div class="mobile-card-footer" style="display: flex; gap: 8px; align-items: center; justify-content: flex-end; width: 100%;">
        <button class="btn btn-action-details btn-toggle-details" data-id="${r.id}" data-tooltip="Show Details">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
        <button class="btn btn-action-reply btn-reply" data-id="${r.id}" data-tooltip="Reply to Inquiry">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
        </button>
        <button class="btn btn-action-notes btn-notes" data-id="${r.id}" data-tooltip="Inquiry Notes">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="btn btn-action-delete btn-delete-inquiry" data-id="${r.id}" data-tooltip="Delete Record">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// NOTES MODAL
// -------------------------------------------------------------
const notesModal = document.getElementById("notesModal");
const notesInquiryId = document.getElementById("notesInquiryId");
const notesInquiryHeader = document.getElementById("notesInquiryHeader");
const adminNotesInput = document.getElementById("adminNotesInput");
const saveNotesBtn = document.getElementById("saveNotesBtn");

function openNotesModal(id) {
  const record = inquiriesData.find((r) => String(r.id) === String(id));
  if (!record) return;
  notesInquiryId.value = id;
  notesInquiryHeader.textContent = `Inquiry #${record.id} — ${record.name} (${record.chemical})`;
  adminNotesInput.value = record.adminNotes || "";
  notesModal.style.display = "flex";
}

if (notesModal) {
  document.getElementById("closeNotesModal").addEventListener("click", () => (notesModal.style.display = "none"));
  document.getElementById("cancelNotesModal").addEventListener("click", () => (notesModal.style.display = "none"));

  saveNotesBtn.addEventListener("click", async () => {
    const id = notesInquiryId.value;
    const adminNotes = adminNotesInput.value;
    saveNotesBtn.disabled = true;
    saveNotesBtn.textContent = "Saving...";
    await fetchAdmin(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ adminNotes }),
    });
    saveNotesBtn.disabled = false;
    saveNotesBtn.textContent = "Save Notes";
    notesModal.style.display = "none";
    loadInquiries();
  });
}

// -------------------------------------------------------------
// REPLY MODAL
// -------------------------------------------------------------
const replyModal = document.getElementById("replyModal");
const replyInquiryId = document.getElementById("replyInquiryId");
const replyCustomerSummary = document.getElementById("replyCustomerSummary");
const replyMessageInput = document.getElementById("replyMessageInput");
const replyEmailBtn = document.getElementById("replyEmailBtn");
const replyWhatsappBtn = document.getElementById("replyWhatsappBtn");
const cancelReplyModal = document.getElementById("cancelReplyModal");
const closeReplyModal = document.getElementById("closeReplyModal");

function openReplyModal(id) {
  const record = inquiriesData.find((r) => String(r.id) === String(id));
  if (!record) return;

  replyInquiryId.value = id;
  
  // Format summary header info
  replyCustomerSummary.innerHTML = `
    <strong>Customer:</strong> ${escapeHtml(record.name)} ${record.company ? `(${escapeHtml(record.company)})` : ""}<br>
    <strong>Request:</strong> ${escapeHtml(record.chemical)} — ${escapeHtml(record.quantity)} ${escapeHtml(record.unit || "kg")}<br>
    <strong>Contact:</strong> ${escapeHtml(record.phone)} ${record.email ? ` | ${escapeHtml(record.email)}` : ""}
  `;

  // Default greeting template
  replyMessageInput.value = `Hello ${record.name},\n\nThank you for contacting Hit Enterprise regarding your chemical request for ${record.chemical}. `;
  
  replyModal.style.display = "flex";
}

if (replyModal) {
  closeReplyModal.addEventListener("click", () => (replyModal.style.display = "none"));
  cancelReplyModal.addEventListener("click", () => (replyModal.style.display = "none"));

  // Template triggers
  document.querySelectorAll(".btn-template").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-template");
      const record = inquiriesData.find((r) => String(r.id) === String(replyInquiryId.value));
      if (!record) return;

      if (type === "quote") {
        replyMessageInput.value = `Hello ${record.name},\n\nWe are pleased to offer you a quote for ${record.chemical} (${record.quantity} ${record.unit || "kg"}):\n\n- Price: Rs. ___ per kg\n- Purity: ___\n- Packing: ___\n- Delivery: Bhavnagar dispatch\n\nPlease let us know if you'd like to confirm this order.\n\nBest regards,\nSales Team\nHit Enterprise`;
      } else if (type === "specs") {
        replyMessageInput.value = `Hello ${record.name},\n\nRegarding your request for ${record.chemical}, could you please specify the desired purity grade and preferred packaging (e.g. carboys, drums, bags) so we can provide an exact quotation?\n\nBest regards,\nHit Enterprise`;
      } else if (type === "followup") {
        replyMessageInput.value = `Hello ${record.name},\n\nThis is regarding your quote request for ${record.chemical}. We tried reaching you via phone. Please call us back or let us know a convenient time to call you.\n\nBest regards,\nHit Enterprise`;
      }
    });
  });

  // Reply via Email Action
  replyEmailBtn.addEventListener("click", async () => {
    const id = replyInquiryId.value;
    const record = inquiriesData.find((r) => String(r.id) === String(id));
    if (!record || !record.email) {
      alert("This customer does not have an email address specified.");
      return;
    }

    const body = replyMessageInput.value;
    const subject = `Quote Request Update for ${record.chemical} - Hit Enterprise`;
    
    // Open email client
    window.open(`mailto:${encodeURIComponent(record.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

    // Automatically set status to contacted
    if (record.status === "new") {
      await fetchAdmin(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "contacted" }),
      });
      loadStats();
      loadInquiries();
    }
    
    replyModal.style.display = "none";
  });

  // Reply via WhatsApp Action
  replyWhatsappBtn.addEventListener("click", async () => {
    const id = replyInquiryId.value;
    const record = inquiriesData.find((r) => String(r.id) === String(id));
    if (!record) return;

    const cleanPhone = cleanPhoneNumber(record.phone).replace("+", "");
    if (!cleanPhone) {
      alert("This customer does not have a valid phone number specified.");
      return;
    }

    const body = replyMessageInput.value;
    
    // Open WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`, "_blank");

    // Automatically set status to contacted
    if (record.status === "new") {
      await fetchAdmin(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "contacted" }),
      });
      loadStats();
      loadInquiries();
    }

    replyModal.style.display = "none";
  });
}

// -------------------------------------------------------------
// CREATE NEW REQUEST MODAL (ADMIN)
// -------------------------------------------------------------
const newRequestModal = document.getElementById("newRequestModal");
const newRequestForm = document.getElementById("newRequestForm");
const createRequestBtn = document.getElementById("createRequestBtn");
const reqChemicalSelect = document.getElementById("reqChemicalSelect");
const reqChemicalCustomWrap = document.getElementById("reqChemicalCustomWrap");
const reqChemicalCustom = document.getElementById("reqChemicalCustom");

function openNewRequestModal() {
  if (!newRequestForm) return;
  newRequestForm.reset();
  if (reqChemicalCustomWrap) reqChemicalCustomWrap.style.display = "none";
  if (reqChemicalCustom) reqChemicalCustom.required = false;
  populateRequestChemicalDropdown();
  if (newRequestModal) newRequestModal.style.display = "flex";
}

function populateRequestChemicalDropdown() {
  if (!reqChemicalSelect) return;
  
  let optionsHtml = '<option value="">Select a chemical...</option>';
  // Add chemicals from product catalog database
  productsData.forEach(p => {
    optionsHtml += `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`;
  });
  optionsHtml += '<option value="__custom__">➕ Other (Type Custom Chemical)...</option>';
  reqChemicalSelect.innerHTML = optionsHtml;
}

if (createRequestBtn) {
  createRequestBtn.addEventListener("click", openNewRequestModal);
}

if (newRequestModal) {
  document.getElementById("closeNewRequestModal").addEventListener("click", () => (newRequestModal.style.display = "none"));
  document.getElementById("cancelNewRequestModal").addEventListener("click", () => (newRequestModal.style.display = "none"));
}

if (reqChemicalSelect) {
  reqChemicalSelect.addEventListener("change", () => {
    if (reqChemicalSelect.value === "__custom__") {
      reqChemicalCustomWrap.style.display = "block";
      reqChemicalCustom.required = true;
      reqChemicalCustom.focus();
    } else {
      reqChemicalCustomWrap.style.display = "none";
      reqChemicalCustom.required = false;
    }
  });
}

if (newRequestForm) {
  newRequestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    let chemicalName = reqChemicalSelect.value;
    if (chemicalName === "__custom__") {
      chemicalName = reqChemicalCustom.value.trim();
    }

    if (!chemicalName) {
      alert("Please select or type a chemical product.");
      return;
    }

    const payload = {
      name: document.getElementById("reqName").value.trim(),
      company: document.getElementById("reqCompany").value.trim(),
      phone: document.getElementById("reqPhone").value.trim(),
      email: document.getElementById("reqEmail").value.trim(),
      chemical: chemicalName,
      quantity: document.getElementById("reqQuantity").value.trim(),
      unit: document.getElementById("reqUnit").value,
      industry: document.getElementById("reqIndustry").value,
      message: document.getElementById("reqMessage").value.trim(),
      source: document.getElementById("reqSource").value,
    };

    const submitBtn = document.getElementById("saveRequestBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    const res = await fetchAdmin("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Create Request";

    if (res && res.ok) {
      newRequestModal.style.display = "none";
      loadStats();
      loadInquiries();
    } else {
      const err = res ? await res.json() : {};
      alert(`Failed to create request: ${err.error || "Server error"}`);
    }
  });
}

// -------------------------------------------------------------
// PRODUCT CATALOG MANAGER
// -------------------------------------------------------------
async function loadProducts() {
  const res = await fetchAdmin("/api/admin/products");
  if (!res || !res.ok) return;
  productsData = await res.json();
  renderProductsTable(productsData);
  populateRequestChemicalDropdown(); // Re-populate request select drop down
}

function renderProductsTable(products) {
  const wrap = document.getElementById("productsTableWrap");
  if (!wrap) return;

  if (!products || !products.length) {
    wrap.innerHTML = '<div class="empty-state">No products in catalogue. Click "+ Add New Chemical Product" to add one.</div>';
    return;
  }

  // Render BOTH desktop table and mobile list cards
  const html = `
    <!-- DESKTOP VIEW -->
    <div class="table-scroll desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>Chemical Name</th>
            <th>Category</th>
            <th>CAS No</th>
            <th>Purity / Grade</th>
            <th>Packaging</th>
            <th>Applications</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td><strong>${escapeHtml(p.name)}</strong></td>
              <td><span class="category-pill">${escapeHtml(p.category)}</span></td>
              <td><code>${escapeHtml(p.cas) || "&mdash;"}</code></td>
              <td>${escapeHtml(p.purity || p.grade || "&mdash;")}</td>
              <td>${escapeHtml(p.packaging) || "&mdash;"}</td>
              <td style="max-width:200px;">${escapeHtml(p.applications) || "&mdash;"}</td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-action-edit btn-edit-prod" data-id="${p.id}" data-tooltip="Edit Product">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="btn btn-action-delete btn-del-prod" data-id="${p.id}" data-tooltip="Delete Product">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <!-- MOBILE VIEW (CARDS LIST) -->
    <div class="mobile-only mobile-cards-list">
      ${products.map((p) => `
        <div class="mobile-data-card">
          <div class="mobile-card-header">
            <strong>${escapeHtml(p.name)}</strong>
            <span class="category-pill" style="margin-left: auto;">${escapeHtml(p.category)}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-row">
              <span class="lbl">CAS No:</span>
              <span class="val"><code>${escapeHtml(p.cas) || "&mdash;"}</code></span>
            </div>
            <div class="mobile-card-row">
              <span class="lbl">Spec/Purity:</span>
              <span class="val">${escapeHtml(p.purity || p.grade || "&mdash;")}</span>
            </div>
            <div class="mobile-card-row">
              <span class="lbl">Packaging:</span>
              <span class="val">${escapeHtml(p.packaging) || "&mdash;"}</span>
            </div>
            
            <div class="mobile-card-details" id="details-prod-${p.id}" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--adm-topbar-border);">
              <div class="mobile-card-row">
                <span class="lbl">Applications:</span>
                <span class="val">${escapeHtml(p.applications) || "&mdash;"}</span>
              </div>
            </div>
          </div>
          <div class="mobile-card-footer" style="display: flex; gap: 8px; align-items: center; justify-content: flex-end; width: 100%;">
            <button class="btn btn-action-details btn-toggle-details" data-id="prod-${p.id}" data-tooltip="Show Details">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button class="btn btn-action-edit btn-edit-prod" data-id="${p.id}" data-tooltip="Edit Product">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn btn-action-delete btn-del-prod" data-id="${p.id}" data-tooltip="Delete Product">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
  wrap.innerHTML = html;

  // Bind actions
  const bindEvents = (element) => {
    element.querySelectorAll(".btn-edit-prod").forEach((b) => {
      b.addEventListener("click", () => openProductModal(b.getAttribute("data-id")));
    });

    element.querySelectorAll(".btn-del-prod").forEach((b) => {
      b.addEventListener("click", async () => {
        const id = b.getAttribute("data-id");
        if (confirm("Delete this product from catalog?")) {
          await fetchAdmin(`/api/admin/products/${id}`, { method: "DELETE" });
          loadProducts();
        }
      });
    });

    element.querySelectorAll(".btn-toggle-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const detailsPanel = element.querySelector(`#details-${id}`);
        const isCollapsed = detailsPanel.style.display === "none";
        detailsPanel.style.display = isCollapsed ? "block" : "none";
        btn.textContent = isCollapsed ? "👁️ Hide Details" : "👁️ Details";
      });
    });
  };

  bindEvents(wrap);
}

// Product Modal
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

if (productModal) {
  document.getElementById("addProductBtn").addEventListener("click", () => openProductModal(null));
  document.getElementById("closeProductModal").addEventListener("click", () => (productModal.style.display = "none"));
  document.getElementById("cancelProductModal").addEventListener("click", () => (productModal.style.display = "none"));
}

function openProductModal(id) {
  document.getElementById("modalTitle").textContent = id ? "Edit Chemical Product" : "Add Chemical Product";
  document.getElementById("prodId").value = id || "";

  if (id) {
    const prod = productsData.find((p) => String(p.id) === String(id));
    if (prod) {
      document.getElementById("prodName").value = prod.name || "";
      document.getElementById("prodCategory").value = prod.category || "";
      document.getElementById("prodCas").value = prod.cas || "";
      document.getElementById("prodGrade").value = prod.grade || "";
      document.getElementById("prodPurity").value = prod.purity || "";
      document.getElementById("prodPackaging").value = prod.packaging || "";
      document.getElementById("prodApplications").value = prod.applications || "";
    }
  } else {
    productForm.reset();
  }
  productModal.style.display = "flex";
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("prodId").value;
    const payload = {
      name: document.getElementById("prodName").value,
      category: document.getElementById("prodCategory").value,
      cas: document.getElementById("prodCas").value,
      grade: document.getElementById("prodGrade").value,
      purity: document.getElementById("prodPurity").value,
      packaging: document.getElementById("prodPackaging").value,
      applications: document.getElementById("prodApplications").value,
    };

    if (id) {
      await fetchAdmin(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await fetchAdmin("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    productModal.style.display = "none";
    loadProducts();
  });
}

// -------------------------------------------------------------
// SETTINGS / TEST NOTIFICATION
// -------------------------------------------------------------
const testNotifyBtn = document.getElementById("testNotifyBtn");
const testNotifyResult = document.getElementById("testNotifyResult");

if (testNotifyBtn) {
  testNotifyBtn.addEventListener("click", async () => {
    testNotifyResult.textContent = "Sending test notification...";
    testNotifyResult.className = "notify-result pending";
    testNotifyBtn.disabled = true;

    const res = await fetchAdmin("/api/admin/test-notify", { method: "POST" });
    testNotifyBtn.disabled = false;

    if (res && res.ok) {
      const data = await res.json();
      testNotifyResult.textContent = data.message || "Test alert sent successfully!";
      testNotifyResult.className = "notify-result success";
    } else {
      const errData = res ? await res.json() : {};
      testNotifyResult.textContent = `Failed: ${errData.error || "Check server console or .env variables."}`;
      testNotifyResult.className = "notify-result error";
    }
  });
}

// Helper for escaping HTML
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// Initial Load
if (getStoredPassword()) {
  showAdmin();
} else {
  showLogin();
}
