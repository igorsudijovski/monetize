import {QueryArrayResult} from "pg";
import db from "../db";
import {emptyOrRows, generateRandomString} from "./helper";


export const createNewAppKey = async (appSubId: string, ownerId: string | null, price: number, fee: number): Promise<string> => {
    let key = generateRandomString(15, appSubId);
    let number = 0;
    let isKeyExists = await keyExists(key, appSubId);
    while (isKeyExists) {
        key = generateRandomString(15 + number, appSubId + number);
        isKeyExists = await keyExists(key, appSubId);
        number++;
    }
    const result: QueryArrayResult = await db.query("insert into application_subscription_keys(app_key, application_subscription_id, owner_id, price, fee, net) values" +
        " ($1, $2, $3, $4, $5) returning id", [key, appSubId, ownerId, price, fee, price - fee]);
    const app = emptyOrRows(result.rows);
    return app[0].id as string;
}

export const updateAppKeyActive = async (keyId: string, stripeSessionId: string, appSubId: string): Promise<string> => {
    let pageId = generateRandomString(25, keyId);
    let number = 0;
    let isPageIdExists = await pageIdExists(pageId, appSubId);
    while (isPageIdExists) {
        pageId = generateRandomString(25 + number, keyId);
        isPageIdExists = await pageIdExists(pageId, appSubId);
        number++;
    }
    await db.query("update application_subscription_keys set active = true, stripe_session_id = $1, page_id = $3, paid = true where id = $2 returning id", [stripeSessionId, keyId, pageId]);
    return pageId;
}

const keyExists = async (key: string, appSubId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscription_keys where app_key = $1 and application_subscription_id = $2", [key, appSubId]);
    const subs = emptyOrRows(result.rows);
    return subs[0].count > 0;
}

const pageIdExists = async (pageId: string, appSubId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("select count(*) from application_subscription_keys where page_id = $1 and application_subscription_id = $2", [pageId, appSubId]);
    const subs = emptyOrRows(result.rows);
    return subs[0].count > 0;
}
