export interface DashboardKeysEntity {
    id: string;
    key: string;
    numUsages: string;
    active: string,
    expiresAt: Date,
    lastUsedAt: Date,
    createdAt: Date,
    name: string
}