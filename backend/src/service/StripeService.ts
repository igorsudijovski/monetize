import Stripe from "stripe";
import process from "node:process";
import {StripePaymentModel, StripeSubscriptionModel} from "../model/StripePaymentModel";

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

export const createStripeSubscription = async (model: StripeSubscriptionModel): Promise<string> => {
    let createSession: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        line_items: [
            {
                price: model.priceId,
                quantity: 1
            }
        ],
        automatic_tax: {enabled: true},
        tax_id_collection: {enabled: true},
        success_url: `http://localhost:4000/user/app/${model.appId}/buy/${model.appSubId}/success?keyId=${model.keyId}&appUrl=${model.appUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/app/${model.appUrl}`,
        metadata: {productId: model.appSubId, keyId: model.keyId},
        subscription_data: {
            application_fee_percent: model.percentage,
            transfer_data: {
                destination: model.accountId,
            }
        }
    };
    try
    {
        const session = await stripe.checkout.sessions.create(createSession);
        return session.url || '';
    } catch (error) {
        console.error('Error creating Stripe payment session:', error);
        throw error;
    }
}


export const createStripePayment = async (model: StripePaymentModel): Promise<string> => {
    let createSession: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: model.currency,
                    product_data: {name: model.productName},
                    unit_amount: model.price
                },
                quantity: 1
            }
        ],
        automatic_tax: {enabled: true},
        tax_id_collection: {enabled: true},
        success_url: `http://localhost:4000/user/app/${model.appId}/buy/${model.appSubId}/success?keyId=${model.keyId}&appUrl=${model.appUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/app/${model.appUrl}`,
        metadata: {productId: model.appSubId, keyId: model.keyId}
    };
    if (model.accountId != null) {
        createSession.payment_intent_data = {
            transfer_data: {
                destination: model.accountId,
            },
            application_fee_amount: model.fee,
        };
    }
    try
    {
        const session = await stripe.checkout.sessions.create(createSession);
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

export const isPaymentSuccessful = async(sessionId: string): Promise<boolean> => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session.payment_status === 'paid' && session.status === 'complete';
    } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        return false;
    }
}



// 👇 marketplace payout setup
// payment_intent_data: {
//     transfer_data: {
//         destination: product.seller.stripe_account_id,
//     },
//     application_fee_amount: platformFee,
// },

