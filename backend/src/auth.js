const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const res = await db.query('SELECT id, email, name FROM users WHERE id=$1', [id]);
    done(null, res.rows[0]);
  } catch (err) { done(err); }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log(accessToken, refreshToken, profile);
    const id = profile.id;
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const name = profile.displayName;
    if (!email) return done(new Error('No email'));

    // upsert user
    // await db.query(`INSERT INTO users (id, email, name) VALUES ($1,$2,$3)
    //   ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name`, [id, email, name]);

    return done(null, { id, email, name });
  } catch (err) {
    console.log(err);
    return done(err);
  }
}));

module.exports = passport;
