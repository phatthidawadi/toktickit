export const PERMITTED_STATUS_TRANSITIONS: Record<string, { to: string[]; adminOnlyTo?: string[] }> = {
  NEW: { to: ["OPEN", "IN_PROGRESS", "CANCELLED"] },
  OPEN: { to: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"] },
  IN_PROGRESS: { to: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"] },
  WAITING_FOR_REQUESTER: { to: ["IN_PROGRESS", "RESOLVED", "CANCELLED"] },
  RESOLVED: { to: ["CLOSED", "REOPENED"] },
  REOPENED: { to: ["IN_PROGRESS", "RESOLVED", "CANCELLED"] },
  CLOSED: { to: [], adminOnlyTo: ["REOPENED"] },
  CANCELLED: { to: [] },
};

export function isValidStatusTransition(fromStatus: string, toStatus: string, userRole: string): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = PERMITTED_STATUS_TRANSITIONS[fromStatus];
  if (!allowed) return false;

  if (allowed.to.includes(toStatus)) return true;
  if (userRole === "ADMINISTRATOR" && allowed.adminOnlyTo?.includes(toStatus)) return true;

  return false;
}
