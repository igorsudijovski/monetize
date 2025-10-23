import logOutRoute from "./routes/logOutRoute";

require('dotenv').config();
import express, {Request, Response} from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import authPath from './routes/authGoogle';
import userRoute from "./routes/userRoute";
import refreshTokenRoute from "./routes/tokenRefresh";
import cookieParser from "cookie-parser";
import stripeRoute from "./routes/stripeRoute";

const app = express();
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

dotenv.config();

app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(json());
app.use(cookieParser());
//
// // raw body for stripe webhook
// app.use((req, res, next) => {
//   if (req.originalUrl === '/api/payments/webhook') return next();
//   express.json()(req, res, next);
// });
//
// // app.use(session({ name: 'session', keys: [process.env.SESSION_SECRET || 'secret'], maxAge: 24*60*60*1000 }));
// app.use(passport.initialize());
// app.use(passport.session());
//
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: '/auth/failure' }), (req, res) => {
//   res.redirect(FRONTEND + '/dashboard');
// });
// app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure' }), (req, res) => {
//   res.redirect(FRONTEND + '/dashboard');
// });
// app.get('/auth/failure', (req, res) => res.status(401).send('Auth failed'));
//
// app.use('/api/payments', payments);
// app.use('/api/products', products);
// app.use('/api/licenses', licenses);
//
// app.get('/health', (req, res) => res.json({ ok: true }));
//

// authRoute
app.use('/auth', authPath);

// userRoute
app.use('/api', userRoute);

app.use('/', refreshTokenRoute);

app.use('/api', logOutRoute);

app.use('/stripe', stripeRoute);

// default route
app.get('/', (req: Request, res: Response) => {
    res.send('welcome to the Google OAuth 2.0 + JWT Node.js app!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
