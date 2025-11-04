export enum GeneralSubscriptionsType {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PRO = 'PRO'
}

export type SubscriptionType = "one_time" | "subscription" | "usage_limited" | "lifetime";

export interface Restriction {
    creationTypes: SubscriptionType[];
    numberOfTokens?: number;
    priceLow: number;
    priceHigh: number;
    regenTokens: boolean;
    numberOfSubscriptions: number;
    bulletTextLength?: number;
    showGraph: boolean;
}

export const getRestriction = (type: GeneralSubscriptionsType) : Restriction => {
    switch (type) {
        case GeneralSubscriptionsType.FREE: return {
            creationTypes: ["one_time"],
            numberOfTokens: 50,
            priceLow: 5,
            priceHigh: 40,
            regenTokens: false,
            numberOfSubscriptions: 3,
            bulletTextLength: 3,
            showGraph: false
        }
        case GeneralSubscriptionsType.BASIC: return {
            creationTypes: ["one_time", "lifetime", "usage_limited"],
            numberOfTokens: 400,
            priceLow: 5,
            priceHigh: 250,
            regenTokens: true,
            numberOfSubscriptions: 6,
            bulletTextLength: 10,
            showGraph: true
        }
        case GeneralSubscriptionsType.PRO: return {
            creationTypes: ["one_time", "lifetime", "usage_limited", "subscription"],
            priceLow: 2,
            priceHigh: 2000,
            regenTokens: true,
            numberOfSubscriptions: 15,
            showGraph: true
        }
    }
}