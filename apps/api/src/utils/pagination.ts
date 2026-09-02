import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function resolvePagination(req: Request, defaultLimit = 20): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResult<T>(items: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    items,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}
