export interface ApplicationSubscriptionsEntity {
    id: string;
    name: string;
    description?: string;
    bulletText: string[];
    price: number,
    stripePriceId?: string,
    stripeProductId?: string,
    currency: string,
    active: boolean,
    orderNumber: number,
    oneTimeUse: boolean,
    numDays?: number,
    numUsages?: number,
    isLifetime: boolean,
    createdAt: Date
}