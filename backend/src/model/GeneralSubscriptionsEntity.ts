import {GeneralSubscriptionsType} from "./GeneralSubscriptionsType";

export interface GeneralSubscriptionsEntity {
    id: string;
    name: string;
    description?: string;
    bulletText: string[];
    type: GeneralSubscriptionsType
    stripeProductId: string,
    price: number,
    percentage: number,
    fixFee: number,
    currency: string,
    active: boolean,
    expiresAt: Date
}