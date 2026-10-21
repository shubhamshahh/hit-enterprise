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

// Auth helper
function getStoredUsername() {
  return sessionStorage.getItem("hitAdminUsername");
}
function getStoredPassword() {
  return sessionStorage.getItem("hitAdminPassword");
}

function getInitialTab() {
  const hash = window.location.hash ? window.location.hash.replace("#", "").trim().toLowerCase() : "";
  const stored = sessionStorage.getItem("hitAdminActiveTab");
  const validTabs = ["overview", "inquiries", "products"];
  if (hash && validTabs.includes(hash)) return hash;
  if (stored && validTabs.includes(stored)) return stored;
  return "overview";
}

function showAdmin() {
  loginScreen.style.display = "none";
  adminScreen.style.display = "flex";
  const initialTab = getInitialTab();
  switchTab(initialTab, false);
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

function openSubMenuGroup(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  const subMenu = group.querySelector(".sidebar-sub-menu");
  const toggleBtn = group.querySelector(".tab-toggle-btn");
  if (subMenu) {
    subMenu.style.display = "block";
    if (toggleBtn) {
      toggleBtn.classList.add("menu-open");
      const chevron = toggleBtn.querySelector(".chevron-icon");
      if (chevron) chevron.style.transform = "rotate(90deg)";
    }
  }
}

function switchTab(tabId, shouldCloseMobile = true) {
  if (!tabId) tabId = "overview";
  activeTab = tabId;

  // Persist current tab in sessionStorage and URL hash
  sessionStorage.setItem("hitAdminActiveTab", tabId);
  if (window.location.hash !== `#${tabId}`) {
    try {
      history.replaceState(null, null, `#${tabId}`);
    } catch (e) {
      window.location.hash = tabId;
    }
  }

  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetBtn) targetBtn.classList.add("active");
  if (targetPane) targetPane.classList.add("active");

  // Open corresponding sub-menus in sidebar
  if (tabId === "inquiries") {
    openSubMenuGroup("menuGroupInquiries");
  } else if (tabId === "products") {
    openSubMenuGroup("menuGroupProducts");
  }

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

window.addEventListener("hashchange", () => {
  const tab = getInitialTab();
  if (tab && tab !== activeTab) {
    switchTab(tab, false);
  }
});

document.getElementById("viewAllInquiriesBtn").addEventListener("click", () => {
  switchTab("inquiries");
  openSubMenuGroup("menuGroupInquiries");
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
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(r.email)}&su=${encodeURIComponent(`Quote Request Update for ${r.chemical} - Hit Enterprise`)}" target="_blank" rel="noopener noreferrer" class="contact-link email" title="Compose Gmail to ${escapeHtml(r.email)}">
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
  
  // Format summary header info with Gmail link if email exists
  const emailHtml = record.email 
    ? ` | <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(record.email)}&su=${encodeURIComponent(`Quote Request Update for ${record.chemical} - Hit Enterprise`)}" target="_blank" rel="noopener noreferrer" style="color: #EA4335; font-weight: 600; text-decoration: underline;" title="Compose in Gmail">${escapeHtml(record.email)}</a>`
    : "";

  replyCustomerSummary.innerHTML = `
    <strong>Customer:</strong> ${escapeHtml(record.name)} ${record.company ? `(${escapeHtml(record.company)})` : ""}<br>
    <strong>Request:</strong> ${escapeHtml(record.chemical)} — ${escapeHtml(record.quantity)} ${escapeHtml(record.unit || "kg")}<br>
    <strong>Contact:</strong> ${escapeHtml(record.phone)}${emailHtml}
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

  // Reply via Email Action (Direct Gmail Web Compose in browser)
  replyEmailBtn.addEventListener("click", async () => {
    const id = replyInquiryId.value;
    const record = inquiriesData.find((r) => String(r.id) === String(id));
    if (!record || !record.email) {
      alert("This customer does not have an email address specified.");
      return;
    }

    const body = replyMessageInput.value;
    const subject = `Quote Request Update for ${record.chemical} - Hit Enterprise`;
    
    // Open Gmail web compose directly in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(record.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");

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

  // Reply via WhatsApp Action (Reuses existing WhatsApp tab and opens chat directly)
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
    
    // Direct WhatsApp chat URL
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const waUrl = isMobile 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(body)}`;

    // Automatically copy message to clipboard so you can also easily paste it into any already open WhatsApp window
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(body).catch(() => {});
    }

    // Use named window target "WhatsAppWeb" so it reuses any open WhatsApp tab rather than opening duplicate tabs
    window.open(waUrl, "WhatsAppWeb");

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
// PRODUCT CATALOG PERSISTENCE & IMAGE OPTIMIZER
// -------------------------------------------------------------
const CATALOG_STORAGE_KEY = "hit_enterprise_catalog_v2";
const CATALOG_BROADCAST_CHANNEL = "hit_catalog_sync";

/**
 * Compresses any user image client-side to crisp, lightweight WebP/JPEG (~30-60KB).
 * Prevents 413 payload errors, memory limits, and ensures permanent storage.
 */
function compressImage(file, options = {}) {
  const maxWidth = options.maxWidth || 800;
  const maxHeight = options.maxHeight || 800;
  const quality = options.quality !== undefined ? options.quality : 0.82;

  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected."));
    if (!file.type || !file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image (JPG, PNG, WebP supported)."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image format."));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Clean white background for transparent PNGs
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl;
        try {
          dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl || !dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
        } catch (_) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function getLocalCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.products || null);
  } catch (_) {
    return null;
  }
}

function saveLocalCatalog(products) {
  if (!Array.isArray(products)) return;
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      products: products,
    }));

    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel(CATALOG_BROADCAST_CHANNEL);
        bc.postMessage({ type: "CATALOG_UPDATED", timestamp: Date.now(), products });
        bc.close();
      } catch (_) {}
    }
  } catch (err) {
    console.warn("[Admin] localStorage write warning:", err.message);
  }
}

// -------------------------------------------------------------
// PRODUCT CATALOG MANAGER
// -------------------------------------------------------------
async function loadProducts() {
  try {
    const res = await fetchAdmin("/api/admin/products");
    let serverProducts = null;
    if (res && res.ok) {
      serverProducts = await res.json();
    }

    const localProducts = getLocalCatalog();

    if (serverProducts && Array.isArray(serverProducts)) {
      // Check if local cache has custom images/edits that the server lost (e.g. Vercel instance restart)
      if (localProducts && Array.isArray(localProducts)) {
        const localImagesCount = localProducts.filter((p) => p.image && p.image.trim()).length;
        const serverImagesCount = serverProducts.filter((p) => p.image && p.image.trim()).length;

        if (localImagesCount > serverImagesCount) {
          console.log(`[Admin] Local catalog has more photos (${localImagesCount}) than server (${serverImagesCount}). Auto-restoring to server...`);
          serverProducts = serverProducts.map((sp) => {
            const lp = localProducts.find((x) => String(x.id) === String(sp.id));
            if (lp && lp.image && lp.image.trim() && (!sp.image || !sp.image.trim())) {
              return { ...sp, image: lp.image };
            }
            return sp;
          });

          // Background auto-sync back to server
          fetchAdmin("/api/admin/products/sync", {
            method: "POST",
            body: JSON.stringify({ products: serverProducts }),
          }).catch((e) => console.warn("Auto-sync failed:", e));
        }
      }

      productsData = serverProducts;
      saveLocalCatalog(productsData);
    } else if (localProducts && localProducts.length) {
      productsData = localProducts;
      showAdminToast("Loaded catalog from offline storage.", "info");
    }

    renderProductsTable(productsData);
    populateRequestChemicalDropdown();
    renderDashboardWidgets(inquiriesData, productsData);
  } catch (err) {
    console.error("loadProducts error:", err);
    const local = getLocalCatalog();
    if (local && local.length) {
      productsData = local;
      renderProductsTable(productsData);
    }
  }
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

function showAdminToast(msg, type = "success") {
  let toast = document.getElementById("adminToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "adminToast";
    document.body.appendChild(toast);
  }

  const isErr = type === "error";
  const isInfo = type === "info";
  const borderCol = isErr ? "#ef4444" : isInfo ? "#38bdf8" : "var(--color-accent, #C89B3C)";
  const icon = isErr
    ? `<svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
    : isInfo
    ? `<svg width="18" height="18" fill="none" stroke="#38bdf8" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/></svg>`
    : `<svg width="18" height="18" fill="none" stroke="#C89B3C" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;

  toast.style.cssText = `position: fixed; bottom: 24px; right: 24px; background: #071019; color: #fff; border: 1px solid ${borderCol}; padding: 12px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease; opacity: 0; transform: translateY(10px);`;
  toast.innerHTML = `${icon} <span>${escapeHtml(msg)}</span>`;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
  }, isErr ? 4500 : 3200);
}

let activeUploadProdId = null;
const quickImageUploadInput = document.getElementById("quickImageUploadInput");

if (quickImageUploadInput) {
  quickImageUploadInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && activeUploadProdId) {
      const targetId = activeUploadProdId;
      try {
        showAdminToast("Compressing & uploading photo...", "info");
        const compressedBase64 = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });

        // Optimistic update locally
        const prod = productsData.find((p) => String(p.id) === String(targetId));
        if (prod) {
          prod.image = compressedBase64;
          saveLocalCatalog(productsData);
          renderProductsTable(productsData);
        }

        const res = await fetchAdmin(`/api/admin/products/${targetId}`, {
          method: "PUT",
          body: JSON.stringify({ image: compressedBase64 }),
        });

        if (!res || !res.ok) {
          let errText = "Server rejected image upload";
          try {
            const errJson = await res.json();
            if (errJson && errJson.error) errText = errJson.error;
          } catch (_) {}
          throw new Error(errText);
        }

        const updatedProd = await res.json();
        const idx = productsData.findIndex((p) => String(p.id) === String(targetId));
        if (idx !== -1) {
          productsData[idx] = { ...productsData[idx], ...updatedProd, image: compressedBase64 };
        }
        saveLocalCatalog(productsData);
        renderProductsTable(productsData);
        showAdminToast("Product photo updated and saved successfully!", "success");
      } catch (err) {
        console.error("Failed to upload image:", err);
        showAdminToast("Failed to upload image: " + err.message, "error");
        loadProducts();
      }
    }
    quickImageUploadInput.value = "";
  });
}

function triggerQuickImageUpload(productId) {
  activeUploadProdId = productId;
  if (quickImageUploadInput) {
    quickImageUploadInput.click();
  }
}

function openImageViewerModal(id, name, imgSrc) {
  const modal = document.getElementById("imageViewerModal");
  const title = document.getElementById("imageViewerTitle");
  const img = document.getElementById("imageViewerImg");
  const prodIdInput = document.getElementById("imageViewerProdId");
  if (!modal || !img) return;

  if (title) title.textContent = `${name || "Chemical"} - Photo Preview`;
  img.src = imgSrc || "";
  if (prodIdInput) prodIdInput.value = id || "";
  modal.style.display = "flex";
}

async function deleteProductPhoto(id, name) {
  if (!id) return;
  if (confirm(`Remove photo for "${name || "this chemical"}"?`)) {
    try {
      showAdminToast("Removing photo...", "info");
      const prod = productsData.find((p) => String(p.id) === String(id));
      if (prod) {
        prod.image = "";
        saveLocalCatalog(productsData);
        renderProductsTable(productsData);
      }

      const res = await fetchAdmin(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ image: "" }),
      });

      if (!res || !res.ok) {
        throw new Error("Server rejected photo removal");
      }

      const viewerModal = document.getElementById("imageViewerModal");
      if (viewerModal) viewerModal.style.display = "none";
      await loadProducts();
      showAdminToast("Photo removed successfully!", "success");
    } catch (err) {
      showAdminToast("Failed to remove photo: " + err.message, "error");
      loadProducts();
    }
  }
}

// Image Viewer Modal Listeners
const imageViewerModal = document.getElementById("imageViewerModal");
const closeImageViewerModal = document.getElementById("closeImageViewerModal");
const imageViewerCloseBtn = document.getElementById("imageViewerCloseBtn");
const imageViewerChangeBtn = document.getElementById("imageViewerChangeBtn");
const imageViewerDeleteBtn = document.getElementById("imageViewerDeleteBtn");

if (closeImageViewerModal) closeImageViewerModal.addEventListener("click", () => (imageViewerModal.style.display = "none"));
if (imageViewerCloseBtn) imageViewerCloseBtn.addEventListener("click", () => (imageViewerModal.style.display = "none"));

if (imageViewerChangeBtn) {
  imageViewerChangeBtn.addEventListener("click", () => {
    const id = document.getElementById("imageViewerProdId").value;
    if (imageViewerModal) imageViewerModal.style.display = "none";
    if (id) triggerQuickImageUpload(id);
  });
}

if (imageViewerDeleteBtn) {
  imageViewerDeleteBtn.addEventListener("click", () => {
    const id = document.getElementById("imageViewerProdId").value;
    const prod = productsData.find((p) => String(p.id) === String(id));
    deleteProductPhoto(id, prod ? prod.name : "");
  });
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
            <th style="width: 60px;">Photo</th>
            <th>Chemical Name</th>
            <th>Category</th>
            <th>Inventory Stock</th>
            <th>Photo Actions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p) => {
            const hasImg = p.image && p.image.trim();
            return `
            <tr>
              <td>
                <div class="${hasImg ? 'prod-thumb-view' : 'prod-thumb-upload'}" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-img="${escapeHtml(p.image || '')}" title="${hasImg ? 'Click to view full photo' : 'Click to upload photo'}" style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: var(--adm-input-bg); border: 1px solid var(--adm-card-border); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
                  ${
                    hasImg
                      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                         <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="display:none; color: var(--adm-text-muted);"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                      : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color: var(--adm-text-muted);"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                  }
                </div>
              </td>
              <td><strong style="font-size: 14.5px;">${escapeHtml(p.name)}</strong></td>
              <td><span class="category-pill">${escapeHtml(p.category)}</span></td>
              <td>${formatProductStock(p)}</td>
              <td>
                <div style="display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  ${
                    hasImg
                      ? `
                        <button type="button" class="btn btn-secondary btn-view-photo" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-img="${escapeHtml(p.image)}" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; font-size: 11.5px; font-weight: 600;">
                          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          View
                        </button>
                        <button type="button" class="btn btn-secondary btn-quick-upload-img" data-id="${p.id}" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; font-size: 11.5px; font-weight: 600; border-color: rgba(200,155,60,0.35);">
                          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                          Change
                        </button>
                        <button type="button" class="btn btn-action-delete btn-delete-photo" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-tooltip="Remove / Delete Photo">
                          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      `
                      : `
                        <button type="button" class="btn btn-secondary btn-quick-upload-img" data-id="${p.id}" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; border-color: rgba(200,155,60,0.35); color: var(--adm-text-main); white-space: nowrap;">
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                          + Upload Photo
                        </button>
                      `
                  }
                </div>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-action-edit btn-edit-prod" data-id="${p.id}" data-tooltip="Edit Chemical Details">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="btn btn-action-delete btn-del-prod" data-id="${p.id}" data-tooltip="Delete Product">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `;
          }).join("")}
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
        const hasImg = p.image && p.image.trim();

        return `
          <div class="mobile-data-card">
            <div class="mobile-card-header" style="display: flex; align-items: center; gap: 12px;">
              <div class="${hasImg ? 'prod-thumb-view' : 'prod-thumb-upload'}" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-img="${escapeHtml(p.image || '')}" title="${hasImg ? 'Click to view full photo' : 'Click to upload photo'}" style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: var(--adm-input-bg); border: 1px solid var(--adm-card-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;">
                ${
                  hasImg
                    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color: var(--adm-text-muted);"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                }
              </div>
              <div style="flex: 1;">
                <strong style="font-size: 14.5px;">${escapeHtml(p.name)}</strong>
              </div>
              <span class="category-pill">${escapeHtml(p.category)}</span>
            </div>
            <div class="mobile-card-body" style="padding-top: 8px;">
              <div class="mobile-card-row">
                <span class="lbl">Inventory Stock:</span>
                <span class="val" style="display:flex; align-items:center; gap:6px;">
                  <strong class="font-mono">${escapeHtml(p.stockQty || '--')} ${escapeHtml(p.stockUnit || '')}</strong>
                  <span class="stock-status-pill ${badgeClass}">${statusLabel}</span>
                </span>
              </div>
            </div>
            <div class="mobile-card-footer" style="display: flex; gap: 8px; align-items: center; justify-content: space-between; width: 100%; margin-top: 10px; flex-wrap: wrap;">
              <div style="display: flex; gap: 6px; align-items: center;">
                ${
                  hasImg
                    ? `
                      <button type="button" class="btn btn-secondary btn-view-photo" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-img="${escapeHtml(p.image)}" style="display: inline-flex; align-items: center; gap: 4px; padding: 5px 8px; font-size: 11.5px;">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        View
                      </button>
                      <button type="button" class="btn btn-secondary btn-quick-upload-img" data-id="${p.id}" style="display: inline-flex; align-items: center; gap: 4px; padding: 5px 8px; font-size: 11.5px; border-color: rgba(200,155,60,0.35);">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Change
                      </button>
                      <button type="button" class="btn btn-action-delete btn-delete-photo" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-tooltip="Remove Photo">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    `
                    : `
                      <button type="button" class="btn btn-secondary btn-quick-upload-img" data-id="${p.id}" style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 12px; font-weight: 600; border-color: rgba(200,155,60,0.35); color: var(--adm-text-main);">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        + Upload Photo
                      </button>
                    `
                }
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-action-edit btn-edit-prod" data-id="${p.id}" data-tooltip="Edit Product">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button class="btn btn-action-delete btn-del-prod" data-id="${p.id}" data-tooltip="Delete Product">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
  wrap.innerHTML = html;

  // Bind actions
  const bindEvents = (element) => {
    element.querySelectorAll(".btn-view-photo, .prod-thumb-view").forEach((b) => {
      b.addEventListener("click", () => {
        openImageViewerModal(b.getAttribute("data-id"), b.getAttribute("data-name"), b.getAttribute("data-img"));
      });
    });

    element.querySelectorAll(".btn-delete-photo").forEach((b) => {
      b.addEventListener("click", () => {
        deleteProductPhoto(b.getAttribute("data-id"), b.getAttribute("data-name"));
      });
    });

    element.querySelectorAll(".btn-quick-upload-img, .prod-thumb-upload").forEach((b) => {
      b.addEventListener("click", () => triggerQuickImageUpload(b.getAttribute("data-id")));
    });

    element.querySelectorAll(".btn-edit-prod").forEach((b) => {
      b.addEventListener("click", () => openProductModal(b.getAttribute("data-id")));
    });

    element.querySelectorAll(".btn-del-prod").forEach((b) => {
      b.addEventListener("click", async () => {
        const id = b.getAttribute("data-id");
        if (confirm("Delete this product from catalog?")) {
          await fetchAdmin(`/api/admin/products/${id}`, { method: "DELETE" });
          loadProducts();
          showAdminToast("Product deleted from catalogue.");
        }
      });
    });
  };

  bindEvents(wrap);
}

// Product Modal Elements
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const prodImageFile = document.getElementById("prodImageFile");
const prodImageUrl = document.getElementById("prodImageUrl");
const prodImagePreview = document.getElementById("prodImagePreview");
const prodImagePlaceholderIcon = document.getElementById("prodImagePlaceholderIcon");
const prodImageFileName = document.getElementById("prodImageFileName");
const removeProdImageBtn = document.getElementById("removeProdImageBtn");

if (removeProdImageBtn) {
  removeProdImageBtn.addEventListener("click", () => {
    if (prodImageUrl) prodImageUrl.value = "";
    if (prodImageFile) prodImageFile.value = "";
    if (prodImageFileName) prodImageFileName.textContent = "Photo removed (click Save)";
    if (prodImagePreview && prodImagePlaceholderIcon) {
      prodImagePreview.src = "";
      prodImagePreview.style.display = "none";
      prodImagePlaceholderIcon.style.display = "block";
    }
    removeProdImageBtn.style.display = "none";
  });
}

if (productModal) {
  const addProdBtn = document.getElementById("addProductBtn");
  const closeProdBtn = document.getElementById("closeProductModal");
  const cancelProdBtn = document.getElementById("cancelProductModal");
  if (addProdBtn) addProdBtn.addEventListener("click", () => openProductModal(null));
  if (closeProdBtn) closeProdBtn.addEventListener("click", () => (productModal.style.display = "none"));
  if (cancelProdBtn) cancelProdBtn.addEventListener("click", () => (productModal.style.display = "none"));
}

// Modal Backdrop Dismiss
[notesModal, replyModal, newRequestModal, productModal, imageViewerModal].forEach((m) => {
  if (m) {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.style.display = "none";
    });
  }
});

function openProductModal(id) {
  document.getElementById("modalTitle").textContent = id ? "Edit Chemical Product" : "Add Chemical Product";
  document.getElementById("prodId").value = id || "";

  if (id) {
    const prod = productsData.find((p) => String(p.id) === String(id));
    if (prod) {
      document.getElementById("prodName").value = prod.name || "";
      document.getElementById("prodCategory").value = prod.category || "";
      document.getElementById("prodStockQty").value = prod.stockQty !== undefined ? prod.stockQty : "";
      document.getElementById("prodStockUnit").value = prod.stockUnit || "Bags";
      document.getElementById("prodStockStatus").value = prod.stockStatus || "optimal";
      
      const img = prod.image || "";
      if (prodImageUrl) prodImageUrl.value = img;
      if (prodImageFileName) prodImageFileName.textContent = img ? "Image configured" : "No file selected";
      if (prodImageFile) prodImageFile.value = "";
      if (removeProdImageBtn) removeProdImageBtn.style.display = img ? "inline-flex" : "none";
      if (prodImagePreview && prodImagePlaceholderIcon) {
        if (img) {
          prodImagePreview.src = img;
          prodImagePreview.style.display = "block";
          prodImagePlaceholderIcon.style.display = "none";
        } else {
          prodImagePreview.src = "";
          prodImagePreview.style.display = "none";
          prodImagePlaceholderIcon.style.display = "block";
        }
      }
    }
  } else {
    productForm.reset();
    if (prodImageUrl) prodImageUrl.value = "";
    if (prodImageFileName) prodImageFileName.textContent = "No file selected";
    if (removeProdImageBtn) removeProdImageBtn.style.display = "none";
    if (prodImagePreview && prodImagePlaceholderIcon) {
      prodImagePreview.src = "";
      prodImagePreview.style.display = "none";
      prodImagePlaceholderIcon.style.display = "block";
    }
  }
  productModal.style.display = "flex";
}

// Image upload file listener in product modal
if (prodImageFile) {
  prodImageFile.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (prodImageFileName) prodImageFileName.textContent = file.name + " (optimizing...)";
      if (removeProdImageBtn) removeProdImageBtn.style.display = "inline-flex";
      try {
        const compressedBase64 = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
        if (prodImageUrl) prodImageUrl.value = compressedBase64;
        if (prodImageFileName) prodImageFileName.textContent = file.name + " (optimized)";
        if (prodImagePreview && prodImagePlaceholderIcon) {
          prodImagePreview.src = compressedBase64;
          prodImagePreview.style.display = "block";
          prodImagePlaceholderIcon.style.display = "none";
        }
      } catch (err) {
        alert("Image optimization failed: " + err.message);
        if (prodImageFileName) prodImageFileName.textContent = "Error optimizing file";
      }
    }
  });
}

if (prodImageUrl) {
  prodImageUrl.addEventListener("input", () => {
    const url = prodImageUrl.value.trim();
    if (removeProdImageBtn) removeProdImageBtn.style.display = url ? "inline-flex" : "none";
    if (prodImagePreview && prodImagePlaceholderIcon) {
      if (url) {
        prodImagePreview.src = url;
        prodImagePreview.style.display = "block";
        prodImagePlaceholderIcon.style.display = "none";
      } else {
        prodImagePreview.src = "";
        prodImagePreview.style.display = "none";
        prodImagePlaceholderIcon.style.display = "block";
      }
    }
  });
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("prodId").value;
    const saveBtn = productForm.querySelector('button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    try {
      let imageVal = prodImageUrl ? prodImageUrl.value.trim() : "";

      // If user selected a new file that wasn't compressed yet
      if (prodImageFile && prodImageFile.files && prodImageFile.files[0] && (!imageVal || !imageVal.startsWith("data:image/"))) {
        imageVal = await compressImage(prodImageFile.files[0], { maxWidth: 800, maxHeight: 800, quality: 0.82 });
      }

      // If user is editing and didn't touch the image and didn't remove it, preserve existing image
      if (id && !imageVal && (!removeProdImageBtn || removeProdImageBtn.style.display === "inline-flex")) {
        const existing = productsData.find((p) => String(p.id) === String(id));
        if (existing && existing.image) {
          imageVal = existing.image;
        }
      }

      const payload = {
        name: document.getElementById("prodName").value.trim(),
        category: document.getElementById("prodCategory").value.trim(),
        stockQty: document.getElementById("prodStockQty").value.trim(),
        stockUnit: document.getElementById("prodStockUnit").value,
        stockStatus: document.getElementById("prodStockStatus").value,
        image: imageVal,
      };

      if (!payload.name || !payload.category) {
        throw new Error("Product name and category are required.");
      }

      let res;
      if (id) {
        res = await fetchAdmin(`/api/admin/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchAdmin("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!res || !res.ok) {
        let errText = "Server rejected product save";
        try {
          const errJson = await res.json();
          if (errJson && errJson.error) errText = errJson.error;
        } catch (_) {}
        throw new Error(errText);
      }

      const savedProd = await res.json();
      if (id) {
        const idx = productsData.findIndex((p) => String(p.id) === String(id));
        if (idx !== -1) productsData[idx] = { ...productsData[idx], ...savedProd };
      } else if (savedProd) {
        productsData.push(savedProd);
      }
      saveLocalCatalog(productsData);

      showAdminToast(id ? "Product updated successfully!" : "Product added to catalogue successfully!", "success");
      productModal.style.display = "none";
      await loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
      showAdminToast(err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = id ? "Save Changes" : "Add Product";
      }
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
    const updates = Array.from(qtyInputs).map((input) => {
      const id = input.getAttribute("data-id");
      const qty = input.value.trim();
      const unitEl = updateInventoryForm.querySelector(`.inv-unit-select[data-id="${id}"]`);
      const statusEl = updateInventoryForm.querySelector(`.inv-status-select[data-id="${id}"]`);
      return {
        id,
        stockQty: qty,
        stockUnit: unitEl ? unitEl.value : "Bags",
        stockStatus: statusEl ? statusEl.value : "optimal",
      };
    });

    try {
      showAdminToast("Saving inventory stock levels...", "info");
      const res = await fetchAdmin("/api/admin/products/bulk-inventory", {
        method: "POST",
        body: JSON.stringify({ updates }),
      });

      if (!res || !res.ok) {
        // Fallback to sequential updates if needed
        for (const u of updates) {
          await fetchAdmin(`/api/admin/products/${u.id}`, {
            method: "PUT",
            body: JSON.stringify({ stockQty: u.stockQty, stockUnit: u.stockUnit, stockStatus: u.stockStatus }),
          });
        }
      }

      // Update in memory and local storage
      updates.forEach((u) => {
        const prod = productsData.find((p) => String(p.id) === String(u.id));
        if (prod) {
          prod.stockQty = u.stockQty;
          prod.stockUnit = u.stockUnit;
          prod.stockStatus = u.stockStatus;
        }
      });
      saveLocalCatalog(productsData);

      showAdminToast("All inventory levels saved successfully!", "success");
      closeUpdateInventory();
      await loadProducts();
    } catch (err) {
      console.error("Inventory update error:", err);
      showAdminToast("Failed to save inventory: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save All Stock Levels";
      }
    }
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
