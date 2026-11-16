// ---------------------------------------------------------------------------
// Shared API types — aligned with spec v3.1 §1.2
// ---------------------------------------------------------------------------

/**
 * Standard error body returned by the backend.
 * `code` is a named error string (e.g. "VALIDATION_ERROR"), NOT an HTTP status.
 */
export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  details?: Record<string, unknown>;
};

/**
 * Pagination metadata included in every collection response.
 */
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/**
 * Envelope for a single-resource response: `{ data: T; meta?: ... }`.
 */
export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

/**
 * Envelope for a collection response: `{ data: T[]; meta: PaginationMeta }`.
 */
export type CollectionResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

// Keep the old name as an alias so existing consumers don't break.
/** @deprecated Use `CollectionResponse<T>` instead. */
export type PaginatedResponse<T> = CollectionResponse<T>;

export type SortDirection = "asc" | "desc";

export type ViewMode = "list" | "calendar" | "gantt";
