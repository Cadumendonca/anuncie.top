import { databaseEnabled, prisma } from "./prisma";

export const VISITOR_METRIC_KEY = "unique-visitors";
export const VISITOR_BASE_COUNT = 234;

export async function getVisitCount() {
  if (!databaseEnabled) return VISITOR_BASE_COUNT;
  try {
    const metric = await prisma.siteMetric.findUnique({ where: { key: VISITOR_METRIC_KEY } });
    return VISITOR_BASE_COUNT + Number(metric?.value ?? 0);
  } catch {
    return VISITOR_BASE_COUNT;
  }
}
