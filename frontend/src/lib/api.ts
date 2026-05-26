const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; username: string };
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  _count?: {
    members: number;
  };
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  username?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (data: { email: string; username: string; password: string }) =>
    request<{ id: string; email: string; username: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { identifier: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rooms: (token: string) => request<Room[]>('/chat/rooms', {}, token),
  publicRooms: (token: string) => request<Room[]>('/chat/rooms/public', {}, token),
  createRoom: (token: string, name: string, isPrivate = false) =>
    request<Room>('/chat/rooms', { method: 'POST', body: JSON.stringify({ name, isPrivate }) }, token),
  joinRoom: (token: string, roomId: string) =>
    request<Room>(`/chat/rooms/${roomId}/join`, { method: 'POST' }, token),
  leaveRoom: (token: string, roomId: string) =>
    request<{ success: boolean }>(`/chat/rooms/${roomId}/leave`, { method: 'POST' }, token),
  messages: (token: string, roomId: string, limit = 50) =>
    request<Message[]>(`/chat/rooms/${roomId}/messages?limit=${limit}`, {}, token),
  createInvite: (token: string, roomId: string) =>
    request<{ inviteUrl: string }>(`/chat/rooms/${roomId}/invite`, { method: 'POST' }, token),
  getInvite: (token: string, inviteToken: string) =>
    request<{ room: Room }>(`/chat/invite/${inviteToken}`, {}, token),
  acceptInvite: (token: string, inviteToken: string) =>
    request<Room>(`/chat/invite/${inviteToken}/accept`, { method: 'POST' }, token),
};
