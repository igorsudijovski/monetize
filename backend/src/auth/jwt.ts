import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import fs from "fs";
import {getUserByGoogleId, getUserById} from "../service/UserService";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: fs.readFileSync('src/auth/keys/public.pem'),
  algorithm: ["RS256"]
};

async function verify(payload: any, done: VerifiedCallback) {
  /*
    a valid JWT in our system must have `id` and `jwtSecureCode`.
    you can create your JWT like the way you like.
  */
  // bad path: JWT is not valid
  if (!payload?.googleId && !payload?.sub) {
    return done(null, false);
  }

  // try to find a User with the `id` in the JWT payload.
  let user = await getUserByGoogleId(payload.googleId);

  // bad path: User is not found.
  if (!user) {
    user = await getUserById(payload.sub);
  }

  if (!user) {
    return done(null, false);
  }

  return done(null, user);
}

export default new Strategy(options, verify);