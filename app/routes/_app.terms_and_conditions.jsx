import { Outlet } from "react-router";

/**
 * Layout route for /terms_and_conditions and its children.
 * - /terms_and_conditions       → _app.terms_and_conditions._index.jsx
 * - /terms_and_conditions/setup → _app.terms_and_conditions.setup.jsx
 */
export default function TermsAndConditionsLayout() {
  return <Outlet />;
}
