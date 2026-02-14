
import { Shop, Notification, QueueStatus } from './types';

export const getMockShops = (): Shop[] => {
  const now = new Date();
  // Reset to start of day for slot calculations
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const getSlotTimestamp = (hour: number, minute: number) => {
    const t = new Date(todayStart);
    t.setHours(hour, minute, 0, 0);
    return t.getTime();
  };

  return [
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
          entries: [
            { id: 'e-1', userId: 'u-1', userName: 'Sarah Jenkins', joinedAt: Date.now() - 1200000, status: QueueStatus.IN_PROGRESS, estimatedMinutes: 5 },
            { id: 'e-2', userId: 'u-2', userName: 'Michael Chen', joinedAt: Date.now() - 600000, status: QueueStatus.WAITING, estimatedMinutes: 15 },
            { id: 'e-3', userId: 'u-3', userName: 'Emma Wilson', joinedAt: Date.now() - 300000, status: QueueStatus.WAITING, estimatedMinutes: 25 },
          ]
        },
        {
          id: 'q-r-2',
          name: 'Pharmacy / Pickup',
          isActive: true,
          entries: [
            { id: 'e-4', userId: 'u-4', userName: 'Robert Brown', joinedAt: Date.now() - 100000, status: QueueStatus.WAITING, estimatedMinutes: 5 },
          ]
        },
        {
          id: 'q-r-3-slots',
          name: 'Vaccination Drive',
          isActive: true,
          entries: [
            // Fully booked slot at 10:00
            { 
              id: 'e-v-1', 
              userId: 'u-10', 
              userName: 'Patient Zero', 
              joinedAt: Date.now() - 100000, 
              status: QueueStatus.WAITING, 
              estimatedMinutes: 0,
              bookedSlotStart: getSlotTimestamp(10, 0)
            },
            { 
              id: 'e-v-2', 
              userId: 'u-11', 
              userName: 'Patient One', 
              joinedAt: Date.now() - 90000, 
              status: QueueStatus.WAITING, 
              estimatedMinutes: 0,
              bookedSlotStart: getSlotTimestamp(10, 0)
            },
            { 
              id: 'e-v-3', 
              userId: 'u-12', 
              userName: 'Patient Two', 
              joinedAt: Date.now() - 80000, 
              status: QueueStatus.WAITING, 
              estimatedMinutes: 0,
              bookedSlotStart: getSlotTimestamp(10, 0)
            },
             // Partially booked slot at 14:00
            { 
              id: 'e-v-4', 
              userId: 'u-13', 
              userName: 'Afternoon Patient', 
              joinedAt: Date.now() - 70000, 
              status: QueueStatus.WAITING, 
              estimatedMinutes: 0,
              bookedSlotStart: getSlotTimestamp(14, 0)
            }
          ],
          slotConfig: {
            isEnabled: true,
            duration: 15,
            maxCapacity: 3
          }
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
    },
    {
      id: 'shop-r-3',
      vendorId: 'vendor-r-mock',
      name: 'Style Studio Salon',
      address: '45 Fashion Ave',
      landmark: 'Next to Mall',
      phone: '555-1234',
      category: 'Salon',
      openingTime: '10:00',
      closingTime: '20:00',
      isVerified: true,
      queues: [
        {
          id: 'q-r-4',
          name: 'Haircut Appointments',
          isActive: true,
          entries: [
             { 
              id: 'e-s-1', 
              userId: 'u-20', 
              userName: 'John Doe', 
              joinedAt: Date.now() - 3600000, 
              status: QueueStatus.COMPLETED, 
              estimatedMinutes: 0,
              bookedSlotStart: getSlotTimestamp(10, 30)
            }
          ],
          slotConfig: {
            isEnabled: true,
            duration: 30,
            maxCapacity: 1
          }
        }
      ]
    }
  ];
};

export const getMockNotifications = (): Notification[] => [
  { id: 'n-1', userId: 'any', message: 'The queue is moving: A customer has just been served.', timestamp: Date.now() - 300000, read: false },
  { id: 'n-2', userId: 'any', message: 'Your estimated wait time has been updated.', timestamp: Date.now() - 600000, read: false },
  { id: 'n-3', userId: 'any', message: 'Clinic Update: Business hours for the weekend have been posted.', timestamp: Date.now() - 3600000, read: true },
];
