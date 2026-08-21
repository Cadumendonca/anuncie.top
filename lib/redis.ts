import { Redis } from "@upstash/redis";

export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export async function heartbeat(sessionId: string) {
  if (!redis) return { online: 0, lastHour: 0 };
  const now = Date.now();
  await redis.zadd("presence", { score: now, member: sessionId });
  await redis.zremrangebyscore("presence", 0, now - 3_600_000);
  const [online, lastHour] = await Promise.all([
    redis.zcount("presence", now - 120_000, now),
    redis.zcount("presence", now - 3_600_000, now)
  ]);
  return { online, lastHour };
}
