
import { Shop, Notification, BackendBooking } from './types';

// Helper to get timestamps for today
const getTodayTimestamp = (hour: number, minute: number, offsetMinutes: number = 0) => {
  const now = new Date();
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return new Date(d.getTime() + offsetMinutes * 60000);
};

// 1. Shops Collection (Shops + Service Lines definitions, NO entries)
export const getMockShops = (): Shop[] => {
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
      serviceLines: [
        {
          id: 'q-r-1',
          name: 'General Consultation',
          isActive: true,
          entries: [] // Empty, populated via join
        },
        {
          id: 'q-r-2',
          name: 'Pharmacy / Pickup',
          isActive: true,
          entries: []
        },
        {
          id: 'q-r-3-slots',
          name: 'Vaccination Drive',
          isActive: true,
          entries: [],
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
      serviceLines: [
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
      serviceLines: [
        {
          id: 'q-r-4',
          name: 'Haircut Appointments',
          isActive: true,
          entries: [],
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

// 2. Bookings Collection (Normalized)
export const getMockBookings = (): BackendBooking[] => {
  const now = new Date();
  
  return [
    // City Health Clinic - General Consultation
    {
      _id: 'bk_1',
      customerId: 'u-1',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-1',
      status: 'serving',
      joinedAt: new Date(now.getTime() - 1200000).toISOString(),
      estimatedMinutes: 5,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'General Consultation',
        customerName: 'Sarah Jenkins'
      }
    },
    {
      _id: 'bk_2',
      customerId: 'u-2',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-1',
      status: 'waiting',
      joinedAt: new Date(now.getTime() - 600000).toISOString(),
      estimatedMinutes: 15,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'General Consultation',
        customerName: 'Michael Chen'
      }
    },
    {
      _id: 'bk_3',
      customerId: 'u-3',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-1',
      status: 'waiting',
      joinedAt: new Date(now.getTime() - 300000).toISOString(),
      estimatedMinutes: 25,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'General Consultation',
        customerName: 'Emma Wilson'
      }
    },

    // City Health Clinic - Pharmacy
    {
      _id: 'bk_4',
      customerId: 'u-4',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-2',
      status: 'waiting',
      joinedAt: new Date(now.getTime() - 100000).toISOString(),
      estimatedMinutes: 5,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'Pharmacy / Pickup',
        customerName: 'Robert Brown'
      }
    },

    // City Health Clinic - Vaccination (Slots)
    {
      _id: 'bk_v_1',
      customerId: 'u-10',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-3-slots',
      status: 'confirmed',
      appointmentTime: getTodayTimestamp(10, 0).toISOString(),
      joinedAt: new Date(now.getTime() - 100000).toISOString(),
      estimatedMinutes: 0,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'Vaccination Drive',
        customerName: 'Patient Zero'
      }
    },
    {
      _id: 'bk_v_2',
      customerId: 'u-11',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-3-slots',
      status: 'confirmed',
      appointmentTime: getTodayTimestamp(10, 0).toISOString(),
      joinedAt: new Date(now.getTime() - 90000).toISOString(),
      estimatedMinutes: 0,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'Vaccination Drive',
        customerName: 'Patient One'
      }
    },
    {
      _id: 'bk_v_3',
      customerId: 'u-12',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-3-slots',
      status: 'confirmed',
      appointmentTime: getTodayTimestamp(10, 0).toISOString(),
      joinedAt: new Date(now.getTime() - 80000).toISOString(),
      estimatedMinutes: 0,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'Vaccination Drive',
        customerName: 'Patient Two'
      }
    },
    {
      _id: 'bk_v_4',
      customerId: 'u-13',
      shopId: 'shop-r-1',
      serviceLineId: 'q-r-3-slots',
      status: 'confirmed',
      appointmentTime: getTodayTimestamp(14, 0).toISOString(),
      joinedAt: new Date(now.getTime() - 70000).toISOString(),
      estimatedMinutes: 0,
      details: {
        shopName: 'City Health Clinic',
        serviceName: 'Vaccination Drive',
        customerName: 'Afternoon Patient'
      }
    },

    // Style Studio Salon - Appointments
    {
      _id: 'bk_s_1',
      customerId: 'u-20',
      shopId: 'shop-r-3',
      serviceLineId: 'q-r-4',
      status: 'completed',
      appointmentTime: getTodayTimestamp(10, 30).toISOString(),
      joinedAt: new Date(now.getTime() - 3600000).toISOString(),
      estimatedMinutes: 0,
      details: {
        shopName: 'Style Studio Salon',
        serviceName: 'Haircut Appointments',
        customerName: 'John Doe'
      }
    }
  ];
};

export const getMockNotifications = (): Notification[] => [
  { id: 'n-1', userId: 'any', message: 'The queue is moving: A customer has just been served.', timestamp: Date.now() - 300000, read: false },
  { id: 'n-2', userId: 'any', message: 'Your estimated wait time has been updated.', timestamp: Date.now() - 600000, read: false },
  { id: 'n-3', userId: 'any', message: 'Clinic Update: Business hours for the weekend have been posted.', timestamp: Date.now() - 3600000, read: true },
];
