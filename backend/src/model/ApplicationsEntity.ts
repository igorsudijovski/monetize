export interface ApplicationsEntity {
    id: string;
    name: string;
    redirectUrl: string;
    clientId: string,
    clientSecret: string,
    tileColor: string,
    backgroundColor: string,
    stripeSessionId: string,
    subscriptionId: string,
    ownerId: string,
    startedAt: Date
}