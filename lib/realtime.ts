import Ably from "ably";

export async function publishRankingChanged(reason: string) {
  if (!process.env.ABLY_API_KEY) return;
  const realtime = new Ably.Rest(process.env.ABLY_API_KEY);
  await realtime.channels.get("ranking").publish("changed", { reason, at: new Date().toISOString() });
}
