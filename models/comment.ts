export interface UserComment {
  id: string;
  name: string;
  comment: string;
  referralSource?: string;
  createdAt: string; // ISO string for easy serialization
}

export const REFERRAL_OPTIONS = [
  "LinkedIn",
  "Twitter / X",
  "Reddit / Finance Forum",
  "Friend or Colleague",
  "Google Search",
  "YouTube / Social Media",
  "Other",
] as const;

export type ReferralOption = (typeof REFERRAL_OPTIONS)[number];
