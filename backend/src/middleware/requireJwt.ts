import passport from '../auth/passportConfig';  // import passport from our custom passport file

// requireJwt middleware to authenticate the request using JWT
const requireJwt = passport.authenticate('jwtAuth', { session: false });

export default requireJwt