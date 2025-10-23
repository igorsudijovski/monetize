import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
const stripeRoute = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

const router = Router();

router.get('/pay', async (req: Request, res: Response) => {
    const session = await stripeRoute.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'This is blabla',
                    },
                    unit_amount: 500, // amount in cents
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'new item',
                    },
                    unit_amount: 1000, // amount in cents
                },
                quantity: 2,
            }
        ],
        mode: 'payment',
        success_url: 'http://localhost:4000/stripe-success',
        cancel_url: 'http://localhost:4000/stripe-failure',
    });
    res.redirect(303, session.url || '');
});


export default router;