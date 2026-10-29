/**
 * HTTP API client. Resolves the correct localhost/LAN address per platform so
 * Android emulators and physical devices can reach the dev server on the PC.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";
import { ApiError } from "./shared";

const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "4000";

function getMetroHost(): string | undefined {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;
  if (!hostUri) return undefined;
  return hostUri.split(":")[0];
}

export function resolveBaseUrl(): string {
  const metroHost = getMetroHost();

  if (Platform.OS === "web") {
    return `http://localhost:${API_PORT}`;
  }

  if (metroHost && metroHost !== "localhost" && metroHost !== "127.0.0.1") {
    return `http://${metroHost}:${API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

/** Customer-facing API namespace aligned with Admin + Restaurant panels. */
export const CUSTOMER_API = "/api/customer";

export { ApiError } from "./shared";

type RuntimeConfig = {
  failNextRequests: boolean;
  offline: boolean;
  latencyMs: number;
};

export const apiConfig: RuntimeConfig = {
  failNextRequests: false,
  offline: false,
  latencyMs: 0,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Perform an HTTP request to the local API. If the server can't be reached, fall
 * back to the bundled in-memory data (`fallback`) so the app keeps working even
 * when `expo start` is run without the API server. The demo offline / force-error
 * flags still short-circuit before any of this.
 */
export async function request<T>(
  path: string,
  opts: RequestOptions = {},
  fallback?: () => T | Promise<T>,
): Promise<T> {
  await delay(apiConfig.latencyMs);

  if (apiConfig.offline) {
    throw new ApiError("You appear to be offline.", "OFFLINE", 0);
  }
  if (apiConfig.failNextRequests) {
    throw new ApiError("Could not load data. Please try again.", "FORCED", 500);
  }

  const { body, headers, ...rest } = opts;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(headers as Record<string, string> | undefined),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Server unreachable — degrade gracefully to bundled data when available.
    if (fallback) return fallback();
    throw new ApiError(
      "Could not reach the server. Run npm start to launch the API and Expo together.",
      "NETWORK",
      0,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string }).message ?? "Could not load data. Please try again.",
      (data as { code?: string }).code ?? "GENERIC",
      res.status,
    );
  }

  return data as T;
}

export { uid } from "./shared";
