// Executive Admin Dashboard Logic — Hit Enterprise

let activeTab = "overview";
let activeFilter = "all";
let activeSourceFilter = "all";
let inquiriesData = [];
let productsData = [];

// Essential Helper Functions
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
const topbarThemeToggleBtn = document.getElementById("topbarThemeToggleBtn");
const topbarSearchInput = document.getElementById("topbarSearchInput");
const topbarWhatsappBtn = document.getElementById("topbarWhatsappBtn");
const topbarNotificationsBtn = document.getElementById("topbarNotificationsBtn");
const notificationsDropdown = document.getElementById("notificationsDropdown");
const notifListWrap = document.getElementById("notifListWrap");
const overviewCreateBtn = document.getElementById("overviewCreateBtn");

// Sidebar Toggle Elements
const adminSidebar = document.getElementById("adminSidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarCollapseBtn = document.getElementById("sidebarCollapseBtn");

// Theme Switcher Logic (Default: Light Mode)
function initTheme() {
  const currentTheme = localStorage.getItem("hitAdminTheme") || "light";
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  const iconEl = document.getElementById("themeToggleIcon");
  const textEl = document.getElementById("themeToggleText");
  const topbarThemeIcon = document.querySelector("#topbarThemeToggleBtn svg");

  if (theme === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
    if (iconEl) iconEl.innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
    if (textEl) textEl.textContent = "Dark Mode";
    if (topbarThemeIcon) {
      topbarThemeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
  } else {
    document.body.classList.remove("theme-light");
    document.body.classList.add("theme-dark");
    if (iconEl) iconEl.innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>';
    if (textEl) textEl.textContent = "Light Mode";
    if (topbarThemeIcon) {
      topbarThemeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    }
  }
  localStorage.setItem("hitAdminTheme", theme);
}

const toggleTheme = () => {
  const isLight = document.body.classList.contains("theme-light");
  applyTheme(isLight ? "dark" : "light");
};

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
}
if (topbarThemeToggleBtn) {
  topbarThemeToggleBtn.addEventListener("click", toggleTheme);
}

initTheme();

// Overview Quick Create Button
if (overviewCreateBtn) {
  overviewCreateBtn.addEventListener("click", () => {
    openNewRequestModal();
  });
}

// Global Keyboard Shortcut: Ctrl+K / Cmd+K
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (topbarSearchInput) {
      topbarSearchInput.focus();
      topbarSearchInput.select();
    }
  }
});

// Topbar Search Input & Mobile Search Trigger
const topbarSearchWrap = document.querySelector(".topbar-search-wrap");
if (topbarSearchWrap) {
  topbarSearchWrap.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      switchTab("inquiries");
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  });
}

if (topbarSearchInput) {
  topbarSearchInput.addEventListener("input", () => {
    const val = topbarSearchInput.value.trim();
    if (searchInput) {
      searchInput.value = val;
    }
    if (activeTab !== "inquiries") {
      switchTab("inquiries");
    }
    loadInquiries();
  });
}

// Topbar WhatsApp Leads Quick Trigger
if (topbarWhatsappBtn) {
  topbarWhatsappBtn.addEventListener("click", () => {
    switchTab("inquiries");
    activeSourceFilter = "whatsapp";
    const waSubBtn = document.querySelector('#subMenuInquiries [data-sub-source="whatsapp"]');
    if (waSubBtn) {
      document.querySelectorAll("#subMenuInquiries .sub-tab-btn").forEach((b) => b.classList.remove("active"));
      waSubBtn.classList.add("active");
    }
    loadInquiries();
  });
}

// Topbar Notifications Center Toggle
if (topbarNotificationsBtn && notificationsDropdown) {
  topbarNotificationsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = notificationsDropdown.style.display === "none";
    notificationsDropdown.style.display = isHidden ? "block" : "none";
  });

  document.addEventListener("click", (e) => {
    if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !topbarNotificationsBtn.contains(e.target)) {
      notificationsDropdown.style.display = "none";
    }
  });
}

// Show/Hide Password Toggle with SVG icons
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordBtn.innerHTML = '<svg class="eye-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>';
    } else {
      passwordInput.type = "password";
      togglePasswordBtn.innerHTML = '<svg class="eye-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
    }
  });
}

// Sidebar toggle on mobile with Backdrop Overlay
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

function openMobileSidebar() {
  if (adminSidebar) adminSidebar.classList.add("is-open");
  if (sidebarBackdrop) sidebarBackdrop.classList.add("is-active");
}

function closeMobileSidebar() {
  if (adminSidebar) adminSidebar.classList.remove("is-open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("is-active");
}

if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openMobileSidebar();
  });
}

if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMobileSidebar();
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", closeMobileSidebar);
}

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
    
    // Switch to main tab (keep sidebar open if expanding to pick sub-items)
    const tabId = btn.getAttribute("data-tab");
    switchTab(tabId, false);
  });
});

// Bind Inquiries sub-menu tab clicks
document.querySelectorAll("#subMenuInquiries .sub-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeMobileSidebar();
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
    closeMobileSidebar();
    document.querySelectorAll("#subMenuProducts .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subProductListBtn.classList.add("active");
    switchTab("products");
  });
}
if (subProductAddBtn) {
  subProductAddBtn.addEventListener("click", () => {
    closeMobileSidebar();
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
    closeMobileSidebar();
    document.querySelectorAll("#subMenuSettings .sub-tab-btn").forEach((b) => b.classList.remove("active"));
    subSettingsTestBtn.classList.add("active");
    switchTab("settings");
    document.getElementById("settingsTestSection").scrollIntoView({ behavior: "smooth" });
  });
}
if (subSettingsChannelsBtn) {
  subSettingsChannelsBtn.addEventListener("click", () => {
    closeMobileSidebar();
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
  loginBtn.innerHTML = `<span>Verifying Access...</span>`;
  const ok = await attemptLogin(username, password);
  loginBtn.disabled = false;
  loginBtn.innerHTML = `<span>Access Executive Dashboard</span> <svg class="arrow-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
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

document.querySelectorAll("#logoutBtn, .btn-logout-modern").forEach((btn) => {
  btn.addEventListener("click", () => {
    sessionStorage.removeItem("hitAdminUsername");
    sessionStorage.removeItem("hitAdminPassword");
    showLogin();
  });
});

if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    const password = getStoredPassword();
    if (!password) return;
    window.open(`/api/admin/export?x_pass=${encodeURIComponent(password)}`, "_blank");
  });
}

// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  if (!btn.classList.contains("tab-toggle-btn")) {
    btn.addEventListener("click", (e) => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
      closeMobileSidebar();
    });
  }
});

function switchTab(tabId, shouldCloseMobile = true) {
  activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetBtn) targetBtn.classList.add("active");
  if (targetPane) targetPane.classList.add("active");

  // Auto-close sidebar on mobile
  if (shouldCloseMobile) {
    closeMobileSidebar();
  }

  if (tabId === "overview") {
    loadStats();
    loadInquiries();
  }
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
  applyInventoryUI();
}

// STATS / OVERVIEW
async function loadStats() {
  const res = await fetchAdmin("/api/admin/stats");
  if (!res || !res.ok) return;
  const stats = await res.json();

  document.getElementById("kpiTotal").textContent = stats.total || 0;
  document.getElementById("kpiNew").textContent = stats.newCount || 0;
  document.getElementById("kpiActive").textContent = (stats.contactedCount || 0) + (stats.quotedCount || 0);
  document.getElementById("kpiTopChemical").textContent = stats.topChemical || "Toluene 99%";
  
  const chartTotal = document.getElementById("chartTotalMonth");
  if (chartTotal) {
    chartTotal.textContent = stats.total || 0;
  }

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
// DYNAMIC DASHBOARD REPORTS & WIDGETS
// -------------------------------------------------------------
function renderDashboardWidgets(inquiries, products) {
  if (!inquiries) inquiries = [];
  if (!products) products = [];

  // 1. MONTHLY INQUIRY TRAJECTORY & METRICS
  const now = new Date();
  const currentMonthInquiries = inquiries.filter(i => {
    const d = new Date(i.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthCount = currentMonthInquiries.length;
  
  const chartTotalMonth = document.getElementById("chartTotalMonth");
  if (chartTotalMonth) {
    chartTotalMonth.textContent = thisMonthCount;
  }

  // Conversion rate (quoted, contacted, or closed / total)
  const convertedCount = inquiries.filter(i => i.status === 'quoted' || i.status === 'closed' || i.status === 'contacted').length;
  const conversionRate = inquiries.length ? Math.round((convertedCount / inquiries.length) * 100) : 0;
  const chartConversionRate = document.getElementById("chartConversionRate");
  if (chartConversionRate) {
    chartConversionRate.textContent = `${conversionRate}%`;
  }

  // Avg order size
  let totalKg = 0;
  let validOrderCount = 0;
  inquiries.forEach(i => {
    let q = parseFloat(String(i.quantity).replace(/[^\d.]/g, ''));
    if (!isNaN(q) && q > 0) {
      const u = String(i.unit || 'kg').toLowerCase();
      if (u.includes('ton')) q *= 1000;
      else if (u.includes('drum')) q *= 200;
      else if (u.includes('carboy')) q *= 30;
      totalKg += q;
      validOrderCount++;
    }
  });
  const avgKg = validOrderCount > 0 ? Math.round(totalKg / validOrderCount) : 0;
  const avgStr = avgKg >= 1000 ? `${(avgKg / 1000).toFixed(1)} Ton` : `${avgKg} kg`;
  const chartAvgVolume = document.getElementById("chartAvgVolume");
  if (chartAvgVolume) {
    chartAvgVolume.textContent = avgKg > 0 ? avgStr : "0 kg";
  }

  // Dynamic Weekly SVG Trajectory Chart
  const svgChart = document.querySelector(".inquiry-trend-svg");
  if (svgChart) {
    const weekCounts = [0, 0, 0, 0];
    currentMonthInquiries.forEach(i => {
      const d = new Date(i.createdAt);
      const day = d.getDate();
      const w = Math.min(Math.floor((day - 1) / 7), 3);
      weekCounts[w]++;
    });

    const maxW = Math.max(...weekCounts, 1);
    const getY = (val) => Math.round(135 - (val / maxW) * 95);
    const y0 = getY(weekCounts[0]);
    const y1 = getY(weekCounts[1]);
    const y2 = getY(weekCounts[2]);
    const y3 = getY(weekCounts[3]);
    const yCur = getY(weekCounts[Math.min(Math.floor((now.getDate() - 1) / 7), 3)]);

    svgChart.innerHTML = `
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="30" x2="500" y2="30" stroke="var(--adm-topbar-border)" stroke-dasharray="4"/>
      <line x1="0" y1="75" x2="500" y2="75" stroke="var(--adm-topbar-border)" stroke-dasharray="4"/>
      <line x1="0" y1="120" x2="500" y2="120" stroke="var(--adm-topbar-border)" stroke-dasharray="4"/>
      
      <path d="M 20,${y0} Q 80,${Math.round((y0+y1)/2)} 140,${y1} T 260,${y2} T 380,${y3} T 480,${yCur} L 480,145 L 20,145 Z" fill="url(#chartGradient)"/>
      <path d="M 20,${y0} Q 80,${Math.round((y0+y1)/2)} 140,${y1} T 260,${y2} T 380,${y3} T 480,${yCur}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
      
      <circle cx="20" cy="${y0}" r="4.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="140" cy="${y1}" r="4.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="260" cy="${y2}" r="4.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="380" cy="${y3}" r="4.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="480" cy="${yCur}" r="5.5" fill="#C89B3C" stroke="#FFFFFF" stroke-width="2"/>
    `;
  }

  // 2. TOP REQUESTED CHEMICALS DEMAND METER
  const chemCounts = {};
  inquiries.forEach(i => {
    const name = String(i.chemical || '').trim();
    if (name) {
      chemCounts[name] = (chemCounts[name] || 0) + 1;
    }
  });

  let sortedChems = Object.entries(chemCounts).sort((a, b) => b[1] - a[1]);
  if (sortedChems.length < 4 && products.length) {
    products.forEach(p => {
      if (!chemCounts[p.name] && sortedChems.length < 4) {
        sortedChems.push([p.name, 0]);
      }
    });
  }

  const totalInquiriesCount = inquiries.length || 1;
  const colors = ['#0284C7', '#0D9488', '#8B5CF6', '#C89B3C'];
  const demandListWrap = document.querySelector(".demand-rank-list");
  if (demandListWrap && sortedChems.length) {
    demandListWrap.innerHTML = sortedChems.slice(0, 4).map(([name, count], idx) => {
      const sharePct = inquiries.length ? Math.round((count / totalInquiriesCount) * 100) : 0;
      const barWidth = inquiries.length ? Math.max(sharePct, count > 0 ? 12 : 4) : 8;
      const barColor = colors[idx % colors.length];
      return `
        <div class="demand-rank-item">
          <span class="rank-idx">${idx + 1}</span>
          <div class="demand-info">
            <div class="demand-row">
              <span class="chem-name">${escapeHtml(name)}</span>
              <span class="demand-share font-mono font-bold">${sharePct}% Demand</span>
            </div>
            <div class="demand-progress-wrap">
              <div class="demand-progress-bar" style="width: ${barWidth}%; background: ${barColor};"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. LEAD SOURCE CHANNELS DISTRIBUTION
  const waCount = inquiries.filter(i => (i.source || '').toLowerCase() === 'whatsapp').length;
  const formCount = inquiries.filter(i => (i.source || '').toLowerCase() === 'form' || !i.source).length;
  const emailCount = inquiries.filter(i => (i.source || '').toLowerCase() === 'email').length;
  const totalLeads = inquiries.length;

  let waPct = totalLeads ? Math.round((waCount / totalLeads) * 100) : 0;
  let formPct = totalLeads ? Math.round((formCount / totalLeads) * 100) : 0;
  let emailPct = totalLeads ? Math.round((emailCount / totalLeads) * 100) : 0;

  const channelMultiBar = document.querySelector(".channel-multi-bar");
  if (channelMultiBar) {
    if (totalLeads === 0) {
      channelMultiBar.innerHTML = `
        <div class="bar-segment" style="width: 100%; background: var(--adm-card-border);" title="No Leads Yet"></div>
      `;
    } else {
      channelMultiBar.innerHTML = `
        <div class="bar-segment bar-wa" style="width: ${waPct}%;" title="WhatsApp ${waPct}%"></div>
        <div class="bar-segment bar-form" style="width: ${formPct}%;" title="Web Form ${formPct}%"></div>
        <div class="bar-segment bar-email" style="width: ${emailPct}%;" title="Email ${emailPct}%"></div>
      `;
    }
  }

  const channelLegend = document.querySelector(".channel-legend");
  if (channelLegend) {
    channelLegend.innerHTML = `
      <span class="leg-item"><span class="dot bg-wa"></span> WhatsApp (${waPct}%)</span>
      <span class="leg-item"><span class="dot bg-form"></span> Web Form (${formPct}%)</span>
      <span class="leg-item"><span class="dot bg-email"></span> Email (${emailPct}%)</span>
    `;
  }
}

// -------------------------------------------------------------
// INQUIRIES & QUOTES PIPELINE
// -------------------------------------------------------------
function updateNotificationsAndTimeline(inquiries) {
  // Update Topbar WhatsApp Badge
  const waCount = inquiries.filter(i => (i.source || '').toLowerCase() === 'whatsapp' && i.status === 'new').length;
  const msgBadge = document.getElementById("topbarMsgBadge");
  if (msgBadge) {
    msgBadge.style.display = waCount > 0 ? "block" : "none";
  }

  // Update Notifications Popover
  const notifWrap = document.getElementById("notifListWrap");
  if (notifWrap) {
    const recentLeads = inquiries.slice(0, 5);
    if (!recentLeads.length) {
      notifWrap.innerHTML = '<div class="notif-empty" style="padding: 18px; text-align: center; color: var(--adm-text-muted); font-size: 13px;">No new notifications</div>';
    } else {
      notifWrap.innerHTML = recentLeads.map(lead => `
        <div class="notif-item ${lead.status === 'new' ? 'unread' : ''}" data-id="${lead.id}">
          <div class="notif-item-icon ${lead.source === 'whatsapp' ? 'wa' : 'lead'}">
            ${lead.source === 'whatsapp' 
              ? '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.076-4.524 10.079-10.082.001-2.693-1.045-5.225-2.946-7.129C16.5 1.5 13.97 1.002 12.007 1.002c-5.557 0-10.082 4.526-10.085 10.085-.001 1.902.497 3.754 1.443 5.341L2.39 21.847l5.441-1.427c.058.032.112.062.169.091z"/></svg>'
              : '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>'
            }
          </div>
          <div class="notif-item-body">
            <span class="notif-item-title">${escapeHtml(lead.name || 'Anonymous Customer')}</span>
            <span class="notif-item-desc">${escapeHtml(lead.chemical || 'Chemical inquiry')} • ${escapeHtml(lead.quantity || '')} ${escapeHtml(lead.unit || '')}</span>
            <span class="notif-item-time font-mono">${formatDate(lead.createdAt)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Update Live Activity Feed
  const tlWrap = document.getElementById("timelineActivityList");
  if (tlWrap) {
    if (!inquiries.length) {
      tlWrap.innerHTML = `
        <div class="timeline-item">
          <div class="tl-bullet bullet-blue"></div>
          <div class="tl-content">
            <span class="tl-action"><strong>System Ready:</strong> Real-time quote feed initialized</span>
            <span class="tl-meta">Awaiting customer quote requests</span>
          </div>
        </div>
      `;
    } else {
      const recentActivities = inquiries.slice(0, 4);
      tlWrap.innerHTML = recentActivities.map((item, idx) => {
        const colors = ['bullet-blue', 'bullet-green', 'bullet-purple', 'bullet-amber'];
        const bulletColor = colors[idx % colors.length];
        const sourceLabel = item.source === 'whatsapp' ? 'WhatsApp' : item.source === 'email' ? 'Email' : 'Web Form';
        return `
          <div class="timeline-item">
            <div class="tl-bullet ${bulletColor}"></div>
            <div class="tl-content">
              <span class="tl-action"><strong>Quote Lead:</strong> ${escapeHtml(item.chemical || 'Chemical')} (${escapeHtml(item.quantity || '')} ${escapeHtml(item.unit || '')})</span>
              <span class="tl-meta">From ${escapeHtml(item.name || 'Client')} • via ${sourceLabel} • ${formatDate(item.createdAt)}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

async function loadInquiries() {
  const searchVal = searchInput ? searchInput.value : "";
  const res = await fetchAdmin(`/api/admin/inquiries?status=${activeFilter}&source=${activeSourceFilter}&search=${encodeURIComponent(searchVal)}`);
  if (!res || !res.ok) return;
  inquiriesData = await res.json();

  renderInquiriesTable(inquiriesData, "inquiriesTableWrap");
  renderInquiriesTable(inquiriesData.slice(0, 5), "recentTableWrap", true);

  updateNotificationsAndTimeline(inquiriesData);
  renderDashboardWidgets(inquiriesData, productsData);
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

  const html = `
    <div class="inquiry-cards-list">
      ${rows.map((r, index) => inquiryCardHtml(r, index, isCompact)).join("")}
    </div>
  `;
  wrap.innerHTML = html;

  // Bind actions
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
  };

  bindEvents(wrap);
}

function cleanPhoneNumber(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function getSourceBadge(source) {
  switch (String(source).toLowerCase()) {
    case "whatsapp":
      return `
        <span class="source-badge source-whatsapp">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.076-4.524 10.079-10.082.001-2.693-1.045-5.225-2.946-7.129C16.5 1.5 13.97 1.002 12.007 1.002c-5.557 0-10.082 4.526-10.085 10.085-.001 1.902.497 3.754 1.443 5.341L2.39 21.847l5.441-1.427c.058.032.112.062.169.091z"/></svg>
          <span>WhatsApp</span>
        </span>
      `;
    case "email":
      return `
        <span class="source-badge source-email">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Email</span>
        </span>
      `;
    case "form":
    default:
      return `
        <span class="source-badge source-form">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Form</span>
        </span>
      `;
  }
}

function inquiryCardHtml(r, index, isCompact) {
  const date = new Date(r.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cleanPhone = cleanPhoneNumber(r.phone);
  const sourceBadge = getSourceBadge(r.source);

  return `
    <div class="inquiry-row-card status-row-${r.status}" data-id="${r.id}">
      <div class="inquiry-row-left">
        <div class="inquiry-index-badge">#${index + 1}</div>
        <div class="inquiry-details">
          <div class="inquiry-header-line">
            <strong class="inquiry-client-name">${escapeHtml(r.name)}</strong>
            ${r.company ? `<span class="inquiry-client-company">(${escapeHtml(r.company)})</span>` : ""}
          </div>
          <div class="inquiry-meta-line">
            <span class="meta-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>${date}</span>
            </span>
            <span class="meta-separator">•</span>
            <span class="meta-item">
              <a href="tel:${cleanPhone}" class="contact-link call" title="Call ${cleanPhone}">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>${escapeHtml(r.phone)}</span>
              </a>
            </span>
            ${r.email ? `
              <span class="meta-separator">•</span>
              <span class="meta-item">
                <a href="mailto:${escapeHtml(r.email)}" class="contact-link email" title="Email ${escapeHtml(r.email)}">
                  <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>${escapeHtml(r.email)}</span>
                </a>
              </span>
            ` : ""}
            ${r.industry ? `
              <span class="meta-separator">•</span>
              <span class="meta-item">
                <strong>Industry:</strong> ${escapeHtml(r.industry)}
              </span>
            ` : ""}
          </div>
          ${r.message && !isCompact ? `
            <div class="inquiry-message-bubble">
              <strong>Message:</strong> "${escapeHtml(r.message)}"
            </div>
          ` : ""}
          ${r.adminNotes && !isCompact ? `
            <div class="inquiry-notes-bubble">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span><strong>Admin Notes:</strong> ${escapeHtml(r.adminNotes)}</span>
            </div>
          ` : ""}
        </div>
      </div>
      
      <div class="inquiry-row-right">
        <div class="inquiry-source-wrap">
          ${sourceBadge}
        </div>
        <div class="inquiry-status-wrap">
          <select class="status-select badge-${r.status}" data-id="${r.id}">
            <option value="new" ${r.status === "new" ? "selected" : ""}>New</option>
            <option value="contacted" ${r.status === "contacted" ? "selected" : ""}>Contacted</option>
            <option value="quoted" ${r.status === "quoted" ? "selected" : ""}>Quoted</option>
            <option value="closed" ${r.status === "closed" ? "selected" : ""}>Closed</option>
          </select>
        </div>
        <div class="inquiry-actions-wrap">
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
        <div class="inquiry-chemical-wrap">
          <div class="chem-title">${escapeHtml(r.chemical)}</div>
          <div class="chem-qty-label">${escapeHtml(r.quantity)} ${escapeHtml(r.unit || "kg")}</div>
        </div>
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
  optionsHtml += '<option value="__custom__">+ Other (Type Custom Chemical)...</option>';
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
  renderDashboardWidgets(inquiriesData, productsData);
}

function formatProductStock(p) {
  const qty = p.stockQty !== undefined && p.stockQty !== "" ? p.stockQty : "--";
  const unit = p.stockUnit || "Bags";
  const status = (p.stockStatus || "optimal").toLowerCase();
  let badgeClass = "badge-opt";
  let statusLabel = "Optimal";
  if (status === "adequate") { badgeClass = "badge-adeq"; statusLabel = "Adequate"; }
  else if (status === "low_stock" || status === "low stock") { badgeClass = "badge-low"; statusLabel = "Low Stock"; }
  else if (status === "reorder" || status === "reorder alert") { badgeClass = "badge-reorder"; statusLabel = "Reorder Alert"; }
  else if (status === "out_of_stock" || status === "out of stock") { badgeClass = "badge-danger"; statusLabel = "Out of Stock"; }
  
  return `
    <div class="prod-stock-cell" style="display: flex; flex-direction: column; gap: 3px;">
      <span style="font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--adm-text-main);">${escapeHtml(qty)} ${escapeHtml(unit)}</span>
      <span class="stock-status-pill ${badgeClass}" style="align-self: flex-start;">${statusLabel}</span>
    </div>
  `;
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
            <th>Inventory Stock</th>
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
              <td>${formatProductStock(p)}</td>
              <td>${escapeHtml(p.purity || p.grade || "&mdash;")}</td>
              <td>${escapeHtml(p.packaging) || "&mdash;"}</td>
              <td style="max-width:180px; font-size: 12px;">${escapeHtml(p.applications) || "&mdash;"}</td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-action-edit btn-edit-prod" data-id="${p.id}" data-tooltip="Edit Product & Stock">
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
      ${products.map((p) => {
        const st = (p.stockStatus || "optimal").toLowerCase();
        let badgeClass = "badge-opt";
        let statusLabel = "Optimal";
        if (st === "adequate") { badgeClass = "badge-adeq"; statusLabel = "Adequate"; }
        else if (st === "low_stock" || st === "low stock") { badgeClass = "badge-low"; statusLabel = "Low Stock"; }
        else if (st === "reorder" || st === "reorder alert") { badgeClass = "badge-reorder"; statusLabel = "Reorder Alert"; }
        else if (st === "out_of_stock" || st === "out of stock") { badgeClass = "badge-danger"; statusLabel = "Out of Stock"; }

        return `
          <div class="mobile-data-card">
            <div class="mobile-card-header">
              <strong>${escapeHtml(p.name)}</strong>
              <span class="category-pill" style="margin-left: auto;">${escapeHtml(p.category)}</span>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="lbl">Inventory Stock:</span>
                <span class="val" style="display:flex; align-items:center; gap:6px;">
                  <strong class="font-mono">${escapeHtml(p.stockQty || '--')} ${escapeHtml(p.stockUnit || '')}</strong>
                  <span class="stock-status-pill ${badgeClass}">${statusLabel}</span>
                </span>
              </div>
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
        `;
      }).join("")}
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
        btn.setAttribute("data-tooltip", isCollapsed ? "Hide Details" : "Show Details");
      });
    });
  };

  bindEvents(wrap);
}

// Product Modal
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

if (productModal) {
  const addProdBtn = document.getElementById("addProductBtn");
  const closeProdBtn = document.getElementById("closeProductModal");
  const cancelProdBtn = document.getElementById("cancelProductModal");
  if (addProdBtn) addProdBtn.addEventListener("click", () => openProductModal(null));
  if (closeProdBtn) closeProdBtn.addEventListener("click", () => (productModal.style.display = "none"));
  if (cancelProdBtn) cancelProdBtn.addEventListener("click", () => (productModal.style.display = "none"));
}

// Modal Backdrop Dismiss
[notesModal, replyModal, newRequestModal, productModal].forEach((m) => {
  if (m) {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.style.display = "none";
    });
  }
});

function openProductModal(id) {
  document.getElementById("modalTitle").textContent = id ? "Edit Chemical Product & Stock" : "Add Chemical Product";
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
      document.getElementById("prodStockQty").value = prod.stockQty !== undefined ? prod.stockQty : "";
      document.getElementById("prodStockUnit").value = prod.stockUnit || "Bags";
      document.getElementById("prodStockStatus").value = prod.stockStatus || "optimal";
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
      stockQty: document.getElementById("prodStockQty").value,
      stockUnit: document.getElementById("prodStockUnit").value,
      stockStatus: document.getElementById("prodStockStatus").value,
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

// -------------------------------------------------------------
// TOPBAR PROFILE DROPDOWN
// -------------------------------------------------------------
const topbarProfileBtn = document.getElementById("topbarProfileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const topbarThemeToggleBtn2 = document.getElementById("topbarThemeToggleBtn2");
const topbarExportCsvBtn = document.getElementById("topbarExportCsvBtn");

if (topbarProfileBtn && profileDropdown) {
  topbarProfileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = profileDropdown.style.display === "none";
    profileDropdown.style.display = isHidden ? "block" : "none";
  });

  document.addEventListener("click", (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && !topbarProfileBtn.contains(e.target)) {
      profileDropdown.style.display = "none";
    }
  });
}

if (topbarThemeToggleBtn2) {
  topbarThemeToggleBtn2.addEventListener("click", toggleTheme);
}

if (topbarExportCsvBtn) {
  topbarExportCsvBtn.addEventListener("click", () => {
    const password = getStoredPassword();
    if (!password) return;
    window.open(`/api/admin/export?x_pass=${encodeURIComponent(password)}`, "_blank");
  });
}

// -------------------------------------------------------------
// SIDEBAR QUICK ACTIONS & MODALS (+ New Quote, + Add Chemical, + Update Inventory, + Generate Report)
// -------------------------------------------------------------
const sideNewQuoteBtn = document.getElementById("sideNewQuoteBtn");
const sideAddChemicalBtn = document.getElementById("sideAddChemicalBtn");
const sideUpdateInventoryBtn = document.getElementById("sideUpdateInventoryBtn");
const sideGenerateReportBtn = document.getElementById("sideGenerateReportBtn");

// 1. + New Quote Action
if (sideNewQuoteBtn) {
  sideNewQuoteBtn.addEventListener("click", () => {
    closeMobileSidebar();
    switchTab("inquiries");
    openNewRequestModal();
  });
}

// 2. + Add Chemical Action
if (sideAddChemicalBtn) {
  sideAddChemicalBtn.addEventListener("click", () => {
    closeMobileSidebar();
    switchTab("products");
    openProductModal(null);
  });
}

// 3. + Update Inventory Action
const updateInventoryModal = document.getElementById("updateInventoryModal");
const closeUpdateInventoryModal = document.getElementById("closeUpdateInventoryModal");
const cancelUpdateInventoryModal = document.getElementById("cancelUpdateInventoryModal");
const updateInventoryForm = document.getElementById("updateInventoryForm");

function openUpdateInventoryModal() {
  closeMobileSidebar();
  const listWrap = document.getElementById("inventoryDynamicList");
  if (listWrap && productsData.length) {
    listWrap.innerHTML = productsData.map(p => {
      const qty = p.stockQty !== undefined ? p.stockQty : "";
      const unit = p.stockUnit || "Bags";
      const st = (p.stockStatus || "optimal").toLowerCase();
      return `
        <div class="form-row" style="align-items: center; gap: 10px; padding: 10px 12px; background: var(--adm-input-bg); border-radius: 8px; border: 1px solid var(--adm-card-border); margin-bottom: 2px;">
          <div class="form-group flex-2" style="min-width: 160px; margin-bottom: 0;">
            <label style="font-weight: 700; margin-bottom: 2px; font-size: 13px;">${escapeHtml(p.name)}</label>
            <span style="font-size: 11px; color: var(--adm-text-muted);">${escapeHtml(p.category || '')} • ${escapeHtml(p.packaging || '')}</span>
          </div>
          <div class="form-group flex-1" style="min-width: 90px; margin-bottom: 0;">
            <label style="font-size: 11px;">Stock Qty</label>
            <input type="number" class="inv-qty-input" data-id="${p.id}" value="${escapeHtml(qty)}" placeholder="e.g. 100" min="0">
          </div>
          <div class="form-group flex-1" style="min-width: 90px; margin-bottom: 0;">
            <label style="font-size: 11px;">Unit</label>
            <select class="inv-unit-select" data-id="${p.id}">
              <option value="Bags" ${unit === "Bags" ? "selected" : ""}>Bags</option>
              <option value="Drums" ${unit === "Drums" ? "selected" : ""}>Drums</option>
              <option value="Carboys" ${unit === "Carboys" ? "selected" : ""}>Carboys</option>
              <option value="MT" ${unit === "MT" ? "selected" : ""}>MT</option>
              <option value="kg" ${unit === "kg" ? "selected" : ""}>kg</option>
              <option value="Liters" ${unit === "Liters" ? "selected" : ""}>Liters</option>
            </select>
          </div>
          <div class="form-group flex-1" style="min-width: 120px; margin-bottom: 0;">
            <label style="font-size: 11px;">Status</label>
            <select class="inv-status-select" data-id="${p.id}">
              <option value="optimal" ${st === "optimal" ? "selected" : ""}>Optimal</option>
              <option value="adequate" ${st === "adequate" ? "selected" : ""}>Adequate</option>
              <option value="low_stock" ${st === "low_stock" || st === "low stock" ? "selected" : ""}>Low Stock</option>
              <option value="reorder" ${st === "reorder" || st === "reorder alert" ? "selected" : ""}>Reorder Alert</option>
              <option value="out_of_stock" ${st === "out_of_stock" || st === "out of stock" ? "selected" : ""}>Out of Stock</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
  }
  if (updateInventoryModal) updateInventoryModal.style.display = "flex";
}
function closeUpdateInventory() {
  if (updateInventoryModal) updateInventoryModal.style.display = "none";
}
if (sideUpdateInventoryBtn) sideUpdateInventoryBtn.addEventListener("click", openUpdateInventoryModal);
if (closeUpdateInventoryModal) closeUpdateInventoryModal.addEventListener("click", closeUpdateInventory);
if (cancelUpdateInventoryModal) cancelUpdateInventoryModal.addEventListener("click", closeUpdateInventory);

const invAddNewChemicalBtn = document.getElementById("invAddNewChemicalBtn");
if (invAddNewChemicalBtn) {
  invAddNewChemicalBtn.addEventListener("click", () => {
    closeUpdateInventory();
    openProductModal(null);
  });
}

if (updateInventoryForm) {
  updateInventoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById("saveInventoryBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving All Stock Levels...";
    }

    const qtyInputs = updateInventoryForm.querySelectorAll(".inv-qty-input");
    const updatePromises = Array.from(qtyInputs).map(async (input) => {
      const id = input.getAttribute("data-id");
      const qty = input.value.trim();
      const unitEl = updateInventoryForm.querySelector(`.inv-unit-select[data-id="${id}"]`);
      const statusEl = updateInventoryForm.querySelector(`.inv-status-select[data-id="${id}"]`);
      const unit = unitEl ? unitEl.value : "Bags";
      const status = statusEl ? statusEl.value : "optimal";

      return fetchAdmin(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ stockQty: qty, stockUnit: unit, stockStatus: status }),
      });
    });

    await Promise.all(updatePromises);
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save All Stock Levels";
    }
    closeUpdateInventory();
    await loadProducts();
  });
}

function applyInventoryUI() {
  // Inventory is now managed directly inside the Product Catalog
}

// 4. + Generate Report Action
const generateReportModal = document.getElementById("generateReportModal");
const closeGenerateReportModal = document.getElementById("closeGenerateReportModal");
const cancelGenerateReportModal = document.getElementById("cancelGenerateReportModal");
const generateReportForm = document.getElementById("generateReportForm");

function openGenerateReportModal() {
  closeMobileSidebar();
  if (generateReportModal) generateReportModal.style.display = "flex";
}
function closeGenerateReport() {
  if (generateReportModal) generateReportModal.style.display = "none";
}
if (sideGenerateReportBtn) sideGenerateReportBtn.addEventListener("click", openGenerateReportModal);
if (closeGenerateReportModal) closeGenerateReportModal.addEventListener("click", closeGenerateReport);
if (cancelGenerateReportModal) cancelGenerateReportModal.addEventListener("click", closeGenerateReport);

if (generateReportForm) {
  generateReportForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const format = document.getElementById("reportFormat").value;
    const password = getStoredPassword();
    if (format === "csv") {
      window.open(`/api/admin/export?x_pass=${encodeURIComponent(password || "")}`, "_blank");
    } else {
      window.print();
    }
    closeGenerateReport();
  });
}

// Initial Load
if (getStoredPassword()) {
  showAdmin();
  applyInventoryUI();
} else {
  showLogin();
}
