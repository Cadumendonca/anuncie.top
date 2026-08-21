import { databaseEnabled, prisma } from "./prisma";

export const VISITOR_METRIC_KEY = "unique-visitors";

export async function getVisitCount() {
  if (!databaseEnabled) return 0;
  try {
    const metric = await prisma.siteMetric.findUnique({ where: { key: VISITOR_METRIC_KEY } });
    return Number(metric?.value ?? 0);
  } catch {
    return 0;
  }
}
