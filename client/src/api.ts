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
  createdAt?: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  currentStatus: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  createdAt: string;
  updatedAt: string;
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
