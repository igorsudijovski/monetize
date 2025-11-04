import {QueryArrayResult} from "pg";
import db from "../db";
import {emptyOrRows} from "./helper";
import {RevenuePerApp} from "../model/RevenuePerApp";

export const getRevenue = async (appId: string): Promise<RevenuePerApp[]> => {
    const result: QueryArrayResult = await db.query("select app.id, app.name, k.net, k.exchange_rate " +
        "from application_subscriptions as app " +
        "left join application_subscription_keys as k on app.id = k.application_subscription_id " +
        "where app.application_id = $1", [appId]);
    const revenues = emptyOrRows(result.rows);
    const values: Map<string, RevenuePerApp> = new Map();
    revenues.forEach(revenue => {
        const id: string = revenue[0];
        const name: string = revenue[1];
        const net: number = revenue[2];
        const exchangeRate: number = revenue[3];
        const amount = net / exchangeRate;
        let alreadySet = false;
        if (values.has(id) && values.get(id) != undefined) {
            const currentRevenue = values.get(id);
            if (currentRevenue) {
                currentRevenue.revenue = currentRevenue.revenue + amount;
                currentRevenue.totalNumber = currentRevenue.totalNumber + 1;
                values.set(id, currentRevenue);
            }
        }
        if (!alreadySet) {
            values.set(id, {subId: id, name, revenue: amount, totalNumber: 1})
        }
    })
    return Array.from(values.values());
}