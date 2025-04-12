export type SubscriptionTier = 'free' | 'pro';

export interface TierLimits {
  recordingTimeMinutes: number;
  aiActionsPerMonth: number;
  canCreateNotes: boolean;
}

export interface TierConfig {
  name: string;
  price: number | null; // null for free tier
  limits: TierLimits;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Free',
    price: null,
    limits: {
      recordingTimeMinutes: 10,
      aiActionsPerMonth: 3,
      canCreateNotes: false
    }
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    limits: {
      recordingTimeMinutes: 1200, // 20 hours
      aiActionsPerMonth: 50,
      canCreateNotes: true
    }
  }
};

export const getSubscriptionLimits = (tier: SubscriptionTier): TierLimits => {
  return SUBSCRIPTION_TIERS[tier].limits;
};

export const isPaidTier = (tier: SubscriptionTier): boolean => {
  return SUBSCRIPTION_TIERS[tier].price !== null;
};

export const formatPrice = (price: number | null): string => {
  if (price === null) return 'Free';
  return `$${price.toFixed(2)}/month`;
};

export const getFeaturesList = (tier: SubscriptionTier): string[] => {
  const { limits } = SUBSCRIPTION_TIERS[tier];
  return [
    `${limits.recordingTimeMinutes >= 60 
      ? `${limits.recordingTimeMinutes / 60} hours`
      : `${limits.recordingTimeMinutes} minutes`} recording time`,
    `${limits.aiActionsPerMonth} AI actions per month`,
    limits.canCreateNotes ? 'Create new notes' : 'View existing notes only'
  ];
};