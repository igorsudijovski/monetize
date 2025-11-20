export interface UserEntity {
    id: string;
    email: string;
    name: string;
    googleId: string;
    stripeAccountId?: string;
    applicationId?: string;
    applicationSubscriptionIds: {id: string, name: string}[];
    onboardComplete: boolean;
}