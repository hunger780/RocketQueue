
import { Shop, Notification, QueueStatus } from './types';

export const getMockShops = (): Shop[] => [
  {
    id: 'shop-r-1',
    vendorId: 'vendor-r-mock',
    name: 'City Health Clinic',
    address: '789 Medical Plaza, Suite 200',
    landmark: 'Opposite Central Park',
    phone: '555-0800',
    category: 'Medical Clinic',
    openingTime: '08:00',
    closingTime: '20:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    isVerified: true,
    queues: [
      {
        id: 'q-r-1',
        name: 'General Consultation',
        isActive: true,
        timeslotConfig: {
          isEnabled: true,
          slotDuration: 30,
          maxPerSlot: 1
        },
        entries: [
          { id: 'e-1', userId: 'u-1', userName: 'Sarah Jenkins', joinedAt: Date.now() - 1200000, status: QueueStatus.IN_PROGRESS, estimatedMinutes: 5, bookedSlotStart: new Date().setHours(9, 0, 0, 0) },
          { id: 'e-2', userId: 'u-2', userName: 'Michael Chen', joinedAt: Date.now() - 600000, status: QueueStatus.WAITING, estimatedMinutes: 15, bookedSlotStart: new Date().setHours(9, 30, 0, 0) },
        ]
      },
      {
        id: 'q-r-2',
        name: 'Pharmacy / Pickup',
        isActive: true,
        entries: [
          { id: 'e-4', userId: 'u-4', userName: 'Robert Brown', joinedAt: Date.now() - 100000, status: QueueStatus.WAITING, estimatedMinutes: 5 },
        ]
      }
    ]
  },
  {
    id: 'shop-r-2',
    vendorId: 'vendor-r-mock',
    name: 'Gourmet Bites Bakery',
    address: '12 Bakery Lane',
    landmark: 'Near the Old Clock Tower',
    phone: '555-0900',
    category: 'Bakery',
    openingTime: '06:00',
    closingTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '12:30',
    isVerified: false,
    queues: [
      {
        id: 'q-r-3',
        name: 'Fresh Pastry Line',
        isActive: true,
        entries: []
      }
    ]
  }
];

export const getMockNotifications = (): Notification[] => [
  { id: 'n-1', userId: 'any', message: 'The queue is moving: A customer has just been served.', timestamp: Date.now() - 300000, read: false },
  { id: 'n-2', userId: 'any', message: 'Your estimated wait time has been updated.', timestamp: Date.now() - 600000, read: false },
  { id: 'n-3', userId: 'any', message: 'Clinic Update: Business hours for the weekend have been posted.', timestamp: Date.now() - 3600000, read: true },
];
