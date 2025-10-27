import { Request, Response, Router } from 'express';
import requireJwt from '../middleware/requireJwt';
import {UserEntity} from "../model/UserEntity";
import {getSubscriptions} from "../service/GeneralSubscriptionService"; // our middleware to authenticate using JWT

const router = Router();

// mock user info endpoint to return user data
router.get('/subscriptions', async (req: Request, res: Response) => {
    return res.status(200).json(await getSubscriptions())
});

export default router;