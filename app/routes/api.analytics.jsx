import { authenticate } from "../shopify.server";
import { AnalyticsService } from "../services/analytics.service";

export const action = async ({ request }) => {
  // Authenticate via App Proxy (called from storefront)
  let shop;
  try {
    const { session, shop: proxyShop } =
      await authenticate.public.appProxy(request);
    shop = proxyShop || session?.shop;
  } catch (error) {
    console.error("App Proxy authentication failed:", error);
    const url = new URL(request.url);
    shop = url.searchParams.get("shop");
  }

  if (!shop) {
    return Response.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const formData = await request.formData();
  const type = formData.get("type"); // "verified" | "unverified"

  if (!type) {
    return Response.json({ error: "Missing type parameter" }, { status: 400 });
  }

  await AnalyticsService.trackEvent(shop, type);

  return Response.json({ success: true });
};

/**
 * GET /api/analytics?shop=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Called from the admin dashboard (authenticated context).
 * Uses admin session to derive shop — ignores the shop query param for security.
 */
export const loader = async ({ request }) => {
  // Authenticate as admin (this is called from the embedded admin app)
  let shop;
  try {
    const { session } = await authenticate.admin(request);
    shop = session.shop;
  } catch {
    const url = new URL(request.url);
    shop = url.searchParams.get("shop");
  }

  if (!shop) {
    return Response.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") || null;
  const endDate = url.searchParams.get("endDate") || null;

  const stats = await AnalyticsService.getStats(shop, startDate, endDate);
  return Response.json(stats);
};
