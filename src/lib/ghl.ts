/**
 * GoHighLevel v2 REST API client (LeadConnector).
 * Handles contact + opportunity/pipeline management for the partner CRM.
 *
 * Auth: a Private Integration Token (pit-…) created in the sub-account under
 * Settings → Private Integrations, with Contacts + Opportunities scopes.
 * The v2 API host is services.leadconnectorhq.com regardless of white-label
 * (white-label only rebrands the UI domain, not the API backend); it can be
 * overridden with GHL_API_BASE if needed.
 */

const GHL_BASE_URL = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
const GHL_API_VERSION = process.env.GHL_API_VERSION || "2021-07-28";
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
      Version: GHL_API_VERSION,
      Accept: "application/json",
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
  customFields?: { id?: string; key?: string; field_value: string }[];
}

export async function createContact(data: GHLContactData) {
  return ghlFetch<{ contact: { id: string } }>("/contacts/", {
    method: "POST",
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyName: data.company,
      source: data.source,
      tags: data.tags,
      customFields: data.customFields,
    }),
  });
}

export async function updateContact(contactId: string, data: Partial<GHLContactData>) {
  return ghlFetch<{ contact: { id: string } }>(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      companyName: data.company,
      tags: data.tags,
      customFields: data.customFields,
    }),
  });
}

export async function getContact(contactId: string) {
  return ghlFetch<{ contact: Record<string, unknown> }>(`/contacts/${contactId}`);
}

export async function lookupContactByEmail(email: string) {
  return ghlFetch<{ contacts: { id: string }[] }>(
    `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`
  );
}

export async function addContactTag(contactId: string, tags: string[]) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
}

// Idempotent create-or-update by email (v2 upsert). Returns the contact id.
export async function upsertContact(data: GHLContactData): Promise<string> {
  const result = await ghlFetch<{ contact: { id: string }; new?: boolean }>(
    "/contacts/upsert",
    {
      method: "POST",
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyName: data.company,
        source: data.source,
        tags: data.tags,
        customFields: data.customFields,
      }),
    }
  );
  return result.contact.id;
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
  customFields?: { id?: string; key?: string; field_value: string }[];
}

export async function createOpportunity(data: GHLOpportunityData) {
  // v2 posts to a flat /opportunities/ collection and uses `name` +
  // `pipelineStageId` (v1 used a nested path with `title` + `stageId`).
  return ghlFetch<{ opportunity: { id: string } }>("/opportunities/", {
    method: "POST",
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      pipelineId: data.pipelineId,
      pipelineStageId: data.stageId,
      contactId: data.contactId,
      name: data.title,
      status: data.status,
      monetaryValue: data.monetaryValue,
      assignedTo: data.assignedTo,
      customFields: data.customFields,
    }),
  });
}

// pipelineId is retained in the signature for caller compatibility; v2 updates
// an opportunity by its own id and does not need the pipeline in the path.
export async function updateOpportunity(
  _pipelineId: string,
  opportunityId: string,
  data: Partial<GHLOpportunityData>
) {
  return ghlFetch(`/opportunities/${opportunityId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(data.stageId ? { pipelineStageId: data.stageId } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.title ? { name: data.title } : {}),
      ...(data.monetaryValue != null ? { monetaryValue: data.monetaryValue } : {}),
      ...(data.assignedTo ? { assignedTo: data.assignedTo } : {}),
    }),
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

export interface GHLPipeline {
  id: string;
  name: string;
  stages: { id: string; name: string; position?: number }[];
}

// Lists the sub-account's pipelines and their stages — used to resolve the
// pipeline/stage IDs the sync needs.
export async function listPipelines(): Promise<GHLPipeline[]> {
  const res = await ghlFetch<{ pipelines: GHLPipeline[] }>(
    `/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`
  );
  return res.pipelines ?? [];
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
  const secret = process.env.GHL_WEBHOOK_SECRET;
  // Fail closed: an unconfigured secret must reject, not accept, so a
  // misconfiguration can't leave the endpoint open to forged events.
  if (!secret) return false;
  if (!signature) return false;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch — guard first so an attacker
  // controlled signature can't cause a 500 instead of a clean rejection.
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
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
  const tags = ["WeShare Lead"];
  if (lead.affiliateCode) tags.push(`Referral Partner: ${lead.affiliateCode}`);
  if (lead.source) tags.push(`Source: ${lead.source}`);

  // Upsert is idempotent on email — no separate lookup/create round-trip.
  return upsertContact({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone ?? undefined,
    company: lead.company ?? undefined,
    source: lead.source ?? "WeShare",
    tags,
  });
}

// Upserts a partner/affiliate as a GHL contact, tagged by role, so the whole
// roster lives in the CRM (not just inbound leads).
export async function syncPartnerToGHL(person: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: "AFFILIATE" | "PARTNER";
  code?: string | null;
}): Promise<string> {
  const roleTag = person.role === "PARTNER" ? "Sales Partner" : "Referral Partner";
  const tags = ["WeShare Partner", roleTag];
  if (person.code) tags.push(`${roleTag} Code: ${person.code}`);

  return upsertContact({
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    phone: person.phone ?? undefined,
    source: "WeShare Signup",
    tags,
  });
}
