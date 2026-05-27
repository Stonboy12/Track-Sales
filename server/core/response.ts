import { NextResponse } from "next/server";

/**
 * Bentuk response API yang konsisten di seluruh modul.
 * Frontend hanya perlu memeriksa `success` lalu pakai `data` atau `error`.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(
  data: T,
  init?: { status?: number; meta?: Record<string, unknown>; headers?: HeadersInit }
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, ...(init?.meta ? { meta: init.meta } : {}) },
    { status: init?.status ?? 200, headers: init?.headers }
  );
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, { status: 201 });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  );
}
