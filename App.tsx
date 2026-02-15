
import React, { useState, useEffect } from 'react';
import { User, UserRole, Shop, Queue, QueueEntry, QueueStatus, Notification, BackendBooking } from './types';
import { getMockShops, getMockBookings, getMockNotifications } from './mockData';
import Login from './components/Login';
import VendorView from './components/VendorView';
import DashboardView from './components/DashboardView';
import CustomerView from './components/CustomerView';
import ProfileView from './components/ProfileView';
import { Bell, User as UserIcon, LogOut, LayoutDashboard, Search, BarChart3, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('qe_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Adapter function to convert backend Booking to frontend QueueEntry
  const mapBackendToFrontend = (booking: BackendBooking): QueueEntry => {
    let status = QueueStatus.WAITING;
    switch (booking.status) {
      case 'serving': status = QueueStatus.IN_PROGRESS; break;
      case 'completed': status = QueueStatus.COMPLETED; break;
      case 'cancelled': status = QueueStatus.CANCELLED; break;
      case 'confirmed': status = QueueStatus.WAITING; break;
      case 'waiting': status = QueueStatus.WAITING; break;
      default: status = QueueStatus.WAITING;
    }

    return {
      id: booking._id,
      userId: booking.customerId,
      userName: booking.details.customerName,
      joinedAt: booking.joinedAt ? new Date(booking.joinedAt).getTime() : Date.now(),
      status: status,
      estimatedMinutes: booking.estimatedMinutes || 0,
      bookedSlotStart: booking.appointmentTime ? new Date(booking.appointmentTime).getTime() : undefined
    };
  };

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('qe_shops');
    if (saved) return JSON.parse(saved);
    
    // Simulate Backend Join
    const mockShops = getMockShops();
    const mockBookings = getMockBookings();

    return mockShops.map(shop => ({
      ...shop,
      serviceLines: shop.serviceLines.map(queue => ({
        ...queue,
        entries: mockBookings
          .filter(b => b.shopId === shop.id && b.serviceLineId === queue.id)
          .map(mapBackendToFrontend)
      }))
    }));
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return getMockNotifications();
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    localStorage.setItem('qe_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('qe_shops', JSON.stringify(shops));
  }, [shops]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qe_user');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return user.role === UserRole.VENDOR ? (
          <VendorView user={user} shops={shops} setShops={setShops} />
        ) : (
          <CustomerView user={user} shops={shops} setShops={setShops} />
        );
      case 'dashboard':
        return user.role === UserRole.VENDOR ? (
          <DashboardView user={user} shops={shops} />
        ) : (
          <CustomerView user={user} shops={shops} setShops={setShops} initialView="insights" />
        );
      case 'search':
        return <CustomerView user={user} shops={shops} setShops={setShops} forceDiscovery={true} />;
      case 'profile':
        return <ProfileView user={user} onUpdate={setUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Rocket Queue</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); markAllRead(); }}
            className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Bell className="w-6 h-6" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={() => setShowNotifications(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-400">No notifications yet</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                    <p className="text-sm text-gray-800 font-medium mb-1">{n.message}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 overflow-x-hidden">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center safe-bottom z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        {user.role === UserRole.CUSTOMER && (
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'search' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-bold">Find</span>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
