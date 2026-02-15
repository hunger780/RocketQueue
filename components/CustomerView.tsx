
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Shop, Queue, QueueEntry, QueueStatus, CustomerAnalytics } from '../types';
import { getMockServiceSchedule } from '../mockData'; // Keeping this mock for slots logic as it wasn't requested to be moved to service yet
import { shopService, analyticsService } from '../services/api';
import { Search, QrCode, MapPin, Users, ChevronRight, X, BellRing, Navigation, Trash2, Phone, BadgeCheck, TrendingUp, Zap, Clock3, Award, Sparkles, LocateFixed, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CustomerViewProps {
  user: User;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  forceDiscovery?: boolean;
  initialView?: 'home' | 'insights';
}

const CustomerView: React.FC<CustomerViewProps> = ({ user, shops, setShops, forceDiscovery = false, initialView = 'home' }) => {
  const [viewMode, setViewMode] = useState<'home' | 'insights'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredShops, setFilteredShops] = useState<Shop[]>(shops);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedQueueForSlot, setSelectedQueueForSlot] = useState<{shop: Shop, queue: Queue} | null>(null);
  const [myQueues, setMyQueues] = useState<({ shopName: string, queueName: string, entry: QueueEntry, shopId: string, queueId: string, shop: Shop })[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [personalInsights, setPersonalInsights] = useState<CustomerAnalytics | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  const isTerminalStatus = (status: QueueStatus) => {
    return status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED || status === QueueStatus.NO_SHOW;
  };

  useEffect(() => {
    const active = [];
    for (const shop of shops) {
      for (const q of shop.serviceLines) {
        const myEntry = q.entries.find(e => e.userId === user.id && !isTerminalStatus(e.status));
        if (myEntry) {
          active.push({ shopName: shop.name, queueName: q.name, entry: myEntry, shopId: shop.id, queueId: q.id, shop: shop });
        }
      }
    }
    setMyQueues(active);
  }, [shops, user.id]);

  // Fetch Personal Insights
  useEffect(() => {
    if (viewMode === 'insights') {
      analyticsService.getCustomerStats(user.id).then(setPersonalInsights).catch(console.error);
    }
  }, [viewMode, user.id]);

  const categories = useMemo(() => {
    const categoriesSet = new Set<string>();
    shops.forEach(s => {
       if (s.category) categoriesSet.add(s.category);
    });
    return ['All', ...Array.from(categoriesSet)];
  }, [shops]);

  // Use Service for Search
  useEffect(() => {
    let active = true;
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const results = await shopService.search(searchQuery, selectedCategory);
        if (active) {
          setFilteredShops(results);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory]); // Removed 'shops' dependency as search is now an "API" call

  useEffect(() => {
    if (showScanner) {
      const onScanSuccess = (decodedText: string) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'shop' && data.id) {
            const foundShop = shops.find(s => s.id === data.id);
            if (foundShop) {
              setSelectedShop(foundShop);
              setShowScanner(false);
              if (scannerRef.current) scannerRef.current.clear();
            }
          }
        } catch (e) {
          console.error("Invalid QR format", e);
        }
      };
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(onScanSuccess, (err) => {});
      scannerRef.current = scanner;
      return () => { if (scannerRef.current) scannerRef.current.clear().catch(e => console.error(e)); };
    }
  }, [showScanner, shops]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          
          try {
             // Call search service with location
             const results = await shopService.search(searchQuery, selectedCategory, { lat: latitude, lng: longitude });
             setFilteredShops(results);
          } catch (e) {
             console.error(e);
          } finally {
             setIsSearching(false);
          }
        },
        (error) => {
          setIsLocating(false);
          setIsSearching(false);
          console.error("Error getting location", error);
          alert("Unable to retrieve your location. Please check permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const joinQueue = (shop: Shop, queue: Queue, slotStart?: number) => {
    const queueLength = queue.entries.filter(e => e.status === QueueStatus.WAITING).length;
    const estMinutes = slotStart ? 0 : (queueLength + 1) * 15;
    
    const newEntry: QueueEntry = { 
      id: 'entry-' + Math.random().toString(36).substr(2, 9), 
      userId: user.id, 
      userName: user.name, 
      joinedAt: Date.now(), 
      status: QueueStatus.WAITING, 
      estimatedMinutes: estMinutes,
      bookedSlotStart: slotStart
    };
    
    // In a real implementation, this would call `bookingService.join()`
    setShops(prevShops => prevShops.map(s => s.id === shop.id ? { 
      ...s, 
      serviceLines: s.serviceLines.map(q => q.id === queue.id ? { 
        ...q, 
        entries: [...q.entries, newEntry] 
      } : q) 
    } : s));
    setSelectedShop(null);
    setSelectedQueueForSlot(null);
  };

  const leaveQueue = (shopId: string, queueId: string, entryId: string) => {
    if (confirm("Cancel your turn in this line?")) {
      // In a real implementation, this would call `bookingService.leave()`
      setShops(prevShops => prevShops.map(s => s.id === shopId ? { ...s, serviceLines: s.serviceLines.map(q => q.id === queueId ? { ...q, entries: q.entries.map(e => e.id === entryId ? { ...e, status: QueueStatus.CANCELLED } : e) } : q) } : s));
    }
  };

  const openDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const availableSlots = useMemo(() => {
    if (!selectedQueueForSlot) return [];
    
    // Simulate API call to get schedule for specific queue
    const schedule = getMockServiceSchedule(selectedQueueForSlot.shop, selectedQueueForSlot.queue.id);
    const now = new Date();

    return schedule.slots.map(slot => {
        const startDate = new Date(slot.startTime);
        return {
            time: startDate.getTime(),
            isFull: !slot.isAvailable,
            isPast: startDate < now,
            label: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    });
  }, [selectedQueueForSlot]);

  if (viewMode === 'insights') {
    if (!personalInsights) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Impact Dashboard</h2>
          <div className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 animate-pulse">
            <Sparkles className="w-3 h-3" /> Rocket Elite
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-2xl"><Zap className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-black text-slate-900">{personalInsights.totalTokens}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Digital Tokens</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl"><Clock3 className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-black text-slate-900">{Math.round(personalInsights.totalSaved / 60)}h <span className="text-xs text-slate-300">{(personalInsights.totalSaved % 60)}m</span></p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Life Time Saved</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-lg font-black text-slate-900 leading-none">Time Saved Trend</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Reclaimed Minutes</p>
            </div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Efficient
            </div>
          </div>
          
          <div className="relative h-44 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="impactGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M ${personalInsights.timeSavedHistory.map((val, i) => `${(i * 400) / (personalInsights.timeSavedHistory.length - 1)},${100 - (val / Math.max(...personalInsights.timeSavedHistory) * 85)}`).join(' L ')}`} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d={`M 0,100 L ${personalInsights.timeSavedHistory.map((val, i) => `${(i * 400) / (personalInsights.timeSavedHistory.length - 1)},${100 - (val / Math.max(...personalInsights.timeSavedHistory) * 85)}`).join(' L ')} L 400,100 Z`} 
                fill="url(#impactGrad)" 
              />
            </svg>
            <div className="flex justify-between mt-10 px-2">
              {personalInsights.labels.map(label => (
                <span key={label} className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-black text-slate-900">Queue Activity</h4>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
               <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-32 gap-3">
            {personalInsights.tokensHistory.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                <div 
                  className="w-full bg-indigo-50 border border-indigo-100 rounded-t-2xl transition-all group-hover:bg-indigo-600 group-hover:shadow-xl group-hover:shadow-indigo-100 cursor-pointer" 
                  style={{ height: `${(val / Math.max(...personalInsights.tokensHistory)) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-xl">
                    {val} Tokens
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase">{personalInsights.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center justify-between overflow-hidden relative">
           <div className="relative z-10 space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80">Reliability Score</p>
              <h5 className="text-4xl font-black text-white">{personalInsights.reliability}%</h5>
              <p className="text-xs text-indigo-400 font-bold">Based on 48 check-ins</p>
           </div>
           <Award className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 rotate-12" />
           <div className="relative z-10 text-right">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80">Current Streak</p>
              <h5 className="text-4xl font-black text-indigo-500">{personalInsights.streak} <span className="text-xs text-slate-500 uppercase">Days</span></h5>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {myQueues.length > 0 && !forceDiscovery && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-indigo-500" /> Active Turns
          </h2>
          {myQueues.map(mq => (
            <div key={mq.entry.id} className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10"><BellRing className="w-24 h-24" /></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black tracking-tight leading-none">{mq.shopName}</h3>
                      {mq.shop.isVerified && <BadgeCheck className="w-6 h-6 text-white fill-indigo-400" />}
                    </div>
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mt-2">{mq.queueName}</p>
                  </div>
                  <button onClick={() => leaveQueue(mq.shopId, mq.queueId, mq.entry.id)} className="p-3 bg-white/10 hover:bg-red-500/80 rounded-2xl transition-all border border-white/10">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5 text-center">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">
                      {mq.entry.bookedSlotStart ? 'Time' : 'Position'}
                    </p>
                    <p className="text-3xl font-black truncate">
                      {mq.entry.bookedSlotStart 
                        ? new Date(mq.entry.bookedSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : `#${shops.find(s => s.id === mq.shopId)?.serviceLines.find(q => q.id === mq.queueId)?.entries.filter(e => !isTerminalStatus(e.status)).findIndex(e => e.id === mq.entry.id)! + 1}`}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5 text-center">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">
                      {mq.entry.bookedSlotStart ? 'Ready' : 'Est. Wait'}
                    </p>
                    <p className="text-3xl font-black">
                      {mq.entry.bookedSlotStart ? 'Booked' : `${mq.entry.estimatedMinutes}m`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => openDirections(mq.shop.address)} className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"><Navigation className="w-4 h-4" /> Open Maps</button>
                  <a href={`tel:${mq.shop.phone}`} className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all"><Phone className="w-4 h-4" /> Call Shop</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(forceDiscovery || myQueues.length === 0) && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Find Services</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  className="w-full pl-14 pr-14 py-5 bg-white border border-slate-200 rounded-[2rem] text-black font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all" 
                  placeholder="Clinics, Bakeries, Salons..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && setSearchQuery(e.currentTarget.value)} 
                />
                <button 
                  onClick={handleLocateMe}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isLocating ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
                  title="Find nearest services"
                >
                  <LocateFixed className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => setShowScanner(true)} className="p-5 bg-white border border-slate-200 rounded-[2rem] text-slate-600 hover:text-indigo-600 transition-all shadow-sm active:scale-90"><QrCode className="w-7 h-7" /></button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Searching nearby...</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-[2.5rem]">
                <p className="text-slate-400 font-medium">No services found matching your criteria.</p>
              </div>
            ) : (
              filteredShops.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg">
                  <div 
                    onClick={() => setSelectedShop(s)} 
                    className="flex justify-between items-center cursor-pointer mb-4 group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                         <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                           <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{s.name}</h4>
                           {s.isVerified && <BadgeCheck className="w-5 h-5 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1 opacity-70">{s.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                  
                  <div className="flex gap-3 border-t border-slate-50 pt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openDirections(s.address); }}
                      className="flex-1 py-3 bg-slate-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors active:scale-95"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </button>
                    <a 
                      href={`tel:${s.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors active:scale-95"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl relative">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedShop.name}</h3>{selectedShop.isVerified && <BadgeCheck className="w-8 h-8 text-indigo-600" />}</div>
                <p className="text-sm text-slate-500 font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedShop.address}</p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-5">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Available Lines</h4>
              {selectedShop.serviceLines.map(q => (
                <div key={q.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group">
                  <div className="space-y-1">
                    <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">{q.name}</p>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Users className="w-3.5 h-3.5 text-indigo-400" /> {q.entries.filter(e => !isTerminalStatus(e.status)).length} Waiting</span>
                  </div>
                  <button onClick={() => q.slotConfig?.isEnabled ? setSelectedQueueForSlot({shop: selectedShop, queue: q}) : joinQueue(selectedShop, q)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                    {q.slotConfig?.isEnabled ? 'Book Slot' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedQueueForSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Choose Slot</h3>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-2">{selectedQueueForSlot.queue.name}</p>
              </div>
              <button onClick={() => setSelectedQueueForSlot(null)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
              {availableSlots.map(slot => (
                <button key={slot.time} disabled={slot.isFull || slot.isPast} onClick={() => joinQueue(selectedQueueForSlot.shop, selectedQueueForSlot.queue, slot.time)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${slot.isFull || slot.isPast ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-50' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg active:scale-95'}`}>{slot.label}</button>
              ))}
            </div>
            <p className="mt-8 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">* Slots are based on current availability.</p>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 flex flex-col items-center shadow-2xl relative animate-in zoom-in duration-300">
            <div className="w-full flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Scanner</h3>
               <button onClick={() => setShowScanner(false)} className="p-4 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div id="qr-reader" className="w-full h-auto overflow-hidden rounded-[2.5rem] border-8 border-indigo-50 shadow-2xl bg-indigo-50/20"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
