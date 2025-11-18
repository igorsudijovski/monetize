import {ApplicationSubscriptionsEntity} from "../model/ApplicationSubscriptionsEntity";
import {v4 as uuidv4} from "uuid";

export const emptyOrRows = (rows: any): any[] => {
    if (!rows) {
        return [];
    }
    return rows;
}

export const camelize = <T>(obj: any): T => {

    return Object.keys(obj).reduce((res: any, key) => {
        const camel = camelCase(key);
        const uncapitalized = camel.charAt(0).toLowerCase() + camel.slice(1);
        res[uncapitalized] = obj[key];
        return res;
    }, {}) as T;
}

const camelCase = (str: string): string => {
    return str.replace(/[_.-](\w|$)/g, function (_, x) {
        return x.toUpperCase();
    });
}

export const isUUID = (str: string | undefined): boolean => {
    if (str == undefined) {
        return false;
    }
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const match = str.match(regex);
    return match !== null && match.length == 1;
}

export const generateRandomString = (length: number, plusStr: string): string => {
    const randomStr = Buffer.from(uuidv4() + plusStr).toString("base64");
    const lenToTrim = Math.round((randomStr.length - length) / 2);
    return randomStr.substring(lenToTrim, randomStr.length - lenToTrim);
}