import {Request, Response, Router} from 'express';
import Stripe from 'stripe';
import {getSubscriptionById} from "../service/GeneralSubscriptionService";
import requireJwt from "../middleware/requireJwt";
import {createApplication, getApplicationByUserId, updateSubscription} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";
import * as process from "node:process";
import {getRestrictionBySubscriptionId} from "./handleApplication";
import {
    disableByLifeTime,
    disableByNumUsage,
    disableBySubscription,
    disableOneTimeUse
} from "../service/ApplicationSubscriptionService";
import {isPaymentSuccessful} from "../service/StripeService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

const router = Router();

router.get('/subscription/pay', requireJwt, async (req: Request, res: Response) => {
    const subId = req.query.id + '';
    let subscription = undefined;
    try {
        subscription = await getSubscriptionById(subId);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Wrong id' });
    }

    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const application = await getApplicationByUserId(user.id);
    if (application !== undefined && application.active) {
        return res.status(400).json({message: 'Already have subscription, first cancel it and then buy new subscription. Everything will be linked with this account.'})
    }

    if (subscription === undefined) {
        return res.status(400).json({ message: 'Wrong id' });
    }

    let appString = '';
    if (application !== undefined) {
        appString = "curAppId=" + application.id + "&";
    }

    try {
        const prices = await stripe.prices.list({product: subscription.stripeProductId});
        if (prices.data.length == 1) {
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: prices.data.pop()?.id,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                tax_id_collection: {enabled: true},
                automatic_tax: {enabled: true},
                customer_email: user.email,
                success_url: `http://localhost:4000/stripe/subscription/success?userId=${user.id}&${appString}appId=${subscription.id}&sessionId={CHECKOUT_SESSION_ID}`,
                cancel_url: process.env.FRONTEND_URL,
            });
            return res.status(200).json({url: session.url || ''})
        }
        return res.status(500).json({error: 'error'});
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: error});
    }

});

router.get('/subscription/success', async (req: Request, res: Response) => {
    try {
        const successful = await isPaymentSuccessful(req.query.sessionId + '');
        if (successful) {
            const userId = req.query.userId + '';
            const subscriptionId = req.query.appId + '';
            const curAppId = req.query.curAppId ? req.query.curAppId + '' : undefined;
            const sessionId: string = req.query.sessionId as string
            if (curAppId && curAppId.length > 0) {
                const restriction = await getRestrictionBySubscriptionId(subscriptionId);
                if (restriction) {
                    if (restriction.creationTypes.includes('one_time')) {
                        await disableOneTimeUse(curAppId, false);
                    }
                    if (restriction.creationTypes.includes('lifetime')) {
                        await disableByLifeTime(curAppId, false);
                    }
                    if (restriction.creationTypes.includes('usage_limited')) {
                        await disableByNumUsage(curAppId, false);
                    }
                    if (restriction.creationTypes.includes('subscription')) {
                        await disableBySubscription(curAppId, false);
                    }
                }
                await updateSubscription(userId, curAppId, subscriptionId, sessionId);
            } else {
                await createApplication(userId, subscriptionId, sessionId);
            }
            return res.redirect(303, process.env.FRONTEND_URL + '/auth/dashboard');
        }
    } catch (error) {
        return res.status(400).json({ message: 'Invalid payment', error });
    }

});

// router.get('/subscription/success/:id', async (req: Request, res: Response) => {
//     try {
//         const session = await stripe.checkout.sessions.retrieve(req.params.id + '', {expand: ['invoice']});
//         const sub = await stripe.subscriptions.retrieve(session.subscription as string);
//         const bbbb = await stripe.subscriptions.list({
//             customer: session.customer as string,
//             limit: 1
//         });
//         const paymentIntent = await stripe.paymentIntents.retrieve(
//             session.payment_intent as string
//         );
//         const tr = await stripe.balanceTransactions.list({source: "ch_3SPXKgLAO7oNOYUf0CPNevCk"})
//         if (session.status == 'complete') {
//             return res.status(200).json({pp: paymentIntent, bb: bbbb, s: session, b: tr, sub: sub});
//         }
//     } catch (error) {
//         return res.status(400).json({ message: 'Invalid payment', error });
//     }
//
// });




export default router;