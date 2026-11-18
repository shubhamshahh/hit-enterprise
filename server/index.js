const fs = require("fs");
const path = require("path");

// Load .env files automatically (.env, .env.local, .env.example)
function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valParts] = trimmed.split("=");
        const val = valParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && (!process.env[key.trim()] || !process.env[key.trim()].trim())) {
          process.env[key.trim()] = val;
        }
      }
    });
  }
}
loadEnv(path.join(__dirname, "..", ".env"));
loadEnv(path.join(__dirname, "..", ".env.local"));
loadEnv(path.join(__dirname, "..", ".env.example"));

const express = require("express");
const {
  addInquiry,
  listInquiries,
  updateInquiry,
  deleteInquiry,
  getStats,
  exportInquiriesCSV,
  readAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateInventory,
  syncAllProducts,
  getDatabaseStatus,
  syncLocalToSupabase,
  clearAllImages,
} = require("./db");
const { sendNotification } = require("./notify");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Explicit page routes for Render/Linux deployment compatibility
app.get(["/admin", "/admin.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Simple in-memory rate limiter for quote submissions & admin logins
const rateLimitMap = new Map();
function rateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "global";
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }

    rateLimitMap.set(ip, clientData);

    if (clientData.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
    }
    next();
  };
}

const REQUIRED_FIELDS = ["name", "phone", "chemical", "quantity"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// Public: Chemical Request / Quote submission
app.post("/api/inquiries", rateLimiter(5, 60 * 1000), async (req, res) => {
  const body = req.body || {};

  const missing = REQUIRED_FIELDS.filter((field) => !String(body[field] || "").trim());
  if (missing.length) {
    return res.status(400).json({
      error: `Missing required field(s): ${missing.join(", ")}`,
    });
  }

  if (body.email && !isValidEmail(body.email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  try {
    const record = await addInquiry({
      name: String(body.name).trim(),
      company: String(body.company || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone).trim(),
      chemical: String(body.chemical).trim(),
      quantity: String(body.quantity).trim(),
      unit: String(body.unit || "kg").trim(),
      industry: String(body.industry || "").trim(),
      message: String(body.message || "").trim(),
      source: String(body.source || "form").trim(),
    });

    // Direct Instant Admin Notification (WhatsApp/SMS/Telegram/Email)
    sendNotification(record);

    return res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    return res.status(500).json({ error: "Failed to submit request. Please try again." });
  }
});

// Public: Get product catalog
app.get("/api/products", async (req, res) => {
  try {
    const all = await readAllProducts();
    const products = (all || []).filter((p) => p.status !== "inactive");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to load product catalog." });
  }
});

// -------------------------------------------------------------
// ADMIN AUTH MIDDLEWARE
// -------------------------------------------------------------

function requireAdmin(req, res, next) {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin password." });
  }
  next();
}

app.post("/api/admin/login", rateLimiter(10, 60 * 1000), (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin username or password." });
  }
  res.json({ ok: true });
});

// -------------------------------------------------------------
// ADMIN API ENDPOINTS
// -------------------------------------------------------------

// Database Status (Supabase Cloud vs Local JSON)
app.get("/api/admin/database-status", requireAdmin, (req, res) => {
  res.json(getDatabaseStatus());
});

// One-Click Sync Local Data to Supabase (Admin)
app.post("/api/admin/sync-to-supabase", requireAdmin, async (req, res) => {
  try {
    const result = await syncLocalToSupabase();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Sync to Supabase error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get KPI Stats
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to load stats." });
  }
});

// List Inquiries (with Search & Filter)
app.get("/api/admin/inquiries", requireAdmin, async (req, res) => {
  try {
    const { search, status, source } = req.query;
    const data = await listInquiries({ search, status, source });
    res.json(data);
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    res.status(500).json({ error: "Failed to load inquiries." });
  }
});

// Update Inquiry (Status or Admin Notes)
app.patch("/api/admin/inquiries/:id", requireAdmin, async (req, res) => {
  const { status, adminNotes } = req.body || {};

  const updates = {};
  if (status !== undefined) {
    const allowed = ["new", "contacted", "quoted", "closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
    }
    updates.status = status;
  }

  if (adminNotes !== undefined) {
    updates.adminNotes = String(adminNotes).trim();
  }

  try {
    const updated = await updateInquiry(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: "Inquiry not found." });
    res.json(updated);
  } catch (err) {
    console.error("Error updating inquiry:", err);
    res.status(500).json({ error: "Failed to update inquiry." });
  }
});

// Delete Inquiry
app.delete("/api/admin/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await deleteInquiry(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Inquiry not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting inquiry:", err);
    res.status(500).json({ error: "Failed to delete inquiry." });
  }
});

// Export Inquiries as CSV
app.get("/api/admin/export", requireAdmin, async (req, res) => {
  try {
    const csv = await exportInquiriesCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=Hit_Enterprise_Inquiries_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Error exporting inquiries:", err);
    res.status(500).json({ error: "Failed to export CSV." });
  }
});

// Product Catalog CRUD (Admin)
app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await readAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching admin products:", err);
    res.status(500).json({ error: "Failed to load products." });
  }
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.category) {
    return res.status(400).json({ error: "Product name and category are required." });
  }
  try {
    const product = await addProduct(body);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to create product." });
  }
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "Product not found." });
    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product." });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// Bulk Update Inventory Stock (Admin)
app.post("/api/admin/products/bulk-inventory", requireAdmin, async (req, res) => {
  const updates = (req.body && req.body.updates) || [];
  if (!Array.isArray(updates) || !updates.length) {
    return res.status(400).json({ error: "Missing or invalid 'updates' array." });
  }
  try {
    const updated = await bulkUpdateInventory(updates);
    res.json({ ok: true, count: updated.length, products: updated });
  } catch (err) {
    console.error("Error in bulk inventory update:", err);
    res.status(500).json({ error: "Failed to update inventory." });
  }
});

// Full Catalog Sync / Restore (Admin)
app.post("/api/admin/products/sync", requireAdmin, async (req, res) => {
  const products = (req.body && req.body.products) || [];
  if (!Array.isArray(products) || !products.length) {
    return res.status(400).json({ error: "Missing or invalid 'products' array." });
  }
  try {
    const synced = await syncAllProducts(products);
    res.json({ ok: true, count: synced.length, products: synced });
  } catch (err) {
    console.error("Error syncing products:", err);
    res.status(500).json({ error: "Failed to sync products." });
  }
});

// Clear All Product Images across Supabase and storage
app.post("/api/admin/products/clear-all-images", requireAdmin, async (req, res) => {
  try {
    const result = await clearAllImages();
    res.json(result);
  } catch (err) {
    console.error("Error clearing images:", err);
    res.status(500).json({ error: "Failed to clear images." });
  }
});

// Test Notification Endpoint
app.post("/api/admin/test-notify", requireAdmin, async (req, res) => {
  const testRecord = {
    id: 9999,
    name: "Test Customer",
    company: "Test Enterprise",
    phone: "+919876543210",
    email: "test@example.com",
    chemical: "Hydrochloric Acid 37%",
    quantity: "1000",
    unit: "Liters",
    industry: "Pharmaceutical",
    message: "This is a test notification from Hit Enterprise Admin Dashboard.",
    createdAt: new Date().toISOString(),
  };

  try {
    await sendNotification(testRecord);
    res.json({ ok: true, message: "Test notification sent! Check your phone/email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, database: getDatabaseStatus() }));
app.get("/api", (req, res) => res.json({ ok: true, name: "Hit Enterprise API", database: getDatabaseStatus() }));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    const dbStatus = getDatabaseStatus();
    console.log(`Hit Enterprise server running on http://localhost:${PORT}`);
    console.log(`[Database] Provider: ${dbStatus.provider.toUpperCase()} (${dbStatus.isSupabaseConfigured ? 'Supabase Cloud Connected' : 'Local JSON Mode'})`);
  });
}

module.exports = app;
