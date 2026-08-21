import { databaseEnabled, prisma } from "./prisma";

export const VISITOR_BASE_COUNT = 234;

export async function getVisitCount() {
  if (!databaseEnabled) return VISITOR_BASE_COUNT;
  try {
    const recordedVisitors = await prisma.auditLog.count({ where: { entityType: "SITE_VISITOR" } });
    return VISITOR_BASE_COUNT + recordedVisitors;
  } catch {
    return VISITOR_BASE_COUNT;
  }
}
