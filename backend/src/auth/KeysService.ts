import jwt, {PrivateKey, PublicKey} from "jsonwebtoken";
import type {StringValue} from "ms";
import fs from "fs";

const JWT_DURATION: StringValue = '10m';
const REFRESH_DURATION: StringValue = '1d';

export const generateKey = (googleId: string, email: string, userId: string): string => {
    const keys: {privateKey: PrivateKey} = ensureKeys();
    return jwt.sign({
        googleId: googleId,
        email: email
    }, keys.privateKey, { algorithm: 'RS256', expiresIn: JWT_DURATION, notBefore: '0s', subject: userId });
}
export const generateRefresh = (userId: string): string => {
    const keys: {privateKey: PrivateKey} = ensureRefreshKeys();
    return jwt.sign({}, keys.privateKey, { algorithm: 'RS256', expiresIn: REFRESH_DURATION, notBefore: '0s', subject: userId });
}

export const validateRefresh = (token: string): string => {
    const keys: {publicKey: PublicKey} = ensureRefreshKeys();
    const verified =  jwt.verify(token, keys.publicKey, { algorithms: ['RS256'] });
    return verified.sub as string;
}

const ensureKeys = (): {privateKey: string; publicKey: string} => {
    return ensureKeysGeneric('private', 'public');
};
const ensureRefreshKeys = (): {privateKey: string; publicKey: string} => {
    return ensureKeysGeneric('private-refresh', 'public-refresh');
};

const ensureKeysGeneric = (privateKeyName: string, publicKeyName: string): {privateKey: string; publicKey: string} => {
    const path = process.env.KEYS_LOCATION || ''
    if (!fs.existsSync(path) && fs.existsSync(path + '/' + privateKeyName + '.pem') && fs.existsSync(path + '/' + publicKeyName + '.pem')) {
        throw new Error('Keys folder is missing or incomplete.');
    }
    const publicKey = fs.readFileSync(path + '/' + publicKeyName + '.pem', 'utf-8');
    const privateKey = fs.readFileSync(path + '/' + privateKeyName + '.pem', "utf-8");
    return { privateKey, publicKey };
}
