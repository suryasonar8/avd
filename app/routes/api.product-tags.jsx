import { authenticate } from "../shopify.server";
import { ShopService } from "../services/shop.service";

/**
 * GET /api/product-tags
 *
 * Returns the shop's distinct product tags for the "Specific product tags"
 * popup targeting picker. Called from the admin dashboard (authenticated
 * context).
 */
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const tags = await ShopService.getProductTags(admin);
  return Response.json({ tags });
};
