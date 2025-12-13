import db from '../db';
import {UserEntity} from "../model/UserEntity";
import {QueryArrayResult} from "pg";
import {camelize, emptyOrRows} from "./helper";

export const getUserById = async (id: string): Promise<UserEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from users where id = $1", [id]);
    if (result.rowCount !== 1) {
        return undefined;
    }
    return mapUser(result);
}

export const updateUserStripeAccountId = async (userId: string, stripeAccountId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update users set stripe_account_id = $1 where id = $2 returning id", [stripeAccountId, userId]);
    const users = emptyOrRows(result.rows);
    return users.length === 1;
}

export const updateOnboardedUser = async (userId: string): Promise<boolean> => {
    const result: QueryArrayResult = await db.query("update users set onboard_complete = true where id = $1 returning id", [userId]);
    const users = emptyOrRows(result.rows);
    return users.length === 1;
}

export const createUser = async (user: UserEntity): Promise<UserEntity> => {
    const result: QueryArrayResult = await db.query(
        "insert into users(email, name, google_id) values ($1, $2, $3) returning id, email, name, google_id",
        [user.email, user.name, user.googleId]
    );
    return mapUser(result);
}

export const getUserByGoogleId = async (googleId: string): Promise<UserEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select * from users where google_id = $1", [googleId]);
    if (result.rowCount !== 1) {
        return undefined;
    }
    return mapUser(result);
}

const mapUser = async (result: QueryArrayResult): Promise<UserEntity> => {
    const users = emptyOrRows(result.rows);
    const user:UserEntity = camelize<UserEntity>(users[0]);
    const appId = await getApplicationIdsByUserId(user.id);
    const appKeys = await getApplicationKeysByUserId(user.id);
    user.applicationId = appId;
    user.applicationSubscriptionIds = appKeys;
    return user;

}

const getApplicationIdsByUserId = async (userId: string): Promise<string | undefined> => {
    const result: QueryArrayResult = await db.query("select id from applications where owner_id = $1", [userId]);
    const rows = emptyOrRows(result.rows);
    if (rows.length === 0) {
        return undefined;
    }
    return rows[0].id;
}

const getApplicationKeysByUserId = async (userId: string): Promise<{id: string, name: string}[]> => {
    const result: QueryArrayResult = await db.query("select distinct app.url_name as id, app.name as name from application_subscription_keys as ask " +
        "left join application_subscriptions as aps on ask.application_subscription_id = aps.id " +
        "left join applications app on aps.application_id = app.id where ask.owner_id = $1 and ask.paid is true", [userId]);
    return emptyOrRows(result.rows);
}
