const STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL || '';
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const API_URL = import.meta.env.VITE_OPENCLAW_API_URL || '';
const API_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';

export interface ShopifyKPI {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  dayOverDayChange: number; // percentage
}

export interface ShopifyProduct {
  title: string;
  revenue: number;
  unitsSold: number;
}

export interface ShopifyRevenueData {
  kpi: ShopifyKPI;
  topProducts: ShopifyProduct[];
  dailyRevenue: { date: string; revenue: number }[];
  period: string;
}

export function isShopifyConfigured(): boolean {
  return !!STORE_URL && (!!STOREFRONT_TOKEN || !!API_URL);
}

/**
 * Fetch revenue data through OpenClaw gateway proxy.
 * The gateway proxies to Shopify Admin API server-side, keeping the private key safe.
 * Falls back to placeholder data if unavailable.
 */
export async function fetchShopifyRevenue(): Promise<ShopifyRevenueData> {
  if (!API_URL) {
    return getPlaceholderData();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_URL}/shopify/revenue`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Shopify proxy error: ${res.status}`);
    return res.json();
  } catch {
    return getPlaceholderData();
  }
}

function getPlaceholderData(): ShopifyRevenueData {
  return {
    kpi: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0, dayOverDayChange: 0 },
    topProducts: [],
    dailyRevenue: [],
    period: 'No data — connect Shopify',
  };
}
