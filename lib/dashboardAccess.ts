export const DASHBOARD_ACCESS_STORAGE_KEY = "arrivesafe-dashboard-built";

const PUBLIC_ROUTES = ["/"] as const;
const PROTECTED_ROUTES = [
  "/intake",
  "/dashboard",
  "/simulate",
  "/coverage",
  "/claim",
  "/decode",
  "/afford",
  "/newcomer-guide",
  "/scam",
] as const;

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function canAccessRoute(pathname: string, isDashboardBuilt: boolean) {
  if (isPublicRoute(pathname)) {
    return true;
  }

  if (isProtectedRoute(pathname)) {
    return isDashboardBuilt;
  }

  return false;
}

export function getStoredDashboardAccess() {
  if (typeof window === "undefined") {
    return false;
  }

  const raw = window.localStorage.getItem(DASHBOARD_ACCESS_STORAGE_KEY);

  if (raw !== null) {
    try {
      return JSON.parse(raw) === true;
    } catch {
      return false;
    }
  }

  return false;
}

export function saveStoredDashboardAccess(isDashboardBuilt: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DASHBOARD_ACCESS_STORAGE_KEY,
    JSON.stringify(isDashboardBuilt),
  );
}

export function clearStoredDashboardAccess() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DASHBOARD_ACCESS_STORAGE_KEY);
}
