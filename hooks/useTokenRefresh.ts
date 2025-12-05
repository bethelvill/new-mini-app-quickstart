import { useCallback, useEffect, useRef } from "react";
import { authApi } from "@/lib/auth";
import { apiClient } from "@/lib/api";

// Refresh 5 minutes before expiration (JWT expires in 1 hour)
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_REFRESH_INTERVAL_MS = 30 * 1000; // Minimum 30 seconds between refresh attempts

/**
 * Decodes a JWT token and returns the payload
 * Does NOT verify the signature - only extracts the payload
 */
function decodeJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Gets the expiration time from a JWT token in milliseconds
 */
function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload?.exp) return null;
  // JWT exp is in seconds, convert to milliseconds
  return payload.exp * 1000;
}

/**
 * Hook that proactively refreshes the access token before it expires.
 * Should be used in a top-level component that wraps authenticated routes.
 */
export function useTokenRefresh() {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshAttemptRef = useRef<number>(0);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const performRefresh = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      return;
    }

    // Prevent rapid refresh attempts
    const now = Date.now();
    if (now - lastRefreshAttemptRef.current < MIN_REFRESH_INTERVAL_MS) {
      return;
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshAttemptRef.current = now;

    try {
      const response = await authApi.refreshToken({ refreshToken });

      if (response.data?.accessToken) {
        // Update tokens
        apiClient.setToken(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);

        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // Schedule next refresh based on new token
        scheduleRefresh(response.data.accessToken);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Don't clear tokens here - let the 401 interceptor handle it
      // The user may still have a valid session
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (accessToken: string) => {
      clearRefreshTimer();

      const expirationTime = getTokenExpiration(accessToken);
      if (!expirationTime) {
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = expirationTime - now;

      // If token is already expired or about to expire very soon, refresh immediately
      if (timeUntilExpiry <= REFRESH_BUFFER_MS) {
        // Add a small delay to prevent immediate refresh loops
        refreshTimerRef.current = setTimeout(performRefresh, 1000);
        return;
      }

      // Schedule refresh 5 minutes before expiration
      const refreshIn = timeUntilExpiry - REFRESH_BUFFER_MS;

      refreshTimerRef.current = setTimeout(performRefresh, refreshIn);
    },
    [clearRefreshTimer, performRefresh]
  );

  // Initialize on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      scheduleRefresh(accessToken);
    }

    // Cleanup on unmount
    return () => {
      clearRefreshTimer();
    };
  }, [scheduleRefresh, clearRefreshTimer]);

  // Listen for storage changes (e.g., login in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        if (e.newValue) {
          scheduleRefresh(e.newValue);
        } else {
          clearRefreshTimer();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [scheduleRefresh, clearRefreshTimer]);

  // Return methods for manual control if needed
  return {
    refreshNow: performRefresh,
    cancelScheduledRefresh: clearRefreshTimer,
  };
}
