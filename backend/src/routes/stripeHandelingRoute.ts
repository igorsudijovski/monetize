import {Request, Response, Router} from 'express';
import requireJwt from "../middleware/requireJwt";
import {disableApplicationById} from "../service/ApplicationsService";
import {getRestrictionByApp, handleApplication} from "./handleApplication";
import {
    disableAllSubscriptions,
    disableByLifeTime,
    disableByNumUsage,
    disableBySubscription,
    disableOneTimeUse
} from "../service/ApplicationSubscriptionService";
import {cancelSubscription, getSubscriptionId} from "../service/StripeService";

const router = Router();

router.get('/subscription/:appId/cancel', requireJwt, async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const restriction = await getRestrictionByApp(app);
    if (restriction == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const subscriptionId = await getSubscriptionId(app.stripeSessionId || '');
    if (subscriptionId == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }

    await disableApplicationById(app.id);
    await disableByNumUsage(app.id, true);
    await disableBySubscription(app.id, true);
    await disableByLifeTime(app.id, true);
    await disableOneTimeUse(app.id, true);
    await disableAllSubscriptions(app.id);
    await cancelSubscription(subscriptionId);
    return res.status(200).json({message: 'Subscription cancelled'});
});

// router.get('/subscription/success', async (req: Request, res: Response) => {
//     try {
//         const session = await stripeRoute.checkout.sessions.retrieve(req.query.sessionId + '', {expand: ['payment_intent']});
//         if (session.status == 'complete') {
//             const userId = req.query.userId + '';
//             const subscriptionId = req.query.appId + '';
//             await createApplication(userId, subscriptionId, session.id);
//             return res.redirect(303, process.env.FRONTEND_URL + '/auth/dashboard');
//         }
//         return res.status(400).json({ message: 'Invalid payment' });
//     } catch (error) {
//         return res.status(400).json({ message: 'Invalid payment', error });
//     }
//
// });
//
// router.get('/subscription/success/:id', async (req: Request, res: Response) => {
//     try {
//         const session = await stripeRoute.checkout.sessions.retrieve(req.params.id + '', {expand: ['invoice']});
//         const sub = await stripeRoute.subscriptions.retrieve(session.subscription as string);
//         const bbbb = await stripeRoute.subscriptions.list({
//             customer: session.customer as string,
//             limit: 1
//         });
//         const paymentIntent = await stripeRoute.paymentIntents.retrieve(
//             session.payment_intent as string
//         );
//         const tr = await stripeRoute.balanceTransactions.list({source: "ch_3SPXKgLAO7oNOYUf0CPNevCk"})
//         if (session.status == 'complete') {
//             return res.status(200).json({pp: paymentIntent, bb: bbbb, s: session, b: tr, sub: sub});
//         }
//     } catch (error) {
//         return res.status(400).json({ message: 'Invalid payment', error });
//     }
//
// });




export default router;