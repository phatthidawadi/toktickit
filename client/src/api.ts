const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  isActive: boolean;
}

export interface Requester {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

export interface CreateTicketInput {
  summary: string;
  description: string;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface AttachmentSummary {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  isRemoved?: boolean;
  removedReason?: string;
  removedAt?: string;
  createdAt?: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  itPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  currentStatus: "NEW" | "IN_PROGRESS" | "WAITING_FOR_REQUESTER" | "RESOLVED" | "CLOSED" | "REOPENED" | "CANCELLED" | string;
  isRequesterResolved?: boolean;
  requesterId: number;
  assignedStaffId?: number | null;
  categoryId: number;
  relatedSystemId: number;
  createdAt: string;
  updatedAt: string;
  requester?: { id: number; name: string; email: string };
  assignedStaff?: { id: number; name: string; email: string } | null;
  category?: Category;
  relatedSystem?: RelatedSystem;
  attachments?: AttachmentSummary[];
}

export interface PaginatedTickets {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`);
  if (!healthRes.ok) throw new Error("API is offline");

  const categoriesRes = await fetch(`${API_URL}/api/categories`);
  if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

  const categories: Category[] = await categoriesRes.json();
  return { online: true, categories };
}

export async function fetchRequesters(): Promise<Requester[]> {
  const res = await fetch(`${API_URL}/api/requesters`);
  if (!res.ok) throw new Error("Failed to fetch active requesters");
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchRelatedSystems(categoryId?: number): Promise<RelatedSystem[]> {
  const url = categoryId
    ? `${API_URL}/api/related-systems?categoryId=${categoryId}`
    : `${API_URL}/api/related-systems`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch related systems");
  return res.json();
}

export async function createTicket(input: CreateTicketInput, requesterId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": String(requesterId),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to create ticket" }));
    throw new Error(errorData.error || "Failed to create ticket");
  }

  return res.json();
}

export interface FetchMyTicketsParams {
  search?: string;
  categoryId?: number | string;
  status?: string;
  priority?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchMyTickets(
  params: FetchMyTicketsParams,
  requesterId: number
): Promise<PaginatedTickets> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.categoryId) queryParams.append("categoryId", String(params.categoryId));
  if (params.status) queryParams.append("status", params.status);
  if (params.priority) queryParams.append("priority", params.priority);
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  const res = await fetch(`${API_URL}/api/tickets?${queryParams.toString()}`, {
    headers: {
      "x-requester-id": String(requesterId),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to fetch tickets" }));
    throw new Error(errorData.error || "Failed to fetch tickets");
  }

  return res.json();
}

export async function fetchTicketDetail(ticketId: number, requesterId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
    headers: {
      "x-requester-id": String(requesterId),
    },
  });

  if (res.status === 403) {
    throw new Error("403 Forbidden: You do not have permission to view this ticket.");
  }

  if (res.status === 404) {
    throw new Error("404 Not Found: The requested ticket does not exist.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to fetch ticket details" }));
    throw new Error(errorData.error || "Failed to fetch ticket details");
  }

  return res.json();
}

export async function uploadAttachment(
  ticketId: number,
  file: File,
  requesterId: number
): Promise<AttachmentSummary> {
  // Client-side validations (BR-07, AC-04, AC-05)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds maximum limit of 5MB");
  }

  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExts.includes(ext) || (file.type && !allowedMimes.includes(file.type))) {
    throw new Error("File type not allowed (only JPG, PNG, WEBP, and PDF files are accepted)");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: {
      "x-requester-id": String(requesterId),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(errorData.error || "Upload failed");
  }

  return res.json();
}

export function getAttachmentDownloadUrl(attachmentId: number): string {
  return `${API_URL}/api/attachments/${attachmentId}/download`;
}

export async function softRemoveAttachment(
  attachmentId: number,
  reason: string,
  requesterId: number
): Promise<void> {
  if (!reason || reason.trim().length < 5) {
    throw new Error("Removal reason of at least 5 characters is required");
  }

  const res = await fetch(`${API_URL}/api/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": String(requesterId),
    },
    body: JSON.stringify({ reason: reason.trim() }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Soft removal failed" }));
    throw new Error(errorData.error || "Soft removal failed");
  }
}

// ---------------------------------------------------------------------------
// Authentication API Functions
// ---------------------------------------------------------------------------
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR" | string;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  user: UserProfile;
}

export async function loginApi(email: string, pass: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password: pass }),
  });
  const data = await res.json().catch(() => ({ error: "Login failed" }));
  if (!res.ok) {
    throw new Error(data.error || "Invalid email or password");
  }
  return data;
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchCurrentUserApi(): Promise<{ user: UserProfile }> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({ error: "Failed to fetch user session" }));
  if (!res.ok) {
    throw new Error(data.error || "Unauthenticated");
  }
  return data;
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const data = await res.json().catch(() => ({ error: "Password change failed" }));
  if (!res.ok) {
    throw new Error(data.error || "Password change failed");
  }
  return data;
}

export interface PublicComment {
  id: number;
  ticketId: number;
  authorId: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function fetchPublicCommentsApi(ticketId: number): Promise<PublicComment[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch public comments");
  return res.json();
}

export async function createPublicCommentApi(ticketId: number, content: string): Promise<PublicComment> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  const data = await res.json().catch(() => ({ error: "Failed to post comment" }));
  if (!res.ok) throw new Error(data.error || "Failed to post comment");
  return data;
}

export async function toggleResolveAckApi(ticketId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/resolve-ack`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({ error: "Failed to update resolution status" }));
  if (!res.ok) throw new Error(data.error || "Failed to update resolution status");
  return data;
}

export interface StaffTicketQueueParams {
  search?: string;
  categoryId?: number;
  status?: string;
  requestedPriority?: string;
  itPriority?: string;
  assignedStaffId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface TicketInternalNote {
  id: number;
  ticketId: number;
  authorId: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function fetchStaffTicketsApi(params: StaffTicketQueueParams): Promise<PaginatedTickets> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.categoryId) queryParams.append("categoryId", String(params.categoryId));
  if (params.status) queryParams.append("status", params.status);
  if (params.requestedPriority) queryParams.append("requestedPriority", params.requestedPriority);
  if (params.itPriority) queryParams.append("itPriority", params.itPriority);
  if (params.assignedStaffId) queryParams.append("assignedStaffId", params.assignedStaffId);
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  const res = await fetch(`${API_URL}/api/staff/tickets?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch staff tickets queue");
  return res.json();
}

export async function fetchStaffTicketDetailApi(ticketId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch ticket detail");
  return res.json();
}

export async function assignStaffTicketApi(
  ticketId: number,
  target: { assignedStaffId?: number | null; claim?: boolean }
): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(target),
  });
  const data = await res.json().catch(() => ({ error: "Failed to update assignment" }));
  if (!res.ok) throw new Error(data.error || "Failed to update assignment");
  return data;
}

export async function updateItPriorityApi(ticketId: number, itPriority: string): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ itPriority }),
  });
  const data = await res.json().catch(() => ({ error: "Failed to update IT priority" }));
  if (!res.ok) throw new Error(data.error || "Failed to update IT priority");
  return data;
}

export async function updateTicketStatusApi(ticketId: number, status: string): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({ error: "Failed to update ticket status" }));
  if (!res.ok) throw new Error(data.error || "Failed to update ticket status");
  return data;
}

export async function fetchInternalNotesApi(ticketId: number): Promise<TicketInternalNote[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/notes`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch internal notes");
  return res.json();
}

export async function createInternalNoteApi(ticketId: number, content: string): Promise<TicketInternalNote> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  const data = await res.json().catch(() => ({ error: "Failed to post internal note" }));
  if (!res.ok) throw new Error(data.error || "Failed to post internal note");
  return data;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchAdminUsersApi(search?: string, role?: string): Promise<AdminUser[]> {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (role && role !== "ALL") queryParams.append("role", role);

  const res = await fetch(`${API_URL}/api/admin/users?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch admin users");
  return res.json();
}

export async function createAdminUserApi(user: {
  name: string;
  email: string;
  role: string;
  initialPassword?: string;
  password?: string;
  isActive?: boolean;
}): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  const data = await res.json().catch(() => ({ error: "Failed to create user" }));
  if (!res.ok) {
    const errorObj: any = new Error(data.error || "Failed to create user");
    errorObj.code = data.code;
    throw errorObj;
  }
  return data;
}

export async function updateAdminUserApi(
  id: number,
  updates: { name?: string; email?: string; role?: string; isActive?: boolean }
): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({ error: "Failed to update user" }));
  if (!res.ok) {
    const errorObj: any = new Error(data.error || "Failed to update user");
    errorObj.code = data.code;
    throw errorObj;
  }
  return data;
}

export async function resetAdminUserPasswordApi(
  id: number,
  initialPassword: string
): Promise<{ message: string; user: AdminUser }> {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ initialPassword }),
  });
  const data = await res.json().catch(() => ({ error: "Failed to reset password" }));
  if (!res.ok) {
    const errorObj: any = new Error(data.error || "Failed to reset password");
    errorObj.code = data.code;
    throw errorObj;
  }
  return data;
}


