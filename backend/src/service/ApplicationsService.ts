import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows} from "./helper";
import {ApplicationsEntity} from "../model/ApplicationsEntity";
import {v4 as uuidv4} from 'uuid';

const MAX_CLIENT_SECRET_LENGTH = 60;

export const getApplicationByUserId = async (id: string): Promise<ApplicationsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from applications where owner_id = $1", [id]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return mapApplication(subs[0]);
}

export const updateApplication = async (app: ApplicationsEntity): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update applications set name = $1, redirect_url = $2 where id = $3 returning id",
        [app.name, app.redirectUrl, app.id]);
    const subs = emptyOrRows(result.rows);
    return subs.length === 1;
}
export const getApplicationByUserIdAndAppId = async (id: string, appId: string): Promise<ApplicationsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from applications where owner_id = $1 and id = $2", [id, appId]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return mapApplication(subs[0]);
}

export const createApplication = async (userId: string, subscriptionId: string, stripeSessionId: string | null): Promise<string> => {
    const clientId = uuidv4();
    const clientSecretStr = Buffer.from(uuidv4() + clientId).toString("base64");
    let lettersToTrim = Math.round((clientSecretStr.length - MAX_CLIENT_SECRET_LENGTH) / 2)
    const clientSecret = clientSecretStr.substring(lettersToTrim, clientSecretStr.length - lettersToTrim);
    const result: QueryArrayResult = await db.query("insert into applications(name, client_id, client_secret, subscription_id, stripe_session_id, owner_id, expired_at) values" +
        " ($1, $2, $3, $4, $5, $6, current_date + interval '33 days') returning id", [clientId, clientId, clientSecret, subscriptionId, stripeSessionId, userId]);
    const app = emptyOrRows(result.rows);
    return app[0].id as string;
}

export const updateSubscription = async (userId: string, appId: string, subscriptionId: string, stripeSessionId: string | null): Promise<string> => {
    const clientId = uuidv4();
    const clientSecretStr = Buffer.from(uuidv4() + clientId).toString("base64");
    let lettersToTrim = Math.round((clientSecretStr.length - MAX_CLIENT_SECRET_LENGTH) / 2)
    const clientSecret = clientSecretStr.substring(lettersToTrim, clientSecretStr.length - lettersToTrim);
    const resultDisable: QueryArrayResult = await db.query("update applications set expired_at = current_date + interval '33 days'" +
        ", client_id = $1, client_secret = $2, subscription_id = $3, stripe_session_id = $4 where id = $5 and owner_id = $6 returning id", [clientId, clientSecret, subscriptionId, stripeSessionId, appId, userId]);
    const app = emptyOrRows(resultDisable.rows);
    return app[0].id as string;
}

export const disableApplicationById = async (id: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update applications set expired_at = now() where id = $1 returning id", [id]);
    const subs = emptyOrRows(result.rows);
    return subs.length === 1;
}

const mapApplication = (sub: any): ApplicationsEntity => {
    const app = camelize<ApplicationsEntity>(sub);
    app.active = sub.expired_at == null || new Date(sub.expired_at) > new Date();
    return app;
}