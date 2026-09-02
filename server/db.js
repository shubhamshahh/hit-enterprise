const fs = require("fs");
const path = require("path");

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? path.join("/tmp", "hit_data") : path.join(__dirname, "..", "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

const DEFAULT_PRODUCTS = [
  { id: 1, name: "EDTA", cas: "60-00-4", grade: "Technical Grade 99%", category: "Chelating Agents", purity: "99%", packaging: "25 kg Bag", stockQty: "180", stockUnit: "Bags", stockStatus: "optimal", applications: "Chelating agent used in water treatment, cleaning formulations and metal ion sequestration.", status: "active" },
  { id: 2, name: "Oxalic Acid", cas: "144-62-7", grade: "Industrial Grade 99.6%", category: "Acids", purity: "99.6%", packaging: "25 kg Bag", stockQty: "230", stockUnit: "Bags", stockStatus: "optimal", applications: "Bleaching, rust removal and metal surface cleaning agent.", status: "active" },
  { id: 3, name: "Caustic Lye (Sodium Hydroxide)", cas: "1310-73-2", grade: "Rayon / Tech Grade", category: "Alkalis", purity: "Liquid 48% / Flakes 98%", packaging: "Carboy / 50kg Bag", stockQty: "120", stockUnit: "Bags", stockStatus: "adequate", applications: "Sodium hydroxide for soap-making, textile processing and pH correction.", status: "active" },
  { id: 4, name: "Glycerine", cas: "56-81-5", grade: "Pharma / Tech Grade 99.5%", category: "Solvents", purity: "99.5%", packaging: "250 kg Drum", stockQty: "95", stockUnit: "Drums", stockStatus: "optimal", applications: "Humectant and industrial solvent for pharma, cosmetics and food-grade formulations.", status: "active" },
  { id: 5, name: "Morpholine", cas: "110-91-8", grade: "Industrial Grade 99%", category: "Specialty Chemicals", purity: "99%", packaging: "200 kg Drum", stockQty: "40", stockUnit: "Drums", stockStatus: "adequate", applications: "Corrosion inhibitor and chemical intermediate for rubber, dye and pharma industries.", status: "active" },
  { id: 6, name: "Potassium Carbonate / Hydroxide", cas: "584-08-7 / 1310-58-3", grade: "Tech Grade 99% / 90%", category: "Alkalis", purity: "99% / 90%", packaging: "25 kg Bag", stockQty: "150", stockUnit: "Bags", stockStatus: "optimal", applications: "Alkali used in glass, soap and general chemical manufacturing.", status: "active" },
  { id: 7, name: "Citric Acid", cas: "77-92-9", grade: "Anhydrous 99.5%", category: "Acids", purity: "99.5%", packaging: "25 kg Bag", stockQty: "210", stockUnit: "Bags", stockStatus: "optimal", applications: "Acidulant and chelating agent for food, pharma and cleaning applications.", status: "active" },
  { id: 8, name: "Sulphamic Acid", cas: "5329-14-6", grade: "Descaling Grade 99.5%", category: "Acids", purity: "99.5%", packaging: "25 kg Bag", stockQty: "110", stockUnit: "Bags", stockStatus: "adequate", applications: "Descaling and cleaning acid for industrial and domestic use.", status: "active" },
  { id: 9, name: "Zinc Dust", cas: "7440-66-6", grade: "Industrial Grade 98%", category: "Inorganics", purity: "98%", packaging: "25 kg Bag", stockQty: "75", stockUnit: "Bags", stockStatus: "adequate", applications: "Reducing agent for dye, paint and battery manufacturing.", status: "active" },
  { id: 10, name: "Hydrochloric Acid (HCl)", cas: "7647-01-0", grade: "Industrial Grade 30-35%", category: "Acids", purity: "30% - 35%", packaging: "30L Carboy / ISO Tanker", stockQty: "450", stockUnit: "Carboys", stockStatus: "optimal", applications: "Industrial-grade HCl for pH control, descaling and textile processing.", status: "active" },
  { id: 11, name: "Lime (Powder / Lumps)", cas: "1305-78-8", grade: "High Calcium Oxide 90%", category: "Alkalis", purity: "90% CaO", packaging: "50 kg Bag", stockQty: "320", stockUnit: "Bags", stockStatus: "optimal", applications: "Calcium oxide for water treatment, construction and effluent neutralization.", status: "active" },
  { id: 12, name: "SMBS (Sodium Metabisulfite)", cas: "7681-57-4", grade: "Tech Grade 97%", category: "Salts", purity: "97%", packaging: "25 / 50 kg Bag", stockQty: "80", stockUnit: "Bags", stockStatus: "low_stock", applications: "Reducing and bleaching agent for water treatment and textile dyeing.", status: "active" },
  { id: 14, name: "Toluene", cas: "108-88-3", grade: "Industrial Grade 99.5%", category: "Solvents", purity: "99.5%", packaging: "200 kg Drum", stockQty: "60", stockUnit: "Drums", stockStatus: "reorder", applications: "Industrial solvent for paints, coatings and adhesive formulations.", status: "active" },
  { id: 15, name: "Hydrogen Peroxide (H₂O₂ 50%)", cas: "7722-84-1", grade: "Technical Grade 50%", category: "Oxidizing Agents", purity: "50%", packaging: "30 kg Carboy / 250 kg Drum", stockQty: "60", stockUnit: "Drums", stockStatus: "reorder", applications: "Bleaching agent for textiles, paper, effluent treatment and sanitization.", status: "active" },
  { id: 16, name: "Sodium Hypochlorite (10-12%)", cas: "7681-52-9", grade: "Commercial Grade 10-12%", category: "Disinfectants", purity: "10% - 12%", packaging: "35 kg Carboy / Tanker", stockQty: "140", stockUnit: "Carboys", stockStatus: "optimal", applications: "Water disinfection, industrial bleaching and municipal water treatment.", status: "active" },
  { id: 17, name: "Sulfuric Acid (98%)", cas: "7664-93-9", grade: "Commercial Grade 98%", category: "Acids", purity: "98%", packaging: "35 kg Carboy / Tanker", stockQty: "200", stockUnit: "Carboys", stockStatus: "optimal", applications: "Fertilizer production, mineral processing, oil refining and wastewater treatment.", status: "active" },
  { id: 18, name: "Acetic Acid (Glacial 99.8%)", cas: "64-19-7", grade: "Glacial 99.8%", category: "Acids", purity: "99.8%", packaging: "30 kg Carboy / 200 kg Drum", stockQty: "85", stockUnit: "Drums", stockStatus: "adequate", applications: "Textile dyeing, chemical synthesis, esters and acetate manufacturing.", status: "active" },
  { id: 19, name: "Soda Ash (Sodium Carbonate)", cas: "497-19-8", grade: "Dense / Light 99.2%", category: "Alkalis", purity: "99.2%", packaging: "50 kg Bag", stockQty: "190", stockUnit: "Bags", stockStatus: "optimal", applications: "Glass manufacturing, soaps & detergents, effluent treatment and metallurgy.", status: "active" },
  { id: 20, name: "Phosphoric Acid (85%)", cas: "7664-38-2", grade: "Technical Grade 85%", category: "Acids", purity: "85%", packaging: "35 kg Carboy / 280 kg Drum", stockQty: "70", stockUnit: "Carboys", stockStatus: "adequate", applications: "Rust inhibitor, phosphate fertilizers, food additive and water treatment.", status: "active" }
];

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  
  if (!fs.existsSync(INQUIRIES_FILE)) {
    const seedInquiries = path.join(__dirname, "..", "data", "inquiries.json");
    if (fs.existsSync(seedInquiries)) {
      try {
        fs.copyFileSync(seedInquiries, INQUIRIES_FILE);
      } catch (e) {
        fs.writeFileSync(INQUIRIES_FILE, "[]", "utf-8");
      }
    } else {
      fs.writeFileSync(INQUIRIES_FILE, "[]", "utf-8");
    }
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    const seedProducts = path.join(__dirname, "..", "data", "products.json");
    if (fs.existsSync(seedProducts)) {
      try {
        fs.copyFileSync(seedProducts, PRODUCTS_FILE);
      } catch (e) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
      }
    } else {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
    }
  }
}

// Read JSON files safely
function readJSON(file, fallback = []) {
  ensureStore();
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error(`Failed to read ${file}:`, err.message);
    return fallback;
  }
}

function writeJSON(file, data) {
  ensureStore();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// INQUIRIES
function readAllInquiries() {
  return readJSON(INQUIRIES_FILE, []);
}

function writeAllInquiries(records) {
  writeJSON(INQUIRIES_FILE, records);
}

function addInquiry(entry) {
  const records = readAllInquiries();
  const nextId = records.length ? Math.max(...records.map((r) => r.id || 0)) + 1 : 1001;
  const record = {
    id: nextId,
    status: "new", // new, contacted, quoted, closed
    source: "form", // form, email, whatsapp
    adminNotes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...entry,
  };
  records.push(record);
  writeAllInquiries(records);
  return record;
}

function listInquiries({ search = "", status = "all", source = "all" } = {}) {
  let records = readAllInquiries();

  if (status && status !== "all") {
    records = records.filter((r) => r.status === status);
  }

  if (source && source !== "all") {
    records = records.filter((r) => r.source === source);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    records = records.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.chemical && r.chemical.toLowerCase().includes(q)) ||
        (r.industry && r.industry.toLowerCase().includes(q)) ||
        (r.message && r.message.toLowerCase().includes(q))
    );
  }

  return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateInquiry(id, updates) {
  const records = readAllInquiries();
  const idx = records.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return null;

  records[idx] = {
    ...records[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeAllInquiries(records);
  return records[idx];
}

function deleteInquiry(id) {
  const records = readAllInquiries();
  const filtered = records.filter((r) => String(r.id) !== String(id));
  if (filtered.length === records.length) return false;
  writeAllInquiries(filtered);
  return true;
}

// DASHBOARD STATS
function getStats() {
  const records = readAllInquiries();
  const total = records.length;
  const newCount = records.filter((r) => r.status === "new").length;
  const contactedCount = records.filter((r) => r.status === "contacted").length;
  const quotedCount = records.filter((r) => r.status === "quoted").length;
  const closedCount = records.filter((r) => r.status === "closed").length;

  // Calculate top requested chemical
  const counts = {};
  records.forEach((r) => {
    if (r.chemical) {
      const chem = r.chemical.trim();
      counts[chem] = (counts[chem] || 0) + 1;
    }
  });

  let topChemical = "N/A";
  let maxCount = 0;
  Object.entries(counts).forEach(([chem, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      topChemical = `${chem} (${cnt})`;
    }
  });

  return {
    total,
    newCount,
    contactedCount,
    quotedCount,
    closedCount,
    topChemical,
    productsCount: readAllProducts().length,
  };
}

// CSV EXPORT
function exportInquiriesCSV() {
  const records = listInquiries();
  const headers = ["ID", "Status", "Date", "Customer Name", "Company", "Phone", "Email", "Chemical", "Quantity", "Unit", "Industry", "Notes", "Admin Notes"];
  
  const rows = records.map((r) => [
    r.id,
    r.status,
    new Date(r.createdAt).toLocaleString("en-IN"),
    `"${(r.name || "").replace(/"/g, '""')}"`,
    `"${(r.company || "").replace(/"/g, '""')}"`,
    `"${(r.phone || "").replace(/"/g, '""')}"`,
    `"${(r.email || "").replace(/"/g, '""')}"`,
    `"${(r.chemical || "").replace(/"/g, '""')}"`,
    `"${(r.quantity || "").replace(/"/g, '""')}"`,
    `"${(r.unit || "").replace(/"/g, '""')}"`,
    `"${(r.industry || "").replace(/"/g, '""')}"`,
    `"${(r.message || "").replace(/"/g, '""')}"`,
    `"${(r.adminNotes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

// PRODUCTS CATALOG
function readAllProducts() {
  return readJSON(PRODUCTS_FILE, DEFAULT_PRODUCTS);
}

function writeAllProducts(products) {
  writeJSON(PRODUCTS_FILE, products);
}

function addProduct(product) {
  const products = readAllProducts();
  const nextId = products.length ? Math.max(...products.map((p) => p.id || 0)) + 1 : 1;
  const newProduct = {
    id: nextId,
    status: "active",
    createdAt: new Date().toISOString(),
    ...product,
  };
  products.push(newProduct);
  writeAllProducts(products);
  return newProduct;
}

function updateProduct(id, updates) {
  const products = readAllProducts();
  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  writeAllProducts(products);
  return products[idx];
}

function deleteProduct(id) {
  const products = readAllProducts();
  const filtered = products.filter((p) => String(p.id) !== String(id));
  if (filtered.length === products.length) return false;
  writeAllProducts(filtered);
  return true;
}

module.exports = {
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
};
