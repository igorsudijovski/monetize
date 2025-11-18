import {QueryArrayResult} from "pg";
import db from "../db";
import {emptyOrRows, generateRandomString} from "./helper";


export const createNewAppKey = async (appSubId: string, ownerId: string | null, price: number, fee: number, feePercentage: number): Promise<string> => {
    let key = generateRandomString(15, appSubId);
    const number = 1;
    let isKeyExists = await keyExists(key, appSubId);
    while (isKeyExists) {
        key = key + number;
        isKeyExists = await keyExists(key, appSubId);
    }
    const result: QueryArrayResult = await db.query("insert into application_subscription_keys(app_key, application_subscription_id, owner_id, price, fee, percentage_fee, active) values" +
        " ($1, $2, $3, $4, $5, $6, false) returning id", [key, appSubId, ownerId, price, fee, feePercentage]);
    const app = emptyOrRows(result.rows);
    return app[0].id as string;
}

export const updateAppKeyActive = async (key: string, stripeSessionId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update application_subscription_keys set active = true, stripe_session_id = $1, paid = true where app_key = $2 returning id", [stripeSessionId, key]);
    const app = emptyOrRows(result.rows);
    return app.length === 1;
}

const keyExists = async (key: string, appSubId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscription_keys where app_key = $1 and application_subscription_id = $2", [key, appSubId]);
    const subs = emptyOrRows(result.rows);
    return subs[0].count > 0;
}
