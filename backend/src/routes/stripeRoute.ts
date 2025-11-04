import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import {getSubscriptionById} from "../service/GeneralSubscriptionService";
import requireJwt from "../middleware/requireJwt";
import {createApplication, getApplicationByUserId} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";
import * as process from "node:process";
const stripeRoute = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

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
    if (application !== undefined) {
        return res.status(400).json({message: 'Already have subscription, first cancel it and then buy new subscription. Everything will be linked with this account.'})
    }

    if (subscription === undefined) {
        return res.status(400).json({ message: 'Wrong id' });
    }

    if (subscription.price == 0) {
        await createApplication(user.id, subscription.id, null);
        return res.status(200).json({home: true})
    }

    try {
        const prices = await stripeRoute.prices.list({product: subscription.stripeProductId});
        if (prices.data.length == 1) {
            const session = await stripeRoute.checkout.sessions.create({
                line_items: [
                    {
                        price: prices.data.pop()?.id,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                customer_email: user.email,
                success_url: 'http://localhost:4000/stripe/subscription/success?userId=' + user.id + '&appId=' + subscription.id + '&sessionId={CHECKOUT_SESSION_ID}',
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
        const session = await stripeRoute.checkout.sessions.retrieve(req.query.sessionId + '', {expand: ['payment_intent']});
        if (session.status == 'complete') {
            const userId = req.query.userId + '';
            const subscriptionId = req.query.appId + '';
            await createApplication(userId, subscriptionId, session.id);
            return res.redirect(303, process.env.FRONTEND_URL + '/auth/dashboard');
        }
    } catch (error) {
        return res.status(400).json({ message: 'Invalid payment', error });
    }

});

router.get('/subscription/success/:id', async (req: Request, res: Response) => {
    try {
        const session = await stripeRoute.checkout.sessions.retrieve(req.params.id + '', {expand: ['payment_intent']});
        const tr = await stripeRoute.balanceTransactions.list({source: "ch_3SK3DnLAO7oNOYUf1RdkIrXe"})
        if (session.status == 'complete') {
            return res.status(200).json({s: session, b: tr});
        }
    } catch (error) {
        return res.status(400).json({ message: 'Invalid payment', error });
    }

});




export default router;