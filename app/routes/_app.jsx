import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { PlanProvider } from "../context/PlanContext";
import { getShopPlan, buildAccessMap } from "../services/plan.service";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const plan = await getShopPlan(admin, session.shop);
  const access = buildAccessMap(plan);
  return { plan, access };
};

export default function App() {
  const { plan, access } = useLoaderData();
  return (
    <>
      <s-app-nav>
        <s-link href="/store_verification">Store verification</s-link>
        <s-link href="/checkout_verification">Checkout Verification</s-link>
        <s-link href="/translation">Translation</s-link>
        <s-link href="/terms_and_conditions">Terms and Conditions</s-link>
        <s-link href="/settings">settings</s-link>
        <s-link href="/pricing">Pricing</s-link>
      </s-app-nav>
      <PlanProvider plan={plan} access={access}>
        <Outlet />
      </PlanProvider>
    </>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
