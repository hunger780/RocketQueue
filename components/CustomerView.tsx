
import React, { useState, useEffect, useRef } from 'react';
import { User, Shop, Queue, QueueEntry, QueueStatus } from '../types';
import { Search, QrCode, MapPin, Clock, Users, ChevronRight, X, BellRing, Info, Navigation, Trash2, Phone, Map as MapIcon, BadgeCheck } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CustomerViewProps {
  user: User;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  forceDiscovery?: boolean;
}

const CustomerView: React.FC<CustomerViewProps> = ({ user, shops, setShops, forceDiscovery = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredShops, setFilteredShops] = useState<Shop[]>(shops);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [myQueues, setMyQueues] = useState<({ shopName: string, queueName: string, entry: QueueEntry, shopId: string, queueId: string, shop: Shop })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const isTerminalStatus = (status: QueueStatus) => {
    return status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED || status === QueueStatus.NO_SHOW;
  };

  useEffect(() => {
    const active = [];
    for (const shop of shops) {
      for (const q of shop.queues) {
        const myEntry = q.entries.find(e => e.userId === user.id && !isTerminalStatus(e.status));
        if (myEntry) {
          active.push({ shopName: shop.name, queueName: q.name, entry: myEntry, shopId: shop.id, queueId: q.id, shop: shop });
        }
      }
    }
    setMyQueues(active);
  }, [shops, user.id]);

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
          console.error("Invalid QR code format", e);
        }
      };
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(onScanSuccess, (err) => {});
      scannerRef.current = scanner;
      return () => { if (scannerRef.current) scannerRef.current.clear().catch(e => console.error(e)); };
    }
  }, [showScanner, shops]);

  const handleSearch = () => {
    if (!searchQuery) { 
      setFilteredShops(shops); 
      return; 
    }
    const query = searchQuery.toLowerCase();
    const result = shops.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.category.toLowerCase().includes(query) ||
      s.address.toLowerCase().includes(query)
    );
    setFilteredShops(result);
  };

  const handleNearbySearch = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilteredShops(shops.slice(0, 3));
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          alert("Could not access your location. Please check your permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const joinQueue = (shop: Shop, queue: Queue) => {
    const queueLength = queue.entries.filter(e => e.status === QueueStatus.WAITING).length;
    // Simple estimation logic: 15 minutes per person in line
    const estMinutes = (queueLength + 1) * 15;
    
    const newEntry: QueueEntry = { 
      id: 'entry-' + Math.random().toString(36).substr(2, 9), 
      userId: user.id, 
      userName: user.name, 
      joinedAt: Date.now(), 
      status: QueueStatus.WAITING, 
      estimatedMinutes: estMinutes 
    };
    
    setShops(prevShops => prevShops.map(s => s.id === shop.id ? { 
      ...s, 
      queues: s.queues.map(q => q.id === queue.id ? { 
        ...q, 
        entries: [...q.entries, newEntry] 
      } : q) 
    } : s));
    setSelectedShop(null);
  };

  const leaveQueue = (shopId: string, queueId: string, entryId: string) => {
    if (confirm("Are you sure you want to leave this queue?")) {
      setShops(prevShops => prevShops.map(s => s.id === shopId ? { ...s, queues: s.queues.map(q => q.id === queueId ? { ...q, entries: q.entries.map(e => e.id === entryId ? { ...e, status: QueueStatus.CANCELLED } : e) } : q) } : s));
    }
  };

  const getFirstLineAddress = (address: string) => {
    return address.split(',')[0].trim();
  };

  const openDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {myQueues.length > 0 && !forceDiscovery && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-indigo-500" /> Your Active Queues
          </h2>
          {myQueues.map(mq => (
            <div key={mq.entry.id} className="bg-indigo-600 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10"><BellRing className="w-24 h-24" /></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black tracking-tight">{mq.shopName}</h3>
                      {mq.shop.isVerified && <BadgeCheck className="w-6 h-6 text-white fill-indigo-400" />}
                    </div>
                    <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest">{mq.queueName}</p>
                  </div>
                  <button 
                    onClick={() => leaveQueue(mq.shopId, mq.queueId, mq.entry.id)} 
                    className="p-3 bg-white/10 hover:bg-red-500/80 rounded-2xl transition-all border border-white/10"
                    title="Cancel Turn"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">Position</p>
                    <p className="text-4xl font-black">
                      #{shops.find(s => s.id === mq.shopId)?.queues.find(q => q.id === mq.queueId)?.entries.filter(e => !isTerminalStatus(e.status)).findIndex(e => e.id === mq.entry.id)! + 1}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">Est. Wait</p>
                    <p className="text-4xl font-black">{mq.entry.estimatedMinutes}<span className="text-sm ml-1 opacity-60">m</span></p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => openDirections(mq.shop.address)}
                    className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Navigation className="w-4 h-4" /> Directions
                  </button>
                  <a 
                    href={`tel:${mq.shop.phone}`}
                    className="flex-1 bg-indigo-500 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" /> Call Vendor
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(forceDiscovery || myQueues.length === 0) && (
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Discover Services</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  className="w-full pl-11 pr-4 py-5 bg-white border border-gray-200 rounded-[1.5rem] text-black font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all" 
                  placeholder="What are you looking for?" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                />
              </div>
              <button 
                onClick={handleNearbySearch} 
                className={`p-5 bg-white border border-gray-200 rounded-[1.5rem] text-gray-500 hover:text-indigo-600 transition-all shadow-sm ${isLocating ? 'animate-pulse' : ''}`}
                title="Search Nearby"
              >
                <Navigation className={`w-6 h-6 ${isLocating ? 'text-indigo-600' : ''}`} />
              </button>
              <button 
                onClick={() => setShowScanner(true)} 
                className="p-5 bg-white border border-gray-200 rounded-[1.5rem] text-gray-500 hover:text-indigo-600 transition-all shadow-sm"
                title="Scan QR"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredShops.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No shops matched</p>
              </div>
            ) : (
              filteredShops.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedShop(s)} 
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex justify-between items-center group"
                >
                  <div className="flex gap-5 items-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{s.name}</h4>
                        {s.isVerified && <BadgeCheck className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em] mt-1">{s.category}</p>
                      <p className="text-xs text-slate-400 mt-2 font-semibold italic flex items-center gap-1">
                         {getFirstLineAddress(s.address)}
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{selectedShop.name}</h3>
                  {selectedShop.isVerified && <BadgeCheck className="w-8 h-8 text-indigo-600" />}
                </div>
                {selectedShop.isVerified && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 w-fit">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified Business
                  </div>
                )}
                <p className="text-sm text-slate-500 font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedShop.address}</p>
                {selectedShop.landmark && <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 inline-block px-2 py-1 rounded">Near {selectedShop.landmark}</p>}
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex gap-4 mb-10">
              <button 
                onClick={() => openDirections(selectedShop.address)}
                className="flex-1 bg-indigo-600 text-white p-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Navigation className="w-5 h-5" /> Directions
              </button>
              <a 
                href={`tel:${selectedShop.phone}`}
                className="flex-1 bg-emerald-50 text-emerald-600 p-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5" /> Call Shop
              </a>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Join a Service Line</h4>
                <div className="h-px bg-slate-100 flex-1 ml-4"></div>
              </div>
              {selectedShop.queues.map(q => (
                <div key={q.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all shadow-sm">
                  <div className="space-y-1">
                    <p className="font-black text-slate-800 text-xl tracking-tight">{q.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Users className="w-3.5 h-3.5 text-indigo-400" /> {q.entries.filter(e => !isTerminalStatus(e.status)).length} In Queue
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => joinQueue(selectedShop, q)} 
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-50 hover:bg-indigo-700 active:scale-[0.95] transition-all"
                  >
                    Take Token
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 flex flex-col items-center shadow-2xl relative">
            <div className="w-full flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Smart Scanner</h3>
              <button onClick={() => setShowScanner(false)} className="p-4 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            <div id="qr-reader" className="w-full h-auto overflow-hidden rounded-[2.5rem] border-8 border-slate-50 shadow-2xl bg-slate-100"></div>
            <p className="mt-10 text-sm text-slate-400 font-bold text-center leading-relaxed max-w-[240px]">Point your lens at the shop's QR code to skip the lobby and join digitally.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
