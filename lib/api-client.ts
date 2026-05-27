/**
 * Tiny fetch wrapper untuk API kita.
 *
 * - Auto-handle envelope `{ success, data, error }`.
 * - Lempar `ApiClientError` saat success=false.
 * - Bekerja di client maupun server component.
 */
export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: { code: string; message: string; details?: unknown } };

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  /** server-only: forward cookie dari Server Component */
  cookie?: string;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  if (!query) return path;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.cookie) headers.cookie = opts.cookie;

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: "no-store",
    credentials: "same-origin",
  });
  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError("INVALID_RESPONSE", "Respons server tidak valid.", res.status);
  }
  if (!json.success) {
    throw new ApiClientError(json.error.code, json.error.message, res.status, json.error.details);
  }
  return json.data;
}

export const api = {
  get<T>(path: string, opts?: RequestOptions) {
    return request<T>("GET", path, opts);
  },
  post<T>(path: string, body?: unknown, opts?: RequestOptions) {
    return request<T>("POST", path, { ...opts, body });
  },
  patch<T>(path: string, body?: unknown, opts?: RequestOptions) {
    return request<T>("PATCH", path, { ...opts, body });
  },
  delete<T>(path: string, opts?: RequestOptions) {
    return request<T>("DELETE", path, opts);
  },
};

/** Helper khusus untuk Server Component: meneruskan cookie dari `next/headers`. */
export async function serverApi<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  opts: Omit<RequestOptions, "cookie"> = {}
): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieHeader = cookies().toString();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return request<T>(method, `${baseUrl}${path}`, {
    ...opts,
    cookie: cookieHeader,
  });
}
