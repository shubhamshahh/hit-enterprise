const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Automatically load .env files
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

let supabaseInstance = null;

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL.trim();
    // Prefer service role key for full server backend access (bypassing RLS safely on server)
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY).trim();
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
    });
    console.log(`[Supabase] Client initialized for project: ${url}`);
  }
  return supabaseInstance;
}

// -------------------------------------------------------------
// FIELD MAPPERS (JS CamelCase <-> PostgreSQL Snake_Case)
// -------------------------------------------------------------

function mapProductFromDB(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name || "",
    cas: row.cas || "",
    grade: row.grade || "",
    category: row.category || "",
    purity: row.purity || "",
    packaging: row.packaging || "",
    stockQty: row.stock_qty !== undefined ? String(row.stock_qty) : (row.stockQty !== undefined ? String(row.stockQty) : "0"),
    stockUnit: row.stock_unit || row.stockUnit || "Bags",
    stockStatus: row.stock_status || row.stockStatus || "optimal",
    applications: row.applications || "",
    status: row.status || "active",
    image: row.image || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function mapProductToDB(prod) {
  const data = {};
  if (prod.id !== undefined && prod.id !== null) data.id = Number(prod.id);
  if (prod.name !== undefined) data.name = String(prod.name).trim();
  if (prod.cas !== undefined) data.cas = String(prod.cas || "").trim();
  if (prod.grade !== undefined) data.grade = String(prod.grade || "").trim();
  if (prod.category !== undefined) data.category = String(prod.category || "").trim();
  if (prod.purity !== undefined) data.purity = String(prod.purity || "").trim();
  if (prod.packaging !== undefined) data.packaging = String(prod.packaging || "").trim();
  
  if (prod.stockQty !== undefined || prod.stock_qty !== undefined) {
    data.stock_qty = String(prod.stockQty !== undefined ? prod.stockQty : prod.stock_qty).trim();
  }
  if (prod.stockUnit !== undefined || prod.stock_unit !== undefined) {
    data.stock_unit = String(prod.stockUnit !== undefined ? prod.stockUnit : prod.stock_unit).trim();
  }
  if (prod.stockStatus !== undefined || prod.stock_status !== undefined) {
    data.stock_status = String(prod.stockStatus !== undefined ? prod.stockStatus : prod.stock_status).trim();
  }
  if (prod.applications !== undefined) data.applications = String(prod.applications || "").trim();
  if (prod.status !== undefined) data.status = String(prod.status || "active").trim();
  if (prod.image !== undefined) data.image = String(prod.image || "").trim();
  data.updated_at = prod.updatedAt || new Date().toISOString();
  return data;
}

function mapInquiryFromDB(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name || "",
    company: row.company || "",
    email: row.email || "",
    phone: row.phone || "",
    chemical: row.chemical || "",
    quantity: row.quantity || "",
    unit: row.unit || "kg",
    industry: row.industry || "",
    message: row.message || "",
    status: row.status || "new",
    source: row.source || "form",
    adminNotes: row.admin_notes !== undefined ? row.admin_notes : (row.adminNotes || ""),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function mapInquiryToDB(inq) {
  const data = {};
  if (inq.id !== undefined && inq.id !== null) data.id = Number(inq.id);
  if (inq.name !== undefined) data.name = String(inq.name).trim();
  if (inq.company !== undefined) data.company = String(inq.company || "").trim();
  if (inq.email !== undefined) data.email = String(inq.email || "").trim();
  if (inq.phone !== undefined) data.phone = String(inq.phone).trim();
  if (inq.chemical !== undefined) data.chemical = String(inq.chemical).trim();
  if (inq.quantity !== undefined) data.quantity = String(inq.quantity).trim();
  if (inq.unit !== undefined) data.unit = String(inq.unit || "kg").trim();
  if (inq.industry !== undefined) data.industry = String(inq.industry || "").trim();
  if (inq.message !== undefined) data.message = String(inq.message || "").trim();
  if (inq.status !== undefined) data.status = String(inq.status || "new").trim();
  if (inq.source !== undefined) data.source = String(inq.source || "form").trim();
  if (inq.adminNotes !== undefined || inq.admin_notes !== undefined) {
    data.admin_notes = String(inq.adminNotes !== undefined ? inq.adminNotes : inq.admin_notes).trim();
  }
  data.updated_at = inq.updatedAt || new Date().toISOString();
  return data;
}

// -------------------------------------------------------------
// SUPABASE STORAGE: PERMANENT IMAGE UPLOAD
// -------------------------------------------------------------

const BUCKET_NAME = "product-images";
let bucketChecked = false;

async function ensureStorageBucket(client) {
  if (bucketChecked) return;
  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (!error && buckets) {
      const exists = buckets.some((b) => b.name === BUCKET_NAME || b.id === BUCKET_NAME);
      if (!exists) {
        console.log(`[Supabase Storage] Creating public bucket '${BUCKET_NAME}'...`);
        await client.storage.createBucket(BUCKET_NAME, { public: true });
      }
    }
    bucketChecked = true;
  } catch (err) {
    console.warn(`[Supabase Storage] Bucket check note:`, err.message);
  }
}

/**
 * Uploads a base64 encoded image to Supabase Storage bucket 'product-images'
 * and returns the permanent public CDN URL.
 */
async function uploadProductImage(productId, imageInput) {
  if (!imageInput || typeof imageInput !== "string") return imageInput;

  // Already a permanent URL
  if (imageInput.startsWith("http://") || imageInput.startsWith("https://") || imageInput.startsWith("/images/")) {
    return imageInput;
  }

  // Check if it's base64 data
  const matches = imageInput.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) {
    return imageInput;
  }

  const client = getSupabaseClient();
  if (!client) return imageInput;

  try {
    await ensureStorageBucket(client);

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    let ext = "webp";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
    else if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("svg")) ext = "svg";

    const cleanProdId = String(productId || "item").replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `products/prod-${cleanProdId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[Supabase Storage] Upload error:`, uploadError.message);
      // Try creating bucket if not existing
      await client.storage.createBucket(BUCKET_NAME, { public: true }).catch(() => {});
      const retry = await client.storage.from(BUCKET_NAME).upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });
      if (retry.error) throw retry.error;
    }

    const { data: publicUrlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData && publicUrlData.publicUrl;
    if (publicUrl) {
      console.log(`[Supabase Storage] Uploaded image for product ${productId}: ${publicUrl}`);
      return publicUrl;
    }
  } catch (err) {
    console.error(`[Supabase Storage] Failed to upload image:`, err.message);
  }

  // Graceful fallback to original input so image is never lost
  return imageInput;
}

/**
 * Deletes an image file from Supabase Storage if it's hosted there.
 */
async function deleteProductImageFromStorage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const match = imageUrl.match(/product-images\/(.+)$/);
    if (match && match[1]) {
      const filePath = decodeURIComponent(match[1]);
      console.log(`[Supabase Storage] Removing file: ${filePath}`);
      await client.storage.from(BUCKET_NAME).remove([filePath]);
    }
  } catch (err) {
    console.warn(`[Supabase Storage] Delete file notice:`, err.message);
  }
}

/**
 * Clears ALL product images from Supabase database and storage bucket.
 */
async function clearAllProductImages() {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Supabase not connected" };

  try {
    // 1. Clear image field in database
    await client.from("products").update({ image: "", updated_at: new Date().toISOString() }).neq("id", 0);

    // 2. Remove all stored files in bucket
    const { data: files } = await client.storage.from(BUCKET_NAME).list("products");
    if (files && files.length > 0) {
      const pathsToDelete = files
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => `products/${f.name}`);
      if (pathsToDelete.length > 0) {
        await client.storage.from(BUCKET_NAME).remove(pathsToDelete);
        console.log(`[Supabase Storage] Deleted ${pathsToDelete.length} files from storage bucket.`);
      }
    }
    return { ok: true };
  } catch (err) {
    console.error("[Supabase] Error in clearAllProductImages:", err.message);
    return { ok: false, error: err.message };
  }
}

// -------------------------------------------------------------
// PRODUCTS CRUD (SUPABASE)
// -------------------------------------------------------------

async function getAllProducts() {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("[Supabase DB] Error reading products:", error.message);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  } catch (err) {
    console.error("[Supabase DB] Exception in getAllProducts:", err.message);
    return [];
  }
}

async function seedProducts(products) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(products) || !products.length) return;

  try {
    const records = products.map((p) => mapProductToDB(p));
    const { error } = await client.from("products").upsert(records, { onConflict: "id" });
    if (error) {
      console.error("[Supabase DB] Seeding failed:", error.message);
    } else {
      console.log(`[Supabase DB] Seeded ${records.length} products successfully!`);
    }
  } catch (err) {
    console.error("[Supabase DB] Seeding exception:", err.message);
  }
}

async function addProduct(prod) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // If no ID is provided, query the max id
    let nextId = prod.id;
    if (!nextId) {
      const { data } = await client.from("products").select("id").order("id", { ascending: false }).limit(1);
      nextId = data && data[0] && data[0].id ? Number(data[0].id) + 1 : 1;
    }

    let imageUrl = prod.image || "";
    if (imageUrl.startsWith("data:image/")) {
      imageUrl = await uploadProductImage(nextId, imageUrl);
    }

    const dbRecord = mapProductToDB({
      ...prod,
      id: nextId,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { data, error } = await client.from("products").insert(dbRecord).select().single();
    if (error) throw error;
    return mapProductFromDB(data);
  } catch (err) {
    console.error("[Supabase DB] Error adding product:", err.message);
    throw err;
  }
}

async function updateProduct(id, updates) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // If image is being changed or removed, clean up old storage file
    if (updates.image !== undefined) {
      const { data: current } = await client.from("products").select("image").eq("id", Number(id)).single();
      if (current && current.image && current.image !== updates.image) {
        await deleteProductImageFromStorage(current.image);
      }
    }

    let imageUrl = updates.image;
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      imageUrl = await uploadProductImage(id, imageUrl);
      updates = { ...updates, image: imageUrl };
    }

    const dbUpdates = mapProductToDB(updates);
    delete dbUpdates.id; // Don't modify primary key

    const { data, error } = await client
      .from("products")
      .update(dbUpdates)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;
    return mapProductFromDB(data);
  } catch (err) {
    console.error(`[Supabase DB] Error updating product ${id}:`, err.message);
    throw err;
  }
}

async function deleteProduct(id) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data: current } = await client.from("products").select("image").eq("id", Number(id)).single();
    if (current && current.image) {
      await deleteProductImageFromStorage(current.image);
    }
    const { error } = await client.from("products").delete().eq("id", Number(id));
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`[Supabase DB] Error deleting product ${id}:`, err.message);
    return false;
  }
}

async function bulkUpdateInventory(updatesList) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(updatesList) || !updatesList.length) return [];

  try {
    for (const u of updatesList) {
      if (u && u.id !== undefined) {
        const dbUpdate = {};
        if (u.stockQty !== undefined && u.stockQty !== "") dbUpdate.stock_qty = String(u.stockQty).trim();
        if (u.stockUnit !== undefined && u.stockUnit !== "") dbUpdate.stock_unit = String(u.stockUnit).trim();
        if (u.stockStatus !== undefined && u.stockStatus !== "") dbUpdate.stock_status = String(u.stockStatus).trim();
        dbUpdate.updated_at = new Date().toISOString();

        await client.from("products").update(dbUpdate).eq("id", Number(u.id));
      }
    }

    return await getAllProducts();
  } catch (err) {
    console.error("[Supabase DB] Error in bulkUpdateInventory:", err.message);
    return [];
  }
}

async function syncAllProducts(incomingProducts) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(incomingProducts) || !incomingProducts.length) return [];

  try {
    for (const inp of incomingProducts) {
      if (inp && inp.id !== undefined) {
        let img = inp.image || "";
        if (img.startsWith("data:image/")) {
          img = await uploadProductImage(inp.id, img);
        }
        const dbData = mapProductToDB({ ...inp, image: img });
        await client.from("products").upsert(dbData, { onConflict: "id" });
      }
    }
    return await getAllProducts();
  } catch (err) {
    console.error("[Supabase DB] Error in syncAllProducts:", err.message);
    return [];
  }
}

// -------------------------------------------------------------
// INQUIRIES CRUD (SUPABASE)
// -------------------------------------------------------------

async function getAllInquiries(fallback = []) {
  const client = getSupabaseClient();
  if (!client) return fallback;

  try {
    const { data, error } = await client
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase DB] Error reading inquiries:", error.message);
      return fallback;
    }
    return (data || []).map(mapInquiryFromDB);
  } catch (err) {
    console.error("[Supabase DB] Exception in getAllInquiries:", err.message);
    return fallback;
  }
}

async function addInquiry(inquiry) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let nextId = inquiry.id;
    if (!nextId) {
      const { data } = await client.from("inquiries").select("id").order("id", { ascending: false }).limit(1);
      nextId = data && data[0] && data[0].id ? Number(data[0].id) + 1 : 1001;
    }

    const dbRecord = mapInquiryToDB({
      ...inquiry,
      id: nextId,
      status: inquiry.status || "new",
      source: inquiry.source || "form",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { data, error } = await client.from("inquiries").insert(dbRecord).select().single();
    if (error) throw error;
    return mapInquiryFromDB(data);
  } catch (err) {
    console.error("[Supabase DB] Error adding inquiry:", err.message);
    throw err;
  }
}

async function updateInquiry(id, updates) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const dbUpdates = mapInquiryToDB(updates);
    delete dbUpdates.id;

    const { data, error } = await client
      .from("inquiries")
      .update(dbUpdates)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;
    return mapInquiryFromDB(data);
  } catch (err) {
    console.error(`[Supabase DB] Error updating inquiry ${id}:`, err.message);
    throw err;
  }
}

async function deleteInquiry(id) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("inquiries").delete().eq("id", Number(id));
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`[Supabase DB] Error deleting inquiry ${id}:`, err.message);
    return false;
  }
}

// -------------------------------------------------------------
// ONE-CLICK CLOUD SYNC HELPER (MIGRATE LOCAL JSON -> SUPABASE)
// -------------------------------------------------------------

async function syncLocalToSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  }

  const results = { productsSynced: 0, inquiriesSynced: 0 };

  // Read local products.json
  const productsFile = path.join(__dirname, "..", "data", "products.json");
  if (fs.existsSync(productsFile)) {
    try {
      const prods = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
      if (Array.isArray(prods) && prods.length > 0) {
        await syncAllProducts(prods);
        results.productsSynced = prods.length;
      }
    } catch (e) {
      console.warn("Could not sync local products:", e.message);
    }
  }

  // Read local inquiries.json
  const inquiriesFile = path.join(__dirname, "..", "data", "inquiries.json");
  if (fs.existsSync(inquiriesFile)) {
    try {
      const inqs = JSON.parse(fs.readFileSync(inquiriesFile, "utf-8"));
      if (Array.isArray(inqs) && inqs.length > 0) {
        for (const inq of inqs) {
          const dbData = mapInquiryToDB(inq);
          await client.from("inquiries").upsert(dbData, { onConflict: "id" });
        }
        results.inquiriesSynced = inqs.length;
      }
    } catch (e) {
      console.warn("Could not sync local inquiries:", e.message);
    }
  }

  return results;
}

module.exports = {
  isSupabaseConfigured,
  getSupabaseClient,
  uploadProductImage,
  getAllProducts,
  seedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateInventory,
  syncAllProducts,
  getAllInquiries,
  addInquiry,
  updateInquiry,
  deleteInquiry,
  syncLocalToSupabase,
  clearAllProductImages,
  deleteProductImageFromStorage,
};
