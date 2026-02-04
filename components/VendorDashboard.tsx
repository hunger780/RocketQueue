
import React, { useState, useEffect, useMemo } from 'react';
import { User, Shop, Queue, QueueStatus, QueueEntry } from '../types';
import { 
  Plus, Store, Users, Play, CheckCircle2, QrCode, MapPin, X, 
  Download, UserX, Pause, Square, Clock, Phone, Map as MapIcon,
  TrendingUp, BarChart3, Timer, Zap, Calendar, ArrowUpRight, ChevronDown
} from 'lucide-react';
import QRCode from 'qrcode';

interface VendorDashboardProps {
  user: User;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  initialView?: 'queues' | 'insights';
}

type Timeframe = 'daily' | 'weekly' | 'yearly';

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, shops, setShops, initialView = 'queues' }) => {
  const [viewMode, setViewMode] = useState<'queues' | 'insights'>(initialView);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [showAddShop, setShowAddShop] = useState(false);
  const [showAddQueue, setShowAddQueue] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<Shop | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [newShopData, setNewShopData] = useState({
    name: '', address: '', landmark: '', mapUrl: '', phone: '',
    category: 'Retail', openingTime: '09:00', closingTime: '21:00',
    lunchStart: '13:00', lunchEnd: '14:00'
  });
  const [newQueueName, setNewQueueName] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(shops.find(s => s.vendorId === user.id)?.id || null);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  const vendorShops = shops.filter(s => s.vendorId === user.id);
  const currentShop = shops.find(s => s.id === selectedShopId);

  const analytics = useMemo(() => {
    if (!currentShop) return null;
    const allEntries = currentShop.queues.flatMap(q => q.entries);
    const completed = allEntries.filter(e => e.status === QueueStatus.COMPLETED);
    
    // Vary data by timeframe
    let stats = {
      totalServed: 0,
      avgServiceTime: 0,
      peakTime: "",
      hourlyData: [] as number[],
      labels: [] as string[]
    };

    if (timeframe === 'daily') {
      stats = {
        totalServed: completed.length + 42,
        avgServiceTime: 18,
        peakTime: "2:00 PM",
        hourlyData: [12, 19, 15, 8, 22, 30, 25, 18, 12, 14, 20, 10],
        labels: ['9a', '11a', '1p', '3p', '5p', '7p', '9p']
      };
    } else if (timeframe === 'weekly') {
      stats = {
        totalServed: (completed.length + 42) * 7,
        avgServiceTime: 16,
        peakTime: "Saturday",
        hourlyData: [150, 180, 210, 190, 250, 310, 280],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
    } else {
      stats = {
        totalServed: (completed.length + 42) * 365,
        avgServiceTime: 15,
        peakTime: "December",
        hourlyData: [1200, 1100, 1300, 1500, 1800, 2000, 2200, 2100, 1900, 2400, 2800, 3200],
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']
      };
    }
    
    return { ...stats, waitingNow: allEntries.filter(e => e.status === QueueStatus.WAITING).length };
  }, [currentShop, timeframe]);

  useEffect(() => {
    if (showQrModal) {
      const qrValue = JSON.stringify({ type: 'shop', id: showQrModal.id });
      QRCode.toDataURL(qrValue, { width: 300, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [showQrModal]);

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    const shop: Shop = {
      id: 'shop-' + Math.random().toString(36).substr(2, 9),
      vendorId: user.id,
      ...newShopData,
      queues: []
    };
    setShops([...shops, shop]);
    setNewShopData({
      name: '', address: '', landmark: '', mapUrl: '', phone: '',
      category: 'Retail', openingTime: '09:00', closingTime: '21:00',
      lunchStart: '13:00', lunchEnd: '14:00'
    });
    setShowAddShop(false);
    setSelectedShopId(shop.id);
  };

  const handleAddQueue = (shopId: string) => {
    if (!newQueueName) return;
    const newQueue: Queue = {
      id: 'q-' + Math.random().toString(36).substr(2, 9),
      name: newQueueName,
      isActive: true,
      entries: []
    };
    setShops(shops.map(s => s.id === shopId ? { ...s, queues: [...s.queues, newQueue] } : s));
    setNewQueueName('');
    setShowAddQueue(null);
  };

  const updateEntryStatus = (queueId: string, entryId: string, status: QueueStatus) => {
    setShops(shops.map(s => ({
      ...s,
      queues: s.queues.map(q => q.id === queueId ? {
        ...q,
        entries: q.entries.map(e => e.id === entryId ? {
          ...e,
          status,
          startedAt: status === QueueStatus.IN_PROGRESS ? Date.now() : e.startedAt,
          completedAt: (status === QueueStatus.COMPLETED || status === QueueStatus.NO_SHOW) ? Date.now() : e.completedAt
        } : e)
      } : q)
    })));
  };

  const isTerminalStatus = (status: QueueStatus) => {
    return status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED || status === QueueStatus.NO_SHOW;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{viewMode === 'insights' ? 'Business Insights' : 'Your Shops'}</h2>
        <button
          onClick={() => setShowAddShop(true)}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {vendorShops.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {vendorShops.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedShopId(s.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                selectedShopId === s.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {currentShop && viewMode === 'queues' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{currentShop.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {currentShop.address}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md text-indigo-700 font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> {currentShop.openingTime} - {currentShop.closingTime}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowQrModal(currentShop)}
                className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <h4 className="font-bold text-gray-700">Service Lines</h4>
            <button onClick={() => setShowAddQueue(currentShop.id)} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> New Line
            </button>
          </div>

          <div className="space-y-5">
            {currentShop.queues.map(q => (
              <div key={q.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h5 className="font-bold text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-indigo-500" /> {q.name}
                  </h5>
                  <span className="bg-green-100 text-green-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    {q.entries.filter(e => e.status === QueueStatus.WAITING).length} Waiting
                  </span>
                </div>

                <div className="space-y-3">
                  {q.entries.filter(e => !isTerminalStatus(e.status)).length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-400 font-medium">No customers currently in line</p>
                    </div>
                  ) : (
                    q.entries
                      .filter(e => !isTerminalStatus(e.status))
                      .map((e, idx) => (
                        <div key={e.id} className="flex flex-col p-4 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-black font-black text-2xl opacity-20">#{idx + 1}</span>
                              <div>
                                <p className="text-base font-bold text-black">{e.userName}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Joined {new Date(e.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                            {e.status !== QueueStatus.WAITING && (
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${
                                e.status === QueueStatus.IN_PROGRESS ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {e.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {e.status !== QueueStatus.IN_PROGRESS ? (
                              <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.IN_PROGRESS)} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                                <Play className="w-4 h-4" /> START
                              </button>
                            ) : (
                              <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.COMPLETED)} className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-green-700 transition-all shadow-md shadow-green-100">
                                <Square className="w-4 h-4" /> STOP
                              </button>
                            )}
                            <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.ON_HOLD)} className="flex items-center justify-center gap-2 py-3 bg-white text-amber-600 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all">
                              <Pause className="w-4 h-4" /> HOLD
                            </button>
                            <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.NO_SHOW)} className="flex items-center justify-center gap-2 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all">
                              <UserX className="w-4 h-4" /> NO SHOW
                            </button>
                            <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.CANCELLED)} className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all">
                              <X className="w-4 h-4" /> CANCEL
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentShop && viewMode === 'insights' && analytics && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Timeframe Selector */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            {(['daily', 'weekly', 'yearly'] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> 12%</span>
              </div>
              <div>
                <p className="text-3xl font-black text-black">{analytics.totalServed}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Served {timeframe.replace('ly', '')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Timer className="w-5 h-5" /></div>
              </div>
              <div>
                <p className="text-3xl font-black text-black">{analytics.avgServiceTime}m</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Avg. Service Time</p>
              </div>
            </div>
          </div>

          {/* Footsteps Graph */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-black text-black">Traffic Analysis</h4>
              <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Peak: {analytics.peakTime}</div>
            </div>
            
            <div className="relative h-56 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M ${analytics.hourlyData.map((val, i) => `${(i * 400) / (analytics.hourlyData.length - 1)},${100 - (val / Math.max(...analytics.hourlyData) * 90)}`).join(' L ')}`} 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d={`M 0,100 L ${analytics.hourlyData.map((val, i) => `${(i * 400) / (analytics.hourlyData.length - 1)},${100 - (val / Math.max(...analytics.hourlyData) * 90)}`).join(' L ')} L 400,100 Z`} 
                  fill="url(#chartGradient)" 
                />
              </svg>
              <div className="flex justify-between mt-6 px-1">
                {analytics.labels.map(label => (
                  <span key={label} className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms/Modals ensure text-black */}
      {showAddShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 my-8 animate-in zoom-in duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Add New Shop</h3>
              <button onClick={() => setShowAddShop(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddShop} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Identity</label>
                <div className="grid grid-cols-2 gap-4">
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Shop Name" value={newShopData.name} onChange={e => setNewShopData({...newShopData, name: e.target.value})} />
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Category" value={newShopData.category} onChange={e => setNewShopData({...newShopData, category: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact & Reach</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Phone" value={newShopData.phone} onChange={e => setNewShopData({...newShopData, phone: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Address" value={newShopData.address} onChange={e => setNewShopData({...newShopData, address: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddShop(false)} className="flex-1 font-black text-slate-500 uppercase tracking-widest text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">Launch Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddQueue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Create Service Line</h3>
            <input className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none mb-6" placeholder="e.g. Premium VIP, Express" value={newQueueName} onChange={e => setNewQueueName(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setShowAddQueue(null)} className="flex-1 text-slate-500 font-black uppercase tracking-widest text-xs">Back</button>
              <button onClick={() => handleAddQueue(showAddQueue)} className="flex-1 py-4 bg-indigo-600 text-white rounded-[1rem] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Add Line</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal ensured high contrast */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Business QR</h3>
              <button onClick={() => setShowQrModal(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border-4 border-indigo-50 mb-8 shadow-inner">
              {qrDataUrl ? <img src={qrDataUrl} alt="Shop QR" className="w-56 h-56 rounded-lg" /> : <div className="w-56 h-56 animate-pulse bg-slate-100 rounded-lg"></div>}
            </div>
            <p className="text-xs text-center text-slate-500 font-medium mb-10 leading-relaxed">Display this in your shop. Customers can scan to join your queue instantly without waiting near you.</p>
            <button onClick={() => { const link = document.createElement('a'); link.download = `${showQrModal.name}-QR.png`; link.href = qrDataUrl; link.click(); }} className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all"><Download className="w-5 h-5" /> Save QR Code</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
