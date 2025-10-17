import { Request, Response, Router } from 'express';
import requireJwt from '../middleware/requireJwt';
import {UserEntity} from "../model/UserEntity"; // our middleware to authenticate using JWT

const router = Router();

// mock user info endpoint to return user data
router.get('/', requireJwt, (req: Request, res: Response) => {
    try {
        /*
           The requireJwt middleware authenticates the request by verifying
           the accessToken. Once authenticated, it attaches the User object
           to req.user (see `jwt.ts`), making it availabe in the subsequent route handlers,
           like those in userRoute.
        */
        // req.user is populated after passing through the requireJwt
        // middleware
        const user = req.user as UserEntity;

        // it is a mock, you MUST return only the necessary info :)
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching user info', error });
    }
});

export default router;