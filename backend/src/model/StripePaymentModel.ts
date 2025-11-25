export interface StripePaymentModel {
    price: number;
    fee: number;
    accountId: string | null;
    currency: string;
    appUrl: string;
    keyId: string;
    productName: string;
    appSubId: string;
    appId: string;
}

export interface StripeSubscriptionModel {
    priceId: string;
    percentage: number;
    accountId: string
    appUrl: string;
    keyId: string;
    appSubId: string;
    appId: string;
}