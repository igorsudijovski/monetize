export type SubscriptionType = "one_time" | "subscription" | "usage_limited" | "lifetime";

export interface SubscriptionCardProps {
    id: string;
    title: string;
    description?: string;
    active: boolean;
    price: number;
    items?: string[];
    type?: SubscriptionType;
    days?: number;
    usageLimit?: number;

    showAdminActions?: boolean;
    adminSide: boolean,
    onEdit?: () => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onBuy?: () => void;

    isFirst?: boolean;
    isLast?: boolean;
    move?: (direction: "left" | "right") => void;
}