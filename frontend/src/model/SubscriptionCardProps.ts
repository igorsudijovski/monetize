export type SubscriptionType = "one_time" | "subscription" | "usage_limited" | "lifetime";

export interface SubscriptionCardProps {
    id: string;
    title: string;
    description?: string;
    price: number;
    items?: string[];
    type?: SubscriptionType;
    days?: number;
    usageLimit?: number;

    showAdminActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}