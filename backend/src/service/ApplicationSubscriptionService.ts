import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows} from "./helper";
import {ApplicationSubscriptionsEntity} from "../model/ApplicationSubscriptionsEntity";

export const getAppSubscriptions = async (appId: string) : Promise<ApplicationSubscriptionsEntity[]> => {
    const result: QueryArrayResult = await db.query("select * from application_subscriptions where application_id = $1 and disabled = false order by order_number", [appId]);
    const subs = emptyOrRows(result.rows);
    if (result.rowCount == 0) {
        return [];
    }
    return subs.map(row => mapSubscription(row));
}

export const getAppSubscriptionById = async (id: string, appId: string): Promise<ApplicationSubscriptionsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from application_subscriptions where id = $1 and application_id = $2 and disabled = false", [id, appId]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return mapSubscription(subs[0]);
}

export const deleteAppSubscriptionById = async (id: string, appId: string): Promise<void> => {
    await db.query("delete from application_subscriptions where id = $1 and application_id = $2", [id, appId]);
}

export const hasBoughtSubscription = async (appId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscription_keys where application_subscription_id = $1", [appId]);
    const subs = emptyOrRows(result.rows);
    return subs[0].count > 0;
}
export const numberOfAppSubscriptions = async (appId: string): Promise<number> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscriptions where application_id = $1 and disabled = false", [appId]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return 0;
    }
    return subs[0].count;
}
export const numberOfActiveAppSubscriptions = async (appId: string): Promise<number> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscriptions where application_id = $1 and disabled = false and active = true", [appId]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return 0;
    }
    return subs[0].count;
}

export const updateActiveAppSubscription = async (id: string, active: boolean): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set active = $1 where id = $2 returning id", [active, id]);
    const subs = emptyOrRows(result.rows);
    return subs.length === 1;

}

export const createAppSubscription = async (appId: string, appSub: ApplicationSubscriptionsEntity): Promise<ApplicationSubscriptionsEntity> => {
    const orderNumber = await getNextOrderNumber(appId);
    const result: QueryArrayResult = await db.query("insert into application_subscriptions (name, description, list_text, price, currency, application_id, order_number, one_time_use, num_days, num_usages, is_lifetime, created_at) " +
        " values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now()) returning id", [
        appSub.name,
        appSub.description,
        appSub.bulletText ? appSub.bulletText.join("\\n") : null,
        appSub.price,
        'eur',
        appId,
        orderNumber,
        appSub.oneTimeUse,
        appSub.numDays,
        appSub.numUsages,
        appSub.isLifetime
    ]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        throw new Error('Failed to create subscription');
    }
    const createdId = subs[0].id;
    const createdSub = await getAppSubscriptionById(createdId, appId);
    if (createdSub === undefined) {
        throw new Error('Failed to retrieve created subscription');
    }
    return createdSub;
}

export const updateAppSubscription = async (id: string, appSub: ApplicationSubscriptionsEntity): Promise<boolean> => {
    await db.query("update application_subscriptions set name = $1, description = $2, list_text = $3, price = $4 where id = $5 returning id", [
        appSub.name,
        appSub.description,
        appSub.bulletText ? appSub.bulletText.join("\\n") : null,
        appSub.price,
        id
    ]);
    return true;
}

export const swapAppSubscriptionOrder = async (appId: string, firstAppId: string, secondAppId: string): Promise<boolean> => {
    const appSub = await getAppSubscriptionById(firstAppId, appId);
    const otherAppSub = await getAppSubscriptionById(secondAppId, appId);
    if (appSub === undefined || otherAppSub === undefined) {
        return false;
    }
    await db.query("update application_subscriptions set order_number = $1 where id = $2", [otherAppSub.orderNumber, appSub.id]);
    await db.query("update application_subscriptions set order_number = $1 where id = $2", [appSub.orderNumber, otherAppSub.id]);
    return true;
}

export const disableBySubscription = async (appId: string, disabled: boolean) : Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set disabled = $2 where application_id = $1 and num_days > 0  returning id", [appId, disabled]);
    const subs = emptyOrRows(result.rows);
    return subs.length > 0;
}

export const disableByNumUsage = async (appId: string, disabled: boolean) : Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set disabled = $2 where application_id = $1 and num_usages > 0  returning id", [appId, disabled]);
    const subs = emptyOrRows(result.rows);
    return subs.length > 0;
}
export const disableByLifeTime = async (appId: string, disabled: boolean) : Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set disabled = $2 where application_id = $1 and is_lifetime is true  returning id", [appId, disabled]);
    const subs = emptyOrRows(result.rows);
    return subs.length > 0;
}
export const disableOneTimeUse = async (appId: string, disabled: boolean) : Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set disabled = $2 where application_id = $1 and one_time_use is true  returning id", [appId, disabled]);
    const subs = emptyOrRows(result.rows);
    return subs.length > 0;
}

export const disableAllSubscriptions = async (appId: string) : Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscriptions set active = false where application_id = $1  returning id", [appId]);
    const subs = emptyOrRows(result.rows);
    return subs.length > 0;
}

const mapSubscription = (sub: any): ApplicationSubscriptionsEntity => {
    if (sub.list_text !== undefined && sub.list_text !== null && sub.list_text.length > 0) {
        sub.bulletText = sub.list_text.split("\\n");
        sub.list_text = undefined;
    }
    return camelize<ApplicationSubscriptionsEntity>(sub);
}

const getNextOrderNumber = async (appId: string): Promise<number> => {
    const result: QueryArrayResult = await db.query("select coalesce(max(order_number), 1) as max_order from application_subscriptions where application_id = $1", [appId]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return 1;
    }
    return subs[0].max_order + 1;
}

