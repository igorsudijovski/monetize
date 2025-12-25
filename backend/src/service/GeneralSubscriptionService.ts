import {GeneralSubscriptionsEntity} from "../model/GeneralSubscriptionsEntity";
import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows, roundToTwoDecimal} from "./helper";

export const getSubscriptions = async () : Promise<GeneralSubscriptionsEntity[]> => {
    const result: QueryArrayResult = await db.queryAll("select * from general_subscriptions where (expires_at is null or expires_at < now()) and active is true order by created_at desc");
    const subs = emptyOrRows(result.rows);
    if (result.rowCount == 0) {
        return [];
    }
    return subs.map(row => mapSubscription(row));
}

export const getSubscriptionById = async (id: string): Promise<GeneralSubscriptionsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from general_subscriptions where id = $1", [id]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return mapSubscription(subs[0]);
}

const mapSubscription = (sub: any): GeneralSubscriptionsEntity => {
    if (sub.list_text !== undefined && sub.list_text !== null) {
        sub.percentage = parseFloat(sub.percentage);
        sub.bulletText = sub.list_text.split("\\n");
        sub.list_text = undefined;
    }
    sub.fix_fee = roundToTwoDecimal(sub.fix_fee);
    return camelize<GeneralSubscriptionsEntity>(sub);
}