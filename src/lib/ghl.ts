/**
 * GoHighLevel v2 REST API client
 * Handles contact and opportunity management for the partner CRM integration.
 */

const GHL_BASE_URL = "https://rest.gohighlevel.com/v1";
const GHL_API_KEY = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;

async function ghlFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-04-15",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GHL API error ${res.status}: ${error}`);
  }

  return res.json() as Promise<T>;
}

// ─── Contact operations ───────────────────────────────────────────────────────

export interface GHLContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  tags?: string[];
  customField?: { key: string; field_value: string }[];
}

export async function createContact(data: GHLContactData) {
  return ghlFetch<{ contact: { id: string } }>("/contacts/", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      locationId: GHL_LOCATION_ID,
    }),
  });
}

export async function updateContact(contactId: string, data: Partial<GHLContactData>) {
  return ghlFetch<{ contact: { id: string } }>(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getContact(contactId: string) {
  return ghlFetch<{ contact: Record<string, unknown> }>(`/contacts/${contactId}`);
}

export async function lookupContactByEmail(email: string) {
  return ghlFetch<{ contacts: { id: string }[] }>(
    `/contacts/?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`
  );
}

export async function addContactTag(contactId: string, tags: string[]) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
}

// ─── Opportunity (Pipeline) operations ───────────────────────────────────────

export interface GHLOpportunityData {
  title: string;
  status: "open" | "won" | "lost" | "abandoned";
  stageId: string;
  pipelineId: string;
  contactId: string;
  monetaryValue?: number;
  assignedTo?: string;
  customFields?: { key: string; field_value: string }[];
}

export async function createOpportunity(data: GHLOpportunityData) {
  return ghlFetch<{ opportunity: { id: string } }>(`/pipelines/${data.pipelineId}/opportunities`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      locationId: GHL_LOCATION_ID,
    }),
  });
}

export async function updateOpportunity(
  pipelineId: string,
  opportunityId: string,
  data: Partial<GHLOpportunityData>
) {
  return ghlFetch(`/pipelines/${pipelineId}/opportunities/${opportunityId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function moveOpportunityStage(
  pipelineId: string,
  opportunityId: string,
  stageId: string,
  status: string
) {
  return updateOpportunity(pipelineId, opportunityId, {
    stageId,
    status: status as "open" | "won" | "lost" | "abandoned",
  });
}

// ─── GHL stage mapping ────────────────────────────────────────────────────────

export function getGHLStageId(status: string): string {
  const map: Record<string, string> = {
    NEW: process.env.GHL_STAGE_NEW!,
    CONTACTED: process.env.GHL_STAGE_CONTACTED!,
    APPOINTMENT: process.env.GHL_STAGE_APPOINTMENT!,
    PROPOSAL: process.env.GHL_STAGE_PROPOSAL!,
    WON: process.env.GHL_STAGE_WON!,
    LOST: process.env.GHL_STAGE_LOST!,
    NURTURE: process.env.GHL_STAGE_NURTURE!,
  };
  return map[status] ?? map["NEW"];
}

export function getGHLOpportunityStatus(leadStatus: string): "open" | "won" | "lost" | "abandoned" {
  if (leadStatus === "WON") return "won";
  if (leadStatus === "LOST") return "lost";
  return "open";
}

// ─── Webhook signature verification ──────────────────────────────────────────

export function verifyGHLWebhook(
  payload: string,
  signature: string | null
): boolean {
  if (!process.env.GHL_WEBHOOK_SECRET) return true; // skip if not configured
  if (!signature) return false;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", process.env.GHL_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ─── Batch sync helpers ───────────────────────────────────────────────────────

export async function syncLeadToGHL(lead: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  affiliateCode?: string | null;
}): Promise<string> {
  // Check if contact already exists
  const existing = await lookupContactByEmail(lead.email).catch(() => null);
  if (existing?.contacts?.[0]) {
    return existing.contacts[0].id;
  }

  const tags = ["WeShare Lead"];
  if (lead.affiliateCode) tags.push(`Referral Partner: ${lead.affiliateCode}`);
  if (lead.source) tags.push(`Source: ${lead.source}`);

  const result = await createContact({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone ?? undefined,
    company: lead.company ?? undefined,
    source: lead.source ?? "WeShare",
    tags,
  });

  return result.contact.id;
}
