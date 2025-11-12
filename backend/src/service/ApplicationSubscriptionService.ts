import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows} from "./helper";
import {ApplicationSubscriptionsEntity} from "../model/ApplicationSubscriptionsEntity";

export const getAppSubscriptions = async (appId: string) : Promise<ApplicationSubscriptionsEntity[]> => {
    const result: QueryArrayResult = await db.query("select * from application_subscriptions where application_id = $1 order by order_number", [appId]);
    const subs = emptyOrRows(result.rows);
    if (result.rowCount == 0) {
        return [];
    }
    return subs.map(row => mapSubscription(row));
}

export const getAppSubscriptionById = async (id: string, appId: string): Promise<ApplicationSubscriptionsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from application_subscriptions where id = $1 and application_id = $2 order by order_number", [id, appId]);
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
    const result: QueryArrayResult = await db.query("select count(*) from application_subscriptions where application_id = $1 ", [appId]);
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

export const swapAppSubscriptionOrder = async (appId: string, id: string, orderNumber: number, left: boolean): Promise<boolean> => {
    const newOrderNumber = left ? orderNumber - 1 : orderNumber + 1;
    const otherAppSubId = await getAppIdByOrderNumber(appId, newOrderNumber);
    if (otherAppSubId === undefined) {
        return false;
    }
    await db.query("update application_subscriptions set order_number = $1 where id = $2", [newOrderNumber, id]);
    await db.query("update application_subscriptions set order_number = $1 where id = $2", [orderNumber, otherAppSubId]);
    return true;
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
const getAppIdByOrderNumber = async (appId: string, orderNumber: number): Promise<string | undefined> => {
    const result: QueryArrayResult = await db.query("select id from application_subscriptions where application_id = $1 and order_number = $2", [appId, orderNumber]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return subs[0].id;
};

