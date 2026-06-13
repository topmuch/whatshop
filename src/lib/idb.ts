/* ============================================================
   IndexedDB Wrapper for Offline Data Cache
   Uses the `idb` library for a promise-based API
   ============================================================ */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "boutiko-offline";
const DB_VERSION = 1;

interface BoutikoDBSchema {
  "cached-products": {
    key: string; // shopId
    value: {
      shopId: string;
      products: Array<{
        id: string;
        name: string;
        price: number;
        comparePrice?: number | null;
        images?: string | null;
        category?: string | null;
        description?: string | null;
        stock?: number | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
      cachedAt: number;
    };
    indexes: { "by-cached-at": number };
  };
  "cached-dashboard": {
    key: string; // userId
    value: {
      userId: string;
      stats: {
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        recentOrders: Array<Record<string, unknown>>;
      };
      cachedAt: number;
    };
    indexes: { "by-cached-at": number };
  };
  "cached-shop-config": {
    key: string; // shopId
    value: {
      shopId: string;
      config: Record<string, unknown>;
      cachedAt: number;
    };
    indexes: { "by-cached-at": number };
  };
}

let dbInstance: IDBPDatabase<BoutikoDBSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<BoutikoDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BoutikoDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products cache
      if (!db.objectStoreNames.contains("cached-products")) {
        const productStore = db.createObjectStore("cached-products", {
          keyPath: "shopId",
        });
        productStore.createIndex("by-cached-at", "cachedAt");
      }

      // Dashboard cache
      if (!db.objectStoreNames.contains("cached-dashboard")) {
        const dashStore = db.createObjectStore("cached-dashboard", {
          keyPath: "userId",
        });
        dashStore.createIndex("by-cached-at", "cachedAt");
      }

      // Shop config cache
      if (!db.objectStoreNames.contains("cached-shop-config")) {
        const configStore = db.createObjectStore("cached-shop-config", {
          keyPath: "shopId",
        });
        configStore.createIndex("by-cached-at", "cachedAt");
      }
    },
  });

  return dbInstance;
}

/* ---- Products ---- */

export async function cacheProducts(
  shopId: string,
  products: BoutikoDBSchema["cached-products"]["value"]["products"]
): Promise<void> {
  const db = await getDB();
  await db.put("cached-products", {
    shopId,
    products,
    cachedAt: Date.now(),
  });
}

export async function getCachedProducts(
  shopId: string
): Promise<BoutikoDBSchema["cached-products"]["value"]["products"] | null> {
  const db = await getDB();
  const record = await db.get("cached-products", shopId);
  if (!record) return null;

  // Return null if cache is older than 24 hours
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - record.cachedAt > maxAge) return null;

  return record.products;
}

/* ---- Dashboard Stats ---- */

export async function cacheDashboardStats(
  userId: string,
  stats: BoutikoDBSchema["cached-dashboard"]["value"]["stats"]
): Promise<void> {
  const db = await getDB();
  await db.put("cached-dashboard", {
    userId,
    stats,
    cachedAt: Date.now(),
  });
}

export async function getCachedDashboardStats(
  userId: string
): Promise<BoutikoDBSchema["cached-dashboard"]["value"]["stats"] | null> {
  const db = await getDB();
  const record = await db.get("cached-dashboard", userId);
  if (!record) return null;

  // Return null if cache is older than 1 hour
  const maxAge = 60 * 60 * 1000;
  if (Date.now() - record.cachedAt > maxAge) return null;

  return record.stats;
}

/* ---- Shop Config ---- */

export async function cacheShopConfig(
  shopId: string,
  config: Record<string, unknown>
): Promise<void> {
  const db = await getDB();
  await db.put("cached-shop-config", {
    shopId,
    config,
    cachedAt: Date.now(),
  });
}

export async function getCachedShopConfig(
  shopId: string
): Promise<Record<string, unknown> | null> {
  const db = await getDB();
  const record = await db.get("cached-shop-config", shopId);
  if (!record) return null;

  // Return null if cache is older than 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - record.cachedAt > maxAge) return null;

  return record.config;
}

/* ---- Cleanup ---- */

export async function clearAllOfflineCache(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ["cached-products", "cached-dashboard", "cached-shop-config"],
    "readwrite"
  );
  await Promise.all([
    tx.objectStore("cached-products").clear(),
    tx.objectStore("cached-dashboard").clear(),
    tx.objectStore("cached-shop-config").clear(),
    tx.done,
  ]);
}

export async function getOfflineCacheStats(): Promise<{
  products: number;
  dashboards: number;
  configs: number;
  totalSize: string;
}> {
  const db = await getDB();
  const [products, dashboards, configs] = await Promise.all([
    db.count("cached-products"),
    db.count("cached-dashboard"),
    db.count("cached-shop-config"),
  ]);

  // Estimate total size
  let totalBytes = 0;
  const allProducts = await db.getAll("cached-products");
  const allDashboards = await db.getAll("cached-dashboard");
  const allConfigs = await db.getAll("cached-shop-config");

  for (const record of [...allProducts, ...allDashboards, ...allConfigs]) {
    totalBytes += JSON.stringify(record).length;
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    products,
    dashboards,
    configs,
    totalSize: formatSize(totalBytes),
  };
}