import {SubscriptionCardProps} from "./SubscriptionCardProps";

export interface GeneralSubscriptions {
    id: string;
    name: string;
    description?: string;
    bulletText: string[];
    price: number,
    currency: string,

}

export const mapToSubscriptionCard = (sub: GeneralSubscriptions) : SubscriptionCardProps => {
    return {
        id: sub.id,
        title: sub.name,
        description: sub.description,
        price: sub.price,
        items: sub.bulletText,
        type: 'subscription',
        days: 30,
        showAdminActions: false
    }
}