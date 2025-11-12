export interface PaginationModel<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}