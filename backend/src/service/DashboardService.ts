import {QueryArrayResult} from "pg";
import db from "../db";
import {camelize, emptyOrRows} from "./helper";
import {RevenuePerApp} from "../model/RevenuePerApp";
import {PaginationModel} from "../model/PaginationModel";
import {DashboardKeysEntity} from "../model/DashboardKeysEntity";

export const getRevenue = async (appId: string): Promise<RevenuePerApp[]> => {
    const result: QueryArrayResult = await db.query("select app.id, app.name, k.net, k.exchange_rate " +
        "from application_subscriptions as app " +
        "left join application_subscription_keys as k on app.id = k.application_subscription_id " +
        "where app.application_id = $1", [appId]);
    const revenues = emptyOrRows(result.rows);
    const values: Map<string, RevenuePerApp> = new Map();
    revenues.forEach(revenue => {
        const id: string = revenue.id;
        const name: string = revenue.name;
        const net: number = revenue.net;
        const exchangeRate: number = revenue.exchange_rate;
        let amount = -1;
        if (net !== null) {
            if (exchangeRate === null || exchangeRate === 0) {
                amount = net;
            } else
                amount = net / exchangeRate;
        }
        let alreadySet = false;
        if (values.has(id) && values.get(id) != undefined) {
            const currentRevenue = values.get(id);
            if (currentRevenue) {
                currentRevenue.revenue = currentRevenue.revenue + amount;
                currentRevenue.totalNumber = currentRevenue.totalNumber + 1;
                values.set(id, currentRevenue);
                alreadySet = true;
            }
        }
        if (!alreadySet) {
            const totalNumber = amount === -1 ? 0 : 1;
            const totalAmount = amount === -1 ? 0 : amount;
            values.set(id, {subId: id, name, revenue: totalAmount, totalNumber: totalNumber})
        }
    })
    return Array.from(values.values());
}
export const getIssuedKeysThisMonth = async (appId: string): Promise<number> => {
    const result: QueryArrayResult = await db.query("select count(*) " +
        "from application_subscriptions as app " +
        " left join application_subscription_keys as k on app.id = k.application_subscription_id " +
        " where app.application_id = $1 and k.created_at >= date_trunc('month', current_date)", [appId]);
    const count = emptyOrRows(result.rows);
    if (count.length !== 1) {
        return 0;
    }
    return parseInt(count[0].count);
}

export const getActiveKeys = async (appId: string, page: number, limit: number, subscriptionTitle: string | undefined, searchStr: string | undefined, desc = true): Promise<PaginationModel<DashboardKeysEntity>> => {
    return getKeys("k.active is true and (k.expires_at > now() or k.expires_at is null)", appId, page, limit, subscriptionTitle, searchStr, desc);
}

export const getInactiveKeys = async (appId: string, page: number, limit: number, subscriptionTitle: string | undefined, searchStr: string | undefined, desc = true): Promise<PaginationModel<DashboardKeysEntity>> => {
    return getKeys("k.active is false or (k.expires_at <= now())", appId, page, limit, subscriptionTitle, searchStr, desc);
}

const getKeys = async (whereClause: string, appId: string, page: number, limit: number, subscriptionId: string | undefined, searchStr: string | undefined, desc = true): Promise<PaginationModel<DashboardKeysEntity>> => {
    let selectQuery = "select k.id, k.app_key, k.num_usages, k.active, k.expires_at, k.last_used_at, k.created_at, apps.name ";
    let query = " from application_subscription_keys as k left join application_subscriptions as apps on k.application_subscription_id = apps.id ";
    query += " where " + whereClause + " and apps.application_id = $1 ";
    const params: any[] = [appId];
    let index = 2;
    if (subscriptionId !== undefined) {
        query += " and apps.id = $" + index + " ";
        index++;
        params.push(subscriptionId);
    }
    if (searchStr !== undefined) {
        query += " and k.app_key like $" + index + " ";
        index++;
        params.push(`%${searchStr}%`);
    }
    const queryNoPaging = query;
    const offset = (page - 1) * limit;
    query += " order by k.created_at " + (desc ? "desc" : "asc") + " limit $" + index + " offset $" + (index + 1);
    params.push(limit);
    params.push(offset);
    const result: QueryArrayResult = await db.query(selectQuery + query, params);
    const keys = emptyOrRows(result.rows);
    const mappedKeys: DashboardKeysEntity[] = keys.map((key: any) => camelize<DashboardKeysEntity>(key));
    const countResult: QueryArrayResult = await db.query("select count(*) " + queryNoPaging, params.slice(0, params.length - 2));
    const countRows = emptyOrRows(countResult.rows);
    if (countRows.length !== 1) {
        return {
            items: [],
            totalItems: 0,
            currentPage: page,
            totalPages: 0,
            limit: limit
        };
    }
    const totalItems = parseInt(countRows[0].count);
    return {
        items: mappedKeys,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        limit: limit
    };
}






