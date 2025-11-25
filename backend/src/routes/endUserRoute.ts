import {Request, Response, Router} from "express";
import {getAppSubscriptionById, getAppSubscriptions} from "../service/ApplicationSubscriptionService";
import {isUUID} from "../service/helper";
import {createStripePayment, createStripeSubscription, isPaymentSuccessful} from "../service/StripeService";
import {getUserById} from "../service/UserService";
import {getApplicationAppId, getApplicationUrlName} from "../service/ApplicationsService";
import {getSubscriptionById} from "../service/GeneralSubscriptionService";
import {createNewAppKey, updateAppKeyActive} from "../service/KeyService";
import process from "node:process";
import {StripePaymentModel, StripeSubscriptionModel} from "../model/StripePaymentModel";
import requireJwt from "../middleware/requireJwt";
import {UserEntity} from "../model/UserEntity";
import passport from '../auth/passportConfig';

const router = Router();

// Helper middleware for optional authentication
const optionalJwt = (req: Request, res: Response, next: Function) => {
    passport.authenticate('jwtAuth', { session: false }, (err: any, user: any) => {
        if (user) req.user = user;
        next();
    })(req, res, next);
};

router.get('/app/:urlName',  async (req: Request, res: Response) => {
    const app = await getApplicationUrlName(req.params.urlName);
    if (app == undefined || !app.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    const subscriptions = await getAppSubscriptions(app.id);
    const activeSubscriptions = subscriptions.filter(sub => sub.active);
    if (activeSubscriptions.length === 0) {
        return res.status(400).json({message: 'No active subscriptions'})
    }
    return res.status(200).json({app: {id: app.id, name: app.name}, subs: activeSubscriptions});
});

router.get('/app/:appId/buy/:subscriptionId', optionalJwt, async (req: Request, res: Response) => {
    if (!isUUID(req.params.appId) || !isUUID(req.params.subscriptionId)) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    const appSub = await getAppSubscriptionById(req.params.subscriptionId, req.params.appId);
    if (appSub == undefined || !appSub.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    if (appSub.numDays !== undefined && appSub.numDays >= 0) {
        return res.status(400).json({message: 'This is only for non subscription purchases'})
    }

    const app = await getApplicationAppId(req.params.appId);
    if (app == undefined || !app.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }

    const generalAppSub = await getSubscriptionById(app.subscriptionId);
    if (generalAppSub == undefined) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }

    const user = await getUserById(app.ownerId);
    if (user == undefined) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    let stripeAccount: string | null = user.stripeAccountId == undefined ? null : user.stripeAccountId;

    stripeAccount = user.onboardComplete ? stripeAccount : null;
    const percentage = generalAppSub.percentage + (stripeAccount == null ? 25 : 0); //add 25% tax if no stripe account
    const fee = (appSub.price * percentage) + (generalAppSub.fixFee * 100);
    // Use logged-in user id if available
    const buyerId = req.user ? (req.user as UserEntity).id : null;
    const key = await createNewAppKey(appSub.id, buyerId, appSub.price, fee / 100);
    const paymentModel: StripePaymentModel = {
        price: appSub.price * 100,
        fee: fee,
        currency: appSub.currency,
        accountId: stripeAccount,
        appUrl: app.urlName,
        keyId: key,
        productName: app.name + ': ' + appSub.name,
        appSubId: appSub.id,
        appId: app.id
    };
    const url = await createStripePayment(paymentModel);
    return res.redirect(303, url);
});

router.get('/app/:appId/subscribe/:subscriptionId', requireJwt,  async (req: Request, res: Response) => {
    const loggedInUser = req.user as UserEntity;
    if (loggedInUser == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appId) || !isUUID(req.params.subscriptionId)) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    const appSub = await getAppSubscriptionById(req.params.subscriptionId, req.params.appId);
    if (appSub == undefined || !appSub.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }

    if (appSub.numDays === undefined || appSub.numDays == 0) {
        return res.status(400).json({message: 'This is only for subscription purchases'})
    }

    const app = await getApplicationAppId(req.params.appId);
    if (app == undefined || !app.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }

    const generalAppSub = await getSubscriptionById(app.subscriptionId);
    if (generalAppSub == undefined) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }

    const user = await getUserById(app.ownerId);
    if (user == undefined) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    let stripeAccount: string | null = user.stripeAccountId == undefined ? null : user.stripeAccountId;


    stripeAccount = user.onboardComplete ? stripeAccount : null;

    if (stripeAccount == null) {
        return res.status(400).json({message: 'Application owner has no Stripe account'})
    }

    const percentage = generalAppSub.percentage + generalAppSub.fixFee * 100 / appSub.price;
    const fee = (appSub.price * percentage);
    const key = await createNewAppKey(appSub.id, loggedInUser.id, appSub.price, fee / 100);
    const subscriptionModel: StripeSubscriptionModel = {
        priceId: appSub.stripePriceId || '',
        percentage: percentage,
        accountId: stripeAccount,
        appUrl: app.urlName,
        keyId: key,
        appSubId: appSub.id,
        appId: app.id
    };
    const url = await createStripeSubscription(subscriptionModel);
    return res.status(200).json({url: url});
});

router.get('/app/:appId/buy/:subscriptionId/success', async (req: Request, res: Response) => {
    const sessionId = req.query.session_id + '';
    const keyId = req.query.keyId + '';
    const appSubId: string = req.params.subscriptionId;
    const appId = req.params.appId + '';

    const success = await isPaymentSuccessful(sessionId);
    if (success) {
        const pageId = await updateAppKeyActive(keyId, sessionId, appSubId);
        return res.redirect(303, process.env.FRONTEND_URL + `/sub/${appSubId}/keys/${pageId}`);
    }
    return res.redirect(303, process.env.FRONTEND_URL + `/app/${appId}'`);
});



export default router;