
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

export interface SlotConfig {
  isEnabled: boolean;
  duration: number; // in minutes
  maxCapacity: number;
}

export interface TimeRange {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  name?: string;
}

export interface QueueSchedule {
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  breaks: TimeRange[];
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
  latitude?: number;
  longitude?: number;
  serviceLines: Queue[];
}

export interface Queue {
  id: string;
  name: string;
  isActive: boolean;
  entries: QueueEntry[];
  slotConfig?: SlotConfig;
  schedule?: QueueSchedule;
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
  bookedSlotStart?: number; // Unix timestamp for the start of the booked slot
}

// Normalized Backend Structure
export interface BackendBooking {
  _id: string;
  customerId: string;
  shopId: string;
  serviceLineId: string; 
  status: string; // 'confirmed', 'waiting', 'serving', 'completed', 'cancelled'
  appointmentTime?: string; // ISO 8601 String
  joinedAt?: string; // ISO 8601 String
  estimatedMinutes?: number;
  details: {
    shopName: string;
    serviceName: string;
    customerName: string;
  };
}

// Service Availability Structure
export interface ServiceSlot {
  startTime: string; // ISO 8601 String
  endTime: string;   // ISO 8601 String
  isAvailable: boolean;
  capacity: number;
  bookedCount: number;
}

export interface ServiceSchedule {
  serviceLineId: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  slots: ServiceSlot[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Analytics Interfaces
export interface ServiceLineAnalytics {
  id: string;
  name: string;
  totalServed: number;
  avgWaitTime: number; // in minutes
}

export interface VendorAnalytics {
  totalServed: number;
  avgServiceTime: number;
  peakTime: string;
  trafficData: number[];
  growthData: number[];
  labels: string[];
  waitingNow: number;
  growthPercentage: number;
  serviceLinesData: ServiceLineAnalytics[];
}

export interface CustomerAnalytics {
  tokensHistory: number[];
  timeSavedHistory: number[];
  labels: string[];
  totalSaved: number;
  totalTokens: number;
  reliability: number;
  streak: number;
}
