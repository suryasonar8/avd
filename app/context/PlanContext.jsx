import { createContext, useContext } from "react";
import { PLAN_TYPES } from "../constants/features";

const PlanContext = createContext({ plan: PLAN_TYPES.FREE, access: {} });

/**
 * Wrap your app's <Outlet /> with this provider.
 * Data comes from the root _app.jsx loader.
 */
export function PlanProvider({ plan, access, children }) {
  return (
    <PlanContext.Provider value={{ plan, access }}>
      {children}
    </PlanContext.Provider>
  );
}

/**
 * Hook to check feature access anywhere in the component tree.
 *
 * Usage:
 *   const { plan, canAccess } = usePlan();
 *   <input disabled={!canAccess("terms-and-conditions")} />
 */
export function usePlan() {
  const { plan, access } = useContext(PlanContext);
  return {
    plan,
    canAccess: (featureKey) => access[featureKey] ?? true,
  };
}
