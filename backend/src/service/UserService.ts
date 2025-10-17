import db from '../db';
import {UserEntity} from "../model/UserEntity";
import {QueryArrayResult} from "pg";
import {emptyOrRows} from "./helper";

export const getUserById = async (id: string): Promise<UserEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select id, email, name, google_id from users where id = $1", [id]);
    if (result.rowCount !== 1) {
        return undefined;
    }
    return mapUser(result);
}

export const createUser = async (user: UserEntity): Promise<UserEntity> => {
    const result: QueryArrayResult = await db.query(
        "insert into users(email, name, google_id) values ($1, $2, $3) returning id, email, name, google_id",
        [user.email, user.name, user.googleId]
    );
    return mapUser(result);
}

export const getUserByGoogleId = async (googleId: string): Promise<UserEntity | undefined> => {
    const result: QueryArrayResult = await db.query("select id, email, name, google_id from users where google_id = $1", [googleId]);
    if (result.rowCount !== 1) {
        return undefined;
    }
    return mapUser(result);
}

const mapUser = (result: QueryArrayResult): UserEntity => {
    const users = emptyOrRows(result.rows);
    return {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        googleId: users[0].google_id
    }
}