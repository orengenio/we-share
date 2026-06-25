import type {
  User,
  AffiliateProfile,
  PartnerProfile,
  AffiliateLink,
  Click,
  Lead,
  Conversion,
  Commission,
  Override,
  Payout,
  PayoutItem,
  Dispute,
  GHLOpportunity,
  FraudFlag,
  WebhookEvent,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  User,
  AffiliateProfile,
  PartnerProfile,
  AffiliateLink,
  Click,
  Lead,
  Conversion,
  Commission,
  Override,
  Payout,
  PayoutItem,
  Dispute,
  GHLOpportunity,
  FraudFlag,
  WebhookEvent,
};

export type {
  UserRole,
  AffiliateRank,
  CommissionType,
  CommissionStatus,
  PayoutStatus,
  LeadStatus,
  DisputeStatus,
  ConversionType,
  FraudSeverity,
  FraudResolution,
} from "@prisma/client";

// ─── Composite types ──────────────────────────────────────────────────────────

export type UserWithProfile = User & {
  affiliateProfile: AffiliateProfile | null;
  partnerProfile: PartnerProfile | null;
};

export type AffiliateWithUser = AffiliateProfile & {
  user: User;
};

export type PartnerWithUser = PartnerProfile & {
  user: User;
};

export type LeadWithRelations = Lead & {
  affiliate: (AffiliateProfile & { user: User }) | null;
  partner: (PartnerProfile & { user: User }) | null;
  conversions: Conversion[];
};

export type ConversionWithRelations = Conversion & {
  lead: Lead;
  affiliate: (AffiliateProfile & { user: User }) | null;
  partner: (PartnerProfile & { user: User }) | null;
  commissions: Commission[];
};

export type CommissionWithRelations = Commission & {
  conversion: Conversion;
  affiliate: (AffiliateProfile & { user: User }) | null;
  partner: (PartnerProfile & { user: User }) | null;
};

// ─── API Response types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Session / Auth ───────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string;     // userId
  email: string;
  role: string;
  affiliateId?: string;
  partnerId?: string;
  iat: number;
  exp: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  name?: string;
  affiliateId?: string;
  partnerId?: string;
  affiliateCode?: string;
  partnerCode?: string;
}

// ─── Commission engine types ──────────────────────────────────────────────────

export interface CommissionConfig {
  setupFeeRate: number;          // e.g. 0.10 for 10%
  setupFeeAmount: number;        // pre-calculated dollar amount
  residualRate: number;          // e.g. 0.05 for 5%
  residualAmount: number;        // per-month dollar amount
  residualMonths: number | null; // null = unlimited
  overrideSetupRate: number;     // e.g. 0.05 for 5%
  overrideResidualRate: number;  // e.g. 0.025 for 2.5%
  overrideMonths: number | null; // null = unlimited
}

export const COMMISSION_CONFIGS: Record<string, CommissionConfig> = {
  CATALYST: {
    setupFeeRate: 0.10,
    setupFeeAmount: 99.70,
    residualRate: 0.05,
    residualAmount: 12.35,
    residualMonths: 12,
    overrideSetupRate: 0,
    overrideResidualRate: 0,
    overrideMonths: 0,
  },
  BUILDER: {
    setupFeeRate: 0.15,
    setupFeeAmount: 149.55,
    residualRate: 0.05,
    residualAmount: 12.35,
    residualMonths: 24,
    overrideSetupRate: 0.05,
    overrideResidualRate: 0,
    overrideMonths: 12,
  },
  ARCHITECT: {
    setupFeeRate: 0.20,
    setupFeeAmount: 199.40,
    residualRate: 0.075,
    residualAmount: 18.53,
    residualMonths: null,
    overrideSetupRate: 0.05,
    overrideResidualRate: 0,
    overrideMonths: 24,
  },
  SOVEREIGN: {
    setupFeeRate: 0.25,
    setupFeeAmount: 249.25,
    residualRate: 0.10,
    residualAmount: 24.70,
    residualMonths: null,
    overrideSetupRate: 0.05,
    overrideResidualRate: 0.025,
    overrideMonths: null,
  },
};

export const PARTNER_COMMISSION = {
  setupFeeRate: 0.35,
  setupFeeAmount: 348.95,
  residualRate: 0.25,
  residualAmount: 61.75,
  residualMonths: null,
};

// Partner Leader override — promoted partners earn on their recruited team
export const LEADER_COMMISSION = {
  setupOverrideRate: 0.05,   // 5% of $997 setup = $49.85 per team sale
  setupOverrideAmount: 49.85,
  residualOverrideRate: 0.05, // 5% of $247/mo = $12.35/mo per active team client
  residualOverrideAmount: 12.35,
};

export const PRODUCT_PRICING = {
  setupFee: 997.00,
  monthlyMaintenance: 247.00,
  fastStartBonus: 50.00,
  fastStartWindowDays: 14,
};

export const RANK_THRESHOLDS = {
  BUILDER: 3,
  ARCHITECT: 10,
  SOVEREIGN: 25,
};

// ─── Tracking types ───────────────────────────────────────────────────────────

export interface TrackingParams {
  affiliateCode?: string;
  linkCode?: string;
  visitorToken?: string;
  sessionToken?: string;
}

export interface AttributionResult {
  affiliateId: string | null;
  affiliateCode: string | null;
  linkId: string | null;
  clickId: string | null;
  isExpired: boolean;
}

// ─── GoHighLevel types ────────────────────────────────────────────────────────

export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  customFields?: Record<string, string>;
  locationId: string;
}

export interface GHLOpportunityPayload {
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  title: string;
  status: "open" | "won" | "lost" | "abandoned";
  monetaryValue?: number;
  assignedTo?: string;
}

export interface GHLWebhookEvent {
  type: string;
  locationId: string;
  data: Record<string, unknown>;
}

// ─── Dashboard stats types ────────────────────────────────────────────────────

export interface AffiliateDashboardStats {
  totalClicks: number;
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
  rank: string;
  lifetimeSales: number;
  nextRankSalesNeeded: number | null;
  armySize: number;
  armyActiveThisMonth: number;
  recentActivity: ActivityItem[];
  monthlyEarnings: MonthlyEarnings[];
}

export interface PartnerDashboardStats {
  totalLeadsAssigned: number;
  totalDealsWon: number;
  totalDealsInPipeline: number;
  conversionRate: number;
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
  monthlyResidualRunRate: number;
  slaBreaches: number;
  recentLeads: Lead[];
  monthlyEarnings: MonthlyEarnings[];
}

export interface AdminDashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalPartners: number;
  activePartners: number;
  totalRevenue: number;
  totalCommissionsPaid: number;
  pendingPayouts: number;
  fraudFlags: number;
  openDisputes: number;
  conversionRate: number;
  monthlyRevenue: MonthlyEarnings[];
}

export interface ActivityItem {
  type: "click" | "lead" | "conversion" | "payout" | "rank_up";
  description: string;
  amount?: number;
  timestamp: string;
}

export interface MonthlyEarnings {
  month: string; // "2026-06"
  revenue: number;
  commissions: number;
  conversions: number;
}
