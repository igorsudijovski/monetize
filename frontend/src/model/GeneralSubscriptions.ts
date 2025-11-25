import {SubscriptionCardProps, SubscriptionType} from "./SubscriptionCardProps";
import {GeneralSubscriptionsEntity} from "@backend/GeneralSubscriptionsEntity";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";


export const mapToSubscriptionCard = (sub: GeneralSubscriptionsEntity) : SubscriptionCardProps => {
    return {
        id: sub.id,
        title: sub.name,
        description: sub.description,
        active: sub.active,
        price: sub.price,
        items: sub.bulletText,
        type: 'subscription',
        subsType: 'general',
        days: 30,
        showAdminActions: false,
        adminSide: false
    }
}
export const mapToSubscriptionCardApp = (sub: ApplicationSubscriptionsEntity) : SubscriptionCardProps => {
    let type: SubscriptionType = 'one_time';

    if (sub.numDays !== undefined && sub.numDays > 0) {
        type = 'subscription';
    }
    if (sub.numUsages !== undefined && sub.numUsages > 0) {
        type = 'usage_limited';
    }
    if (sub.isLifetime) {
        type = 'lifetime';
    }

    return {
        id: sub.id,
        title: sub.name,
        applicationId: sub.applicationId,
        description: sub.description,
        price: sub.price,
        active: sub.active,
        items: sub.bulletText,
        type: type,
        subsType: 'application',
        days: sub.numDays ?? 0,
        usageLimit: sub.numUsages ?? 0,
        showAdminActions: false,
        adminSide: false
    }
}
export const mapToSubscriptionCardAppAdmin = (sub: ApplicationSubscriptionsEntity, onEdit: (id: string) => void, onActivate: (id: string) => void, onDeactivate: (id: string) => void) : SubscriptionCardProps => {
    let subCard = mapToSubscriptionCardApp(sub);
    subCard.showAdminActions = true;
    subCard.onEdit = () => onEdit(sub.id);
    subCard.onActivate = () => onActivate(sub.id);
    subCard.onDeactivate = () => onDeactivate(sub.id);
    return subCard;
}
export const mapToSubscriptionCardAppAdminShow = (sub: ApplicationSubscriptionsEntity) : SubscriptionCardProps => {
    let subCard = mapToSubscriptionCardApp(sub);
    subCard.adminSide = true;
    return subCard;
}