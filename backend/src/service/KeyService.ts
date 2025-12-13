import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows, generateRandomString} from "./helper";
import {ApplicationKeyEntity} from "../model/ApplicationKeyEntity";


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
        " ($1, $2, $3, $4, $5, $6) returning id", [key, appSubId, ownerId, price, fee, (price - fee)]);
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

export const getKeyByPageIdAndUrlName = async (pageId: string, urlName: string): Promise<ApplicationKeyEntity | undefined> => {
    const result: QueryArrayResult = await db.query(
        `select 
            ask.id,
            ask.app_key,
            ask.num_usages,
            ask.active,
            ask.expires_at,
            ask.last_used_at,
            ask.created_at,
            ask.price,
            ask.owner_id,
            asub.id as subscription_id,
            asub.name as subscription_name,
            asub.description as subscription_description,
            asub.num_days,
            asub.num_usages as usage_limit,
            asub.is_lifetime,
            app.id as app_id,
            app.name as app_name,
            app.url_name as app_url_name
         from application_subscription_keys ask
         join application_subscriptions asub on ask.application_subscription_id = asub.id
         join applications app on asub.application_id = app.id
         where ask.page_id = $1 and ask.paid = true and app.url_name = $2`,
        [pageId, urlName]
    );
    const keys = emptyOrRows(result.rows);
    if (keys.length === 0) return undefined;
    return camelize(keys[0]);
}

export const getAllUserKeys = async (userId: string, urlName: string): Promise<ApplicationKeyEntity[]> => {
    const result: QueryArrayResult = await db.query(
        `select 
            ask.id,
            ask.app_key,
            ask.num_usages,
            ask.active,
            ask.expires_at,
            ask.last_used_at,
            ask.created_at,
            ask.price,
            ask.page_id,
            asub.id as subscription_id,
            asub.name as subscription_name,
            asub.description as subscription_description,
            asub.num_days,
            asub.num_usages as usage_limit,
            asub.is_lifetime,
            app.id as app_id,
            app.name as app_name,
            app.url_name as app_url_name
         from application_subscription_keys ask
         join application_subscriptions asub on ask.application_subscription_id = asub.id
         join applications app on asub.application_id = app.id
         where ask.owner_id = $1 and ask.paid = true and app.url_name = $2
         order by ask.created_at desc`,
        [userId, urlName]
    );
    return emptyOrRows(result.rows);
}
export const getKeyById = async (keyId: string): Promise<ApplicationKeyEntity | null> => {
    const result: QueryArrayResult = await db.query(
        `select 
            ask.id,
            ask.app_key,
            ask.num_usages,
            ask.active,
            ask.expires_at,
            ask.last_used_at,
            ask.created_at,
            ask.price,
            ask.page_id,
            asub.id as subscription_id,
            asub.name as subscription_name,
            asub.description as subscription_description,
            asub.num_days,
            asub.num_usages as usage_limit,
            asub.is_lifetime,
            app.id as app_id,
            app.name as app_name,
            app.url_name as app_url_name
         from application_subscription_keys ask
         join application_subscriptions asub on ask.application_subscription_id = asub.id
         join applications app on asub.application_id = app.id
         where ask.id = $1`,
        [keyId]
    );
    const rows = emptyOrRows(result.rows);
    if (rows.length !== 1) {
        return null;
    }
    return camelize(rows[0]);
}

export const useKey = async (keyId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query(
        "update application_subscription_keys set num_usages = num_usages + 1, last_used_at = now() where id = $1 returning id",
        [keyId]
    );
    return emptyOrRows(result.rows).length > 0;
}

export const invalidateKey = async (keyId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query(
        "update application_subscription_keys set active = false, expires_at = now() where id = $1 returning id",
        [keyId]
    );
    return emptyOrRows(result.rows).length > 0;
}

export const getOwnerByKeyId = async (keyId: string): Promise<string | null> => {
    const result: QueryArrayResult = await db.query(
        "select owner_id from application_subscription_keys where id = $1",
        [keyId]
    );
    const keys = emptyOrRows(result.rows);
    if (keys.length === 0) return null;
    return keys[0].owner_id;
}
export const getSessionKeyId = async (keyId: string): Promise<string | null> => {
    const result: QueryArrayResult = await db.query(
        "select stripe_session_id from application_subscription_keys where id = $1",
        [keyId]
    );
    const keys = emptyOrRows(result.rows);
    if (keys.length === 0) return null;
    return keys[0].stripe_session_id;
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
