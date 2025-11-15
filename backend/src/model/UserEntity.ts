export interface UserEntity {
    id: string;
    email: string;
    name: string;
    googleId: string;
    applicationId?: string;
    applicationSubscriptionIds: {id: string, name: string}[];
}