
export enum UserRole {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  role: UserRole;
}

export interface Shop {
  id: string;
  vendorId: string;
  name: string;
  address: string;
  landmark?: string;
  mapUrl?: string;
  phone: string;
  category: string;
  openingTime?: string;
  closingTime?: string;
  lunchStart?: string;
  lunchEnd?: string;
  isVerified?: boolean;
  queues: Queue[];
}

export interface Queue {
  id: string;
  name: string;
  isActive: boolean;
  entries: QueueEntry[];
}

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  ON_HOLD = 'ON_HOLD'
}

export interface QueueEntry {
  id: string;
  userId: string;
  userName: string;
  joinedAt: number;
  startedAt?: number;
  completedAt?: number;
  status: QueueStatus;
  estimatedMinutes: number;
  alertThreshold?: number; // Minutes before turn to notify
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  read: boolean;
}
