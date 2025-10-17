// google.ts
import {Profile, Strategy as GoogleStrategy, VerifyCallback} from 'passport-google-oauth20';
import {createUser, getUserByGoogleId} from "../service/UserService";

const options = {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
};

async function verify(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    try {

        let user = await getUserByGoogleId(profile.id);
        const email = profile.emails?.[0]?.value || ''
        const name = profile.name != null ? profile.name.familyName + " " + profile.name.givenName : '';

        if (user === undefined) {
            user = await createUser({
                id: '', // assuming id is auto-generated
                email: email,
                name: name,
                googleId: profile.id
            });
        }
        return done(null, {userId: user.id});
    } catch (error) {
        return done(error as Error);
    }
}

export default new GoogleStrategy(options, verify);