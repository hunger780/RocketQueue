
import { User, Shop, VendorAnalytics, CustomerAnalytics } from '../types';
import { SERVICE_FLAGS, API_BASE_URL, ENDPOINTS } from '../constants';
import * as MockData from '../mockData';
import { mapBackendToFrontend } from '../utils';

// Generic Fetch Wrapper
const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('qe_auth_token') || ''}`
        },
        ...options
    });
    if (!response.ok) throw new Error('API Request Failed');
    return response.json();
};

export const authService = {
    login: async (email: string): Promise<User | null> => {
        if (SERVICE_FLAGS.USE_MOCK_AUTH) {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
            return MockData.getMockAuthUser(email);
        }
        return apiRequest<User>(ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
};

export const shopService = {
    getAll: async (): Promise<Shop[]> => {
        if (SERVICE_FLAGS.USE_MOCK_SHOPS) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const shops = MockData.getMockShops();
            const bookings = MockData.getMockBookings();
            
            // Merge logic (Backend usually does this, or provides endpoints to join)
            return shops.map(shop => ({
                ...shop,
                serviceLines: shop.serviceLines.map(queue => ({
                    ...queue,
                    entries: bookings
                        .filter(b => b.shopId === shop.id && b.serviceLineId === queue.id)
                        .map(mapBackendToFrontend)
                }))
            }));
        }
        return apiRequest<Shop[]>(ENDPOINTS.SHOPS.LIST);
    },

    search: async (query: string, category: string, location?: {lat: number, lng: number}): Promise<Shop[]> => {
         if (SERVICE_FLAGS.USE_MOCK_SEARCH) {
             const allShops = await shopService.getAll(); // Reuse the mock getter logic
             return MockData.findServices(allShops, query, category, location);
         }
         
         const params = new URLSearchParams();
         if(query) params.append('q', query);
         if(category) params.append('cat', category);
         if(location) {
             params.append('lat', location.lat.toString());
             params.append('lng', location.lng.toString());
         }
         return apiRequest<Shop[]>(`${ENDPOINTS.SHOPS.SEARCH}?${params.toString()}`);
    }
};

export const analyticsService = {
    getVendorStats: async (shopId: string, timeframe: 'daily' | 'weekly' | 'yearly'): Promise<VendorAnalytics> => {
        if (SERVICE_FLAGS.USE_MOCK_ANALYTICS) {
             await new Promise(resolve => setTimeout(resolve, 400));
             return MockData.getVendorAnalytics(shopId, timeframe);
        }
        return apiRequest<VendorAnalytics>(`${ENDPOINTS.ANALYTICS.VENDOR}/${shopId}?timeframe=${timeframe}`);
    },
    
    getCustomerStats: async (userId: string): Promise<CustomerAnalytics> => {
        if (SERVICE_FLAGS.USE_MOCK_ANALYTICS) {
             await new Promise(resolve => setTimeout(resolve, 400));
             return MockData.getCustomerAnalytics(userId);
        }
        return apiRequest<CustomerAnalytics>(`${ENDPOINTS.ANALYTICS.CUSTOMER}/${userId}`);
    }
};
