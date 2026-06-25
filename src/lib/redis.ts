import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Key namespaces ───────────────────────────────────────────────────────────
export const REDIS_KEYS = {
  clickBurst: (ipHash: string) => `fraud:burst:${ipHash}`,
  rateLimit: (identifier: string) => `rate:${identifier}`,
  visitorAttribution: (visitorToken: string) => `attr:${visitorToken}`,
  sessionToken: (token: string) => `sess:${token}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function incrementWithExpiry(
  key: string,
  windowSeconds: number
): Promise<number> {
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, windowSeconds);
  const results = await pipeline.exec();
  return (results?.[0]?.[1] as number) ?? 0;
}

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = REDIS_KEYS.rateLimit(identifier);
  const count = await incrementWithExpiry(key, windowSeconds);
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt: Date.now() + ttl * 1000,
  };
}

export default redis;
