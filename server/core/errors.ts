/**
 * Error domain yang dipakai service/controller. Selalu di-translate jadi
 * NextResponse oleh `withApi` (handler.ts).
 */
export class AppError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const Errors = {
  validation: (details: unknown) =>
    new AppError("VALIDATION_ERROR", "Input tidak valid.", 400, details),
  unauthorized: (msg = "Tidak terautentikasi.") =>
    new AppError("UNAUTHORIZED", msg, 401),
  forbidden: (msg = "Akses ditolak.") => new AppError("FORBIDDEN", msg, 403),
  notFound: (resource: string) =>
    new AppError("NOT_FOUND", `${resource} tidak ditemukan.`, 404),
  conflict: (msg: string) => new AppError("CONFLICT", msg, 409),
  internal: (msg = "Terjadi kesalahan internal.") =>
    new AppError("INTERNAL_ERROR", msg, 500),
};
