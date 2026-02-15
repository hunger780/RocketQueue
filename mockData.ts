
import { Shop, Notification, BackendBooking, ServiceSchedule, QueueStatus, VendorAnalytics, CustomerAnalytics, User, UserRole } from './types';

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
      latitude: 40.785091,
      longitude: -73.968285,
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
      latitude: 40.758896,
      longitude: -73.985130,
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
      latitude: 40.7233,
      longitude: -74.0030,
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
    },
    {
      id: 'shop-r-4',
      vendorId: 'vendor-o-1',
      name: 'Tech Fix Central',
      address: '101 Digital Blvd',
      phone: '555-9988',
      category: 'Repair Service',
      openingTime: '10:00',
      closingTime: '19:00',
      isVerified: true,
      latitude: 40.7128,
      longitude: -74.0060,
      serviceLines: [
        { id: 'q-o-1', name: 'Device Repair', isActive: true, entries: [] },
        { id: 'q-o-2', name: 'Pickup', isActive: true, entries: [] }
      ]
    },
    {
      id: 'shop-r-5',
      vendorId: 'vendor-o-2',
      name: 'The Burger Joint',
      address: '55 Tasty Street',
      phone: '555-7766',
      category: 'Restaurant',
      openingTime: '11:00',
      closingTime: '23:00',
      isVerified: false,
      latitude: 40.730610,
      longitude: -73.935242,
      serviceLines: [
        { id: 'q-o-3', name: 'Table Waiting List', isActive: true, entries: [] },
        { id: 'q-o-4', name: 'Takeout', isActive: true, entries: [] }
      ]
    },
    {
      id: 'shop-r-6',
      vendorId: 'vendor-o-3',
      name: 'City Central Bank',
      address: '1 Financial District',
      phone: '555-4433',
      category: 'Bank',
      openingTime: '09:00',
      closingTime: '16:00',
      isVerified: true,
      latitude: 40.7074,
      longitude: -74.0113,
      serviceLines: [
        { id: 'q-o-5', name: 'Teller Services', isActive: true, entries: [] },
        { id: 'q-o-6', name: 'Loan Officer', isActive: true, entries: [] }
      ]
    },
    {
      id: 'shop-r-7',
      vendorId: 'vendor-o-4',
      name: 'Metro Post Office',
      address: '88 Mail Route',
      phone: '555-2211',
      category: 'Government',
      openingTime: '08:00',
      closingTime: '17:00',
      isVerified: true,
      latitude: 40.7505,
      longitude: -73.9934,
      serviceLines: [
        { id: 'q-o-7', name: 'Package Pickup', isActive: true, entries: [] },
        { id: 'q-o-8', name: 'Shipping Services', isActive: true, entries: [] }
      ]
    },
    {
      id: 'shop-r-8',
      vendorId: 'vendor-o-5',
      name: 'Dr. Smith Dental',
      address: '32 Smile Lane',
      phone: '555-1122',
      category: 'Medical Clinic',
      openingTime: '09:00',
      closingTime: '17:00',
      isVerified: true,
      latitude: 40.7736,
      longitude: -73.9566,
      serviceLines: [
        { id: 'q-o-9', name: 'Dental Cleaning', isActive: true, entries: [], slotConfig: { isEnabled: true, duration: 45, maxCapacity: 1 } },
        { id: 'q-o-10', name: 'Emergency', isActive: true, entries: [] }
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

// 3. Service Schedule (Mock Backend Logic)
export const getMockServiceSchedule = (shop: Shop, serviceLineId: string): ServiceSchedule => {
  const serviceLine = shop.serviceLines.find(q => q.id === serviceLineId);
  
  if (!serviceLine || !serviceLine.slotConfig?.isEnabled) {
    return { serviceLineId, date: new Date().toISOString().split('T')[0], slots: [] };
  }

  const duration = serviceLine.slotConfig.duration;
  const capacity = serviceLine.slotConfig.maxCapacity;

  // Use queue schedule if available, else fallback to shop schedule
  const startStr = serviceLine.schedule?.startTime || shop.openingTime || "09:00";
  const endStr = serviceLine.schedule?.endTime || shop.closingTime || "18:00";
  
  const [openH, openM] = startStr.split(':').map(Number);
  const [closeH, closeM] = endStr.split(':').map(Number);
  
  const now = new Date();
  const startTime = new Date(now);
  startTime.setHours(openH, openM, 0, 0);
  
  const endTime = new Date(now);
  endTime.setHours(closeH, closeM, 0, 0);

  // Parse breaks
  const breaks = (serviceLine.schedule?.breaks || []).map(b => {
    const [sh, sm] = b.start.split(':').map(Number);
    const [eh, em] = b.end.split(':').map(Number);
    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(now);
    end.setHours(eh, em, 0, 0);
    return { start: start.getTime(), end: end.getTime() };
  });
  
  const slots = [];
  let current = startTime;

  const isTerminalStatus = (status: QueueStatus) => {
    return status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED || status === QueueStatus.NO_SHOW;
  };
  
  while (current < endTime) {
    const slotStart = current.getTime();
    const slotEnd = slotStart + duration * 60000;
    
    // Check overlapping breaks
    const isBreak = breaks.some(b => {
      return (slotStart >= b.start && slotStart < b.end) || 
             (slotEnd > b.start && slotEnd <= b.end) ||
             (slotStart <= b.start && slotEnd >= b.end);
    });

    if (!isBreak) {
      const bookedCount = serviceLine.entries.filter(e => e.bookedSlotStart === slotStart && !isTerminalStatus(e.status)).length;
      
      slots.push({
        startTime: current.toISOString(),
        endTime: new Date(slotEnd).toISOString(),
        isAvailable: bookedCount < capacity,
        capacity: capacity,
        bookedCount: bookedCount
      });
    }
    
    current = new Date(current.getTime() + duration * 60000);
  }

  return {
    serviceLineId,
    date: now.toISOString().split('T')[0],
    slots
  };
};

// 4. Vendor Dashboard Analytics Mock
export const getVendorAnalytics = (shopId: string, timeframe: 'daily' | 'weekly' | 'yearly'): VendorAnalytics => {
  // Simulate active entries count based on shopId (generic for now)
  const waitingNow = 12; 

  const baseServiceLines = [
    { id: 'q1', name: 'General Consultation', baseServed: 24, baseWait: 45 },
    { id: 'q2', name: 'Pharmacy / Pickup', baseServed: 18, baseWait: 12 },
    { id: 'q3', name: 'Vaccination Drive', baseServed: 6, baseWait: 5 }
  ];

  if (timeframe === 'weekly') {
    return {
      totalServed: 842,
      avgServiceTime: 16,
      peakTime: "Saturday",
      trafficData: [150, 180, 210, 190, 250, 310, 280],
      growthData: [100, 120, 140, 130, 170, 210, 190],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      waitingNow,
      growthPercentage: 15,
      serviceLinesData: baseServiceLines.map(sl => ({
        ...sl,
        totalServed: sl.baseServed * 7,
        avgWaitTime: sl.baseWait
      }))
    };
  } else if (timeframe === 'yearly') {
    return {
      totalServed: 24500,
      avgServiceTime: 15,
      peakTime: "December",
      trafficData: [1200, 1100, 1300, 1500, 1800, 2000, 2200, 2100, 1900, 2400, 2800, 3200],
      growthData: [800, 900, 1100, 1300, 1500, 1800, 2000, 2200, 2100, 2400, 2600, 3000],
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      waitingNow,
      growthPercentage: 22,
      serviceLinesData: baseServiceLines.map(sl => ({
        ...sl,
        totalServed: sl.baseServed * 365,
        avgWaitTime: sl.baseWait - 2
      }))
    };
  }
  
  // Default Daily
  return {
    totalServed: 48,
    avgServiceTime: 18,
    peakTime: "2:00 PM",
    trafficData: [12, 19, 15, 8, 22, 30, 25, 18, 12, 14, 20, 10],
    growthData: [5, 15, 10, 25, 20, 35, 30, 45, 40, 55, 50, 65],
    labels: ['9a', '11a', '1p', '3p', '5p', '7p', '9p'],
    waitingNow,
    growthPercentage: 12,
    serviceLinesData: baseServiceLines.map(sl => ({
      ...sl,
      totalServed: sl.baseServed,
      avgWaitTime: sl.baseWait
    }))
  };
};

// 5. Customer Dashboard Analytics Mock
export const getCustomerAnalytics = (userId: string): CustomerAnalytics => {
  return {
    tokensHistory: [3, 5, 2, 8, 4, 6, 7],
    timeSavedHistory: [35, 60, 20, 90, 45, 75, 55],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    totalSaved: 380,
    totalTokens: 35,
    reliability: 98,
    streak: 12
  };
};

// 6. Mock Authentication Data
export const getMockAuthUser = (email: string): User | null => {
  const normalizedEmail = email.toLowerCase();
  
  if (normalizedEmail === 'r@r.com') {
    return {
      id: 'vendor-r-mock',
      name: 'Premium Vendor',
      email: 'r@r.com',
      phone: '123-456-7890',
      role: UserRole.VENDOR
    };
  }
  
  if (normalizedEmail === 'asd@asd.com') {
    return {
      id: 'u-1',
      name: 'Sarah Jenkins',
      email: 'asd@asd.com',
      phone: '555-0123',
      role: UserRole.CUSTOMER
    };
  }

  return null;
};

// 7. Find Services Mock API
export const findServices = async (
  allShops: Shop[],
  query?: string,
  category?: string,
  location?: { lat: number; lng: number }
): Promise<Shop[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let results = allShops;

  if (category && category !== 'All') {
    results = results.filter(s => s.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.address.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  if (location) {
    // Simple mock distance sorting (approximate)
    // In a real backend, this would use a geospatial query
    results = results.map(s => {
      // Default to 0,0 if shop has no coordinates for sorting safety
      const sLat = s.latitude || 0;
      const sLng = s.longitude || 0;
      
      // Calculate distance squared (sufficient for sorting)
      const distance = Math.pow(sLat - location.lat, 2) + Math.pow(sLng - location.lng, 2);
      
      // Attach distance temporarily for sort
      return { ...s, _sortDistance: distance };
    })
    .sort((a: any, b: any) => a._sortDistance - b._sortDistance)
    .map((s: any) => {
      const { _sortDistance, ...rest } = s;
      return rest as Shop;
    });
  }

  return results;
};
