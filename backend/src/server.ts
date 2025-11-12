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
import generalSubscriptionRoute from "./routes/generalSubscriptionRoute";
import applicationRoute from "./routes/applicationRoute";
import dashboardRoute from "./routes/dashboardRoute";
import applicationSubscriptionRoute from "./routes/applicationSubscriptionRoute";

const app = express();
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

dotenv.config();

app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(json());
app.use(cookieParser());

// authRoute
app.use('/auth', authPath);

// userRoute
app.use('/api', userRoute);

app.use('/', refreshTokenRoute);

app.use('/api', logOutRoute);

app.use('/api', applicationRoute)

app.use('/stripe', stripeRoute);

app.use('/general', generalSubscriptionRoute)

app.use('/api/dashboard/:appId', dashboardRoute)

app.use('/api/:appId', applicationSubscriptionRoute)

// default route
app.get('/', (req: Request, res: Response) => {
    res.status(404).json({"message" : "Not Found"})
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
