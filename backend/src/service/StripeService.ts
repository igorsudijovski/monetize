import Stripe from "stripe";
import process from "node:process";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

export const getSubscriptionId = async (sessionId: string): Promise<string | undefined> => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.subscription && typeof session.subscription === 'string') {
        return session.subscription;
    } else if (session.subscription && typeof session.subscription === 'object' && 'id' in session.subscription) {
        return session.subscription.id;
    }
    return undefined;
}

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
    await stripe.subscriptions.cancel(subscriptionId);
}