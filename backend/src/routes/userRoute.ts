import { Request, Response, Router } from 'express';
import requireJwt from '../middleware/requireJwt';
import {UserEntity} from "../model/UserEntity";
import {createStripeCustomer, onBoarding} from "../service/StripeService";
import {updateOnboardedUser, updateUserStripeAccountId} from "../service/UserService";
import Stripe from "stripe";
import process from "node:process"; // our middleware to authenticate using JWT

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
const router = Router();

// mock user info endpoint to return user data
router.get('/user', requireJwt, (req: Request, res: Response) => {
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

router.get("/onboarding", requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    if (user.stripeAccountId == null || user.stripeAccountId.trim().length === 0) {
        const stripeId = await createStripeCustomer(user.email);
        await updateUserStripeAccountId(user.id, stripeId);
        user.stripeAccountId = stripeId;
    }
    const url = await onBoarding(user.stripeAccountId, user.id);
    return res.status(200).json({url: url});
})
router.get("/onboarding/success", async (req: Request, res: Response) => {
    const account = await stripe.accounts.retrieve(req.query.accountId + '');
    if (account.charges_enabled) {
        await updateOnboardedUser(req.query.userId + '');
    }
    stripe.accounts.createLoginLink(req.query.accountId + '').then(link => {
        console.log('Login link:', link.url);
    }).catch(err => {
        console.error('Error creating login link:', err);
    });
    return res.redirect(303, process.env.FRONTEND_URL + '/auth/dashboard');
})

router.get("/connect-url", requireJwt, async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    if (user.stripeAccountId == null || user.stripeAccountId.trim().length === 0 || !user.onboardComplete) {
        return res.status(400).json({message: 'User has not been onboarded'});
    }
    const link = await stripe.accounts.createLoginLink(user.stripeAccountId);
    return res.status(200).json({url: link.url});
});


export default router;