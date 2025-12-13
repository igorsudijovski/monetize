export interface ApplicationKeyEntity {
    id: string;
    appKey: string;
    numUsages: number;
    active: boolean;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    createdAt: Date;
    price: number;
    pageId: string;
    subscriptionId: string;
    subscriptionName: string;
    subscriptionDescription: string;
    numDays: number | null;
    usageLimit: number | null;
    isLifetime: boolean;
    appId: string;
    appName: string;
    appUrlName: string;
}

