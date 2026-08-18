import { authenticate } from "../shopify.server";
import { AnalyticsService } from "../services/analytics.service";

export const action = async ({ request }) => {
  // Authenticate via App Proxy (called from storefront) — signature is
  // verified by the SDK; do not fall back to an unsigned shop param.
  const { session, shop: proxyShop } =
    await authenticate.public.appProxy(request);
  const shop = proxyShop || session?.shop;

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
 * Uses admin session to derive shop — the shop query param is ignored.
 */
export const loader = async ({ request }) => {
  // Authenticate as admin (this is called from the embedded admin app)
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") || null;
  const endDate = url.searchParams.get("endDate") || null;

  const stats = await AnalyticsService.getStats(shop, startDate, endDate);
  return Response.json(stats);
};
