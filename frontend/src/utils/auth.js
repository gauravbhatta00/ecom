import { apiBaseUrl } from '../lib/config';
// src/utils/auth.js
const BASEURL =
    apiBaseUrl;

export const saveTokens = (tokens) => {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
};

export const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

export const getAccessToken = () => { try { return typeof window === "undefined" ? null : localStorage.getItem("access_token"); } catch { return null; } };
export const getRefreshToken = () => { try { return typeof window === "undefined" ? null : localStorage.getItem("refresh_token"); } catch { return null; } };

// ── Token refresh ──────────────────────────────────────────────────────────
// Only one refresh call runs at a time; other requests wait for it to finish.
let refreshPromise = null;

const refreshAccessToken = async() => {
    // If a refresh is already in flight, reuse it instead of firing a second one
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async() => {
        const refresh = getRefreshToken();
        if (!refresh) throw new Error("No refresh token available");

        const res = await fetch(`${BASEURL}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) {
            // Refresh token is invalid/expired — force logout
            clearTokens();
            // A hard navigation intentionally clears the expired legacy session and providers.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/login";
            throw new Error("Session expired. Please log in again.");
        }

        const data = await res.json();
        // Django Simple JWT returns only a new access token on refresh
        localStorage.setItem("access_token", data.access);
        // If your backend also rotates the refresh token, save it too:
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        return data.access;
    })();

    // Clear the lock once settled so future refreshes can run
    try { return await refreshPromise; }
    finally { refreshPromise = null; }
};

// ── authFetch ──────────────────────────────────────────────────────────────
export const authFetch = async(url, options = {}) => {
    const buildHeaders = (token) => ({
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    // First attempt with the current access token
    let res = await fetch(url, {...options, headers: buildHeaders(getAccessToken()) });

    // If 401, try refreshing once then retry
    if (res.status === 401) {
        try {
            const newToken = await refreshAccessToken();
            res = await fetch(url, {...options, headers: buildHeaders(newToken) });
        } catch {
            // refreshAccessToken already cleared tokens and redirected
            throw new Error("Unauthorized — session ended.");
        }
    }

    return res;
};
