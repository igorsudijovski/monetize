import {QueryArrayResult} from "pg";
import db from "../db";
import {emptyOrRows} from "./helper";
import camelize from "camelize-ts";
import {ApplicationsEntity} from "../model/ApplicationsEntity";
import {v4 as uuidv4} from 'uuid';
import {GeneralSubscriptionsType} from "../model/GeneralSubscriptionsType";

export const getApplicationByUserId = async (id: string): Promise<ApplicationsEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from applications where owner_id = $1", [id]);
    const subs = emptyOrRows(result.rows);
    if (subs.length !== 1) {
        return undefined;
    }
    return mapApplication(subs[0]);
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
    const clientSecret = Buffer.from(uuidv4() + clientId).toString("base64");
    const result: QueryArrayResult = await db.query("insert into applications(name, client_id, client_secret, subscription_id, stripe_session_id, owner_id, started_at) values" +
        " ($1, $2, $3, $4, $5, $6, now()) returning id", [clientId, clientId, clientSecret, subscriptionId, stripeSessionId, userId]);
    const app = emptyOrRows(result.rows);
    return app[0].id as string;
}

const mapApplication = (sub: any): ApplicationsEntity => {
    return camelize<ApplicationsEntity>(sub);
}