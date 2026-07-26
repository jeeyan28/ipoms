// IPOMS has no login screen of its own - staff sign in on the Kairos
// login page, and Kairos hands the logged-in user off here as a base64
// query param (there's no shared session, since the two apps are
// separate Vite origins/ports). This module reads that handoff, stores
// it for the rest of the session, and sends anyone without a valid
// staff user back to Kairos to sign in.

const STORAGE_KEY = "ipoms-demo-user";
const KAIROS_URL = import.meta.env.VITE_KAIROS_URL || "http://localhost:5173";

function readHandoffFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const handoff = params.get("user");
  if (!handoff) return null;

  try {
    const user = JSON.parse(window.atob(decodeURIComponent(handoff)));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Malformed handoff - ignore and fall through to whatever's stored.
  }

  // Strip the token out of the visible URL once it's been consumed.
  params.delete("user");
  const rest = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));

  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function getCurrentUser() {
  return readHandoffFromUrl() || (() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  })();
}

// Call once, near the top of the app. Redirects (and returns null) if
// there's no user or the user isn't staff - admins belong on Kairos.
export function requireStaffUser() {
  const user = getCurrentUser();
  if (!user || user.role !== "staff") {
    window.location.href = `${KAIROS_URL}/`;
    return null;
  }
  return user;
}

export function logout() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.location.href = `${KAIROS_URL}/?logout=1`;
}
