import {Request} from "express";
import {ApplicationsEntity} from "../model/ApplicationsEntity";
import {UserEntity} from "../model/UserEntity";
import {isUUID} from "../service/helper";
import {getApplicationByUserIdAndAppId} from "../service/ApplicationsService";
import {getRestriction, Restriction} from "../model/GeneralSubscriptionsType";
import {getSubscriptionById} from "../service/GeneralSubscriptionService";

export const handleApplication = async (req: Request): Promise<ApplicationsEntity | undefined> => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return undefined;
    }
    const appId = req.params.appId + '';
    if (!isUUID(appId)) {
        return undefined;
    }
    return await getApplicationByUserIdAndAppId(user.id, appId);
}

export const getRestrictionByApp = async (app: ApplicationsEntity): Promise<Restriction | undefined> => {
    if (app.subscriptionId == null) {
        return undefined;
    }
    return getRestrictionBySubscriptionId(app.subscriptionId);
}
export const getRestrictionBySubscriptionId = async (subscriptionId: string): Promise<Restriction | undefined> => {
    const generalSub = await getSubscriptionById(subscriptionId);
    if (generalSub == undefined) {
        return undefined;
    }
    return getRestriction(generalSub.type);
}

