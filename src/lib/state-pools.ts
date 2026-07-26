/**
 * Sales-partner state pools.
 *
 * Each Sales Partner claims exactly one US state at signup. Capacity per
 * state is owner-configurable via AppSettings and defaults to 1 (true
 * exclusivity — "no double-dipping"). Raising capacity later turns a state
 * into a shared pool without any code change:
 *   - key "state_pool_capacity"  → default capacity for every state ("1")
 *   - key "state_pool_overrides" → JSON like {"TX":3,"FL":2}
 *
 * The claim is enforced transactionally at signup (count-then-set inside a
 * serialized transaction), and re-checked by the n8n Rep Provisioner before
 * it purchases a VoIP number, so an oversubscribed state can never trigger
 * a number purchase.
 */

import db from "./db";

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

const STATE_CODES = new Set(US_STATES.map((s) => s.code));

export function isValidState(code: string): boolean {
  return STATE_CODES.has(code.toUpperCase());
}

async function getCapacityConfig(): Promise<{ base: number; overrides: Record<string, number> }> {
  const [capRow, ovrRow] = await Promise.all([
    db.appSetting.findUnique({ where: { key: "state_pool_capacity" } }),
    db.appSetting.findUnique({ where: { key: "state_pool_overrides" } }),
  ]);
  const base = Math.max(1, parseInt(capRow?.value ?? "1", 10) || 1);
  let overrides: Record<string, number> = {};
  try {
    const parsed = JSON.parse(ovrRow?.value ?? "{}");
    for (const [k, v] of Object.entries(parsed)) {
      const n = parseInt(String(v), 10);
      if (isValidState(k) && n >= 0) overrides[k.toUpperCase()] = n;
    }
  } catch {
    /* malformed overrides are ignored, base applies */
  }
  return { base, overrides };
}

export type StatePool = {
  code: string;
  name: string;
  capacity: number;
  taken: number;
  available: number;
};

export async function getStatePools(): Promise<StatePool[]> {
  const { base, overrides } = await getCapacityConfig();
  const counts = await db.partnerProfile.groupBy({
    by: ["assignedState"],
    where: { assignedState: { not: null }, isActive: true, terminatedAt: null },
    _count: { _all: true },
  });
  const taken = new Map<string, number>(
    counts.map((c) => [c.assignedState as string, c._count._all])
  );
  return US_STATES.map(({ code, name }) => {
    const capacity = overrides[code] ?? base;
    const t = taken.get(code) ?? 0;
    return { code, name, capacity, taken: t, available: Math.max(0, capacity - t) };
  });
}

/**
 * Transactionally claim a state for a partner. Returns the claim or throws
 * with a plain-language reason. Serializable isolation closes the
 * check-then-set race when two reps grab the last slot simultaneously.
 */
export async function claimState(partnerId: string, stateRaw: string) {
  const state = stateRaw.toUpperCase().trim();
  if (!isValidState(state)) throw new Error(`"${stateRaw}" is not a US state code.`);
  const { base, overrides } = await getCapacityConfig();
  const capacity = overrides[state] ?? base;

  return db.$transaction(
    async (tx) => {
      const taken = await tx.partnerProfile.count({
        where: { assignedState: state, isActive: true, terminatedAt: null, id: { not: partnerId } },
      });
      if (taken >= capacity) {
        throw new Error(`${state} is fully claimed (${taken}/${capacity}). Pick another state.`);
      }
      return tx.partnerProfile.update({
        where: { id: partnerId },
        data: { assignedState: state },
      });
    },
    { isolationLevel: "Serializable" }
  );
}
