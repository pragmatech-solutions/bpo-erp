/**
 * Single source of truth for pagination limits, shared by the zod input schemas
 * on the backend and the pagination controls on the frontend.
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
