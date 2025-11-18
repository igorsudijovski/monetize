import {Request, Response, Router} from "express";
import {getAppSubscriptionById, getAppSubscriptions} from "../service/ApplicationSubscriptionService";
import {isUUID} from "../service/helper";
import {createStripePayment, onBoarding} from "../service/StripeService";
import {getUserById} from "../service/UserService";
import {getApplicationAppId} from "../service/ApplicationsService";
import {getSubscriptionById} from "../service/GeneralSubscriptionService";
import {createNewAppKey, updateAppKeyActive} from "../service/KeyService";
import Stripe from "stripe";
import process from "node:process";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {apiVersion: '2022-11-15'});

const router = Router();

router.get('/app/:appId',  async (req: Request, res: Response) => {
    if (!isUUID(req.params.appId)) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    const app = await getApplicationAppId(req.params.appId);
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

router.get('/app/:appId/buy/:subscriptionId',  async (req: Request, res: Response) => {
    if (!isUUID(req.params.appId) || !isUUID(req.params.subscriptionId)) {
        return res.status(400).json({message: 'Invalid Application Id'})
    }
    const appSub = await getAppSubscriptionById(req.params.subscriptionId, req.params.appId);
    if (appSub == undefined || !appSub.active) {
        return res.status(400).json({message: 'Invalid Application Id'})
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

    if (user.stripeAccountId == null || user.stripeAccountId.trim().length === 0) {
        return res.status(500).json({message: 'App not setup properly'});
    }
    const stripeAccount = user.stripeAccountId;
    const percentage = generalAppSub.percentage;
    const fee = appSub.price * percentage;
    const key = await createNewAppKey(appSub.id, null, appSub.price, fee / 100, generalAppSub.percentage)
    const url = await createStripePayment(appSub.price * 100, fee, stripeAccount, appSub.currency, app.id, key, app.name + ': ' + appSub.name, appSub.id, app.id);
    return res.status(200).json({url: url});
});

router.get("/onboarding", async (req: Request, res: Response) => {
    const url = await onBoarding('acct_1STks9LpjZZ5katJ');
    return res.status(200).json({url: url});
})
router.get("/onboarding/success", async (req: Request, res: Response) => {
    return res.status(200).json({message: 'Onboarding successful. You can close this window now.'});
})



router.get('/app/:appId/buy/:subscriptionId/success', async (req: Request, res: Response) => {
    const sessionId = req.query.session_id + '';
    const keyId = req.query.keyId + '';

    const data = await stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent']});
    const paymentIntent = data.payment_intent as Stripe.PaymentIntent;
    const trans = await stripe.balanceTransactions.list({source: paymentIntent.latest_charge as string});

    // await updateAppKeyActive(keyId, sessionId);
    return res.status(200).json({data: data, trans: trans});
});



export default router;