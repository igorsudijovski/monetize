import Stripe from "stripe";
import process from "node:process";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {apiVersion: '2022-11-15'});

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

export const createStripeCustomer = async (email: string): Promise<string> => {
    const account = await stripe.accounts.create({
        email: email,
        type: "express",
        settings: {
            payouts: {
                schedule: {
                    delay_days: 30
                }
            }
        }
    });
    return account.id;
}

export const createStripePayment = async (price: number, fee: number, accountId: string, currency: string, appUrl: string, keyId: string, subscriptionName: string, appSubId: string, appId: string): Promise<string> => {
    try
    {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {name: subscriptionName},
                        unit_amount: price
                    },
                    quantity: 1
                }
            ],
            payment_intent_data: {
                transfer_data: {
                    destination: accountId,
                },
                application_fee_amount: fee,
            },
            automatic_tax: {enabled: true},
            tax_id_collection: {enabled: true},
            success_url: `http://localhost:4000/user/app/${appId}/buy/${appSubId}/success?keyId=${keyId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/app/${appUrl}`,
            metadata: {productId: appSubId, keyId: keyId}
        });
        return session.url || '';
    } catch (error) {
        console.error('Error creating Stripe payment session:', error);
        throw error;
    }

}

export const onBoarding = async (accountId: string, userId: string): Promise<string> => {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'http://localhost:4000/api/onboarding',
        return_url: `http://localhost:4000/api/onboarding/success?accountId=${accountId}&userId=${userId}`,
        type: 'account_onboarding',
    });
    return accountLink.url || '';
}

export const createSubscription = async(price: number, numberOfDays: number, name: string): Promise<{priceId: string, productId: string} | null> => {
    try {
        const product = await stripe.products.create({
            name: name,
        });

        const prices = await stripe.prices.create({
            unit_amount: price,
            currency: 'eur',
            recurring: {interval: 'day', interval_count: numberOfDays},
            product: product.id,
        });
        return {priceId: prices.id, productId: product.id};
    } catch (error) {
        console.error('Error creating Stripe subscription:', error);
    }
    return null;
}

export const changeProductName = async(productId: string, newName: string): Promise<void> => {
    await stripe.products.update(productId, {
        name: newName,
    });
}

export const deleteProduct = async(productId: string, priceId: string): Promise<void> => {
    await stripe.prices.update(priceId, {
        active: false,
    });
    await stripe.products.update(productId, {
        active: false,
    });
}



// 👇 marketplace payout setup
// payment_intent_data: {
//     transfer_data: {
//         destination: product.seller.stripe_account_id,
//     },
//     application_fee_amount: platformFee,
// },

