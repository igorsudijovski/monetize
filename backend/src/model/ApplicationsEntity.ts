export interface ApplicationsEntity {
    id: string;
    name: string;
    redirectUrl: string;
    clientId: string,
    clientSecret: string,
    fontColor: string,
    buttonColor: string,
    backgroundColor: string,
    stripeSessionId: string,
    subscriptionId: string,
    ownerId: string,
    active: boolean,
    startedAt: Date
}