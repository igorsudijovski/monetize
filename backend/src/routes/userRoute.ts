import {Request, Response, Router} from 'express';
import requireJwt from '../middleware/requireJwt';
import {UserEntity} from "../model/UserEntity";
import {cancelSubscription, createStripeCustomer, getSubscriptionId, onBoarding} from "../service/StripeService";
import {updateOnboardedUser, updateUserStripeAccountId} from "../service/UserService";
import {
    invalidateKey,
    getAllUserKeys,
    getKeyByPageIdAndUrlName,
    getSessionKeyId,
    useKey, getKeyById
} from "../service/KeyService";
import Stripe from "stripe";
import process from "node:process"; // our middleware to authenticate using JWT

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
const router = Router();

const INVALID_TOKEN_VIEW_TIME = 7; // days

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

router.get("/app/:urlName/keys", requireJwt, async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const keys = await getAllUserKeys(user.id, req.params.urlName);
    return res.status(200).json(keys);
});

router.get("/app/:urlName/key/:pageId", async (req: Request, res: Response) => {
    const key = await getKeyByPageIdAndUrlName(req.params.pageId, req.params.urlName);
    if (key === undefined || key == null) {
        return res.status(404).json({message: 'Key not found'});
    }
    if (key.expiresAt && key.expiresAt < new Date() && key.active) {
        await invalidateKey(key.id);
        key.active = false;
    }
    if (!key.active && key.lastUsedAt && (new Date(key.lastUsedAt.getTime() + INVALID_TOKEN_VIEW_TIME * 24 * 60 * 60 * 1000) < new Date())) {
        return res.status(404).json({message: 'Key not found'});
    }
    return res.status(200).json(key);
});

router.post("/app/:urlName/key/:keyId/use", async (req: Request, res: Response) => {
    const key = await getKeyById(req.params.keyId)
    if (key === undefined || key == null) {
        return res.status(404).json({message: 'Key not found'});
    }
    if (key.appUrlName !== req.params.urlName) {
        return res.status(404).json({message: 'Key not found'});
    }
    if (!key.active) {
        return res.status(400).json({message: 'Key is not active or has expired'});
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
        await invalidateKey(req.params.keyId);
        return res.status(400).json({message: 'Key has expired'});
    }

    const success = await useKey(req.params.keyId);
    if (!success) {
        return res.status(400).json({message: 'Failed to use key'});
    }
    const keyType = getKeyType(key);
    if (keyType === 'usage' && key.usageLimit) {
        if (key.usageLimit -1 === key.numUsages) {
            await invalidateKey(req.params.keyId);
        }
    }
    if (keyType === 'one-time') {
        await invalidateKey(req.params.keyId);
    }
    return res.status(200).json({message: 'Key used successfully'});
});

router.post("/key/:keyId/cancel", requireJwt, async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const sessionId = await getSessionKeyId(req.params.keyId);
    if (sessionId == null) {
        return res.status(400).json({message: 'Failed to cancel subscription'});
    }
    const sub = await getSubscriptionId(sessionId);
    if (sub == null) {
        return res.status(400).json({message: 'Failed to cancel subscription'});
    }
    const success = await invalidateKey(req.params.keyId);
    if (!success) {
        return res.status(400).json({message: 'Failed to cancel subscription'});
    }
    await cancelSubscription(sub);
    return res.status(200).json({message: 'Subscription cancelled successfully'});
});

const getKeyType = (key: any) => {
    if (key.usageLimit != null && key.usageLimit > 0) {
        return 'usage';
    }
    if (key.numDays != null && key.numDays > 0) {
        return 'subscription';
    }
    if (key.isLifetime) {
        return 'lifetime';
    }
    return 'one-time';
}

export default router;