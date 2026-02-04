
import React, { useState, useEffect, useRef } from 'react';
import { User, Shop, Queue, QueueEntry, QueueStatus } from '../types';
import { Search, QrCode, MapPin, Clock, Users, ChevronRight, X, BellRing, Info, Navigation, Trash2, Phone, Map as MapIcon, BadgeCheck, Star, Send, CalendarCheck } from 'lucide-react';
import { estimateWaitTime, searchShops } from '../services/geminiService';
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
  const [bookingQueue, setBookingQueue] = useState<{ shop: Shop, queue: Queue } | null>(null);
  const [myQueues, setMyQueues] = useState<({ shopName: string, queueName: string, entry: QueueEntry, shopId: string, queueId: string, shop: Shop })[]>([]);
  const [completedVisits, setCompletedVisits] = useState<({ shopName: string, queueName: string, entry: QueueEntry, shopId: string, queueId: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [ratingInput, setRatingInput] = useState<{ [entryId: string]: { score: number, feedback: string } }>({});
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const isTerminalStatus = (status: QueueStatus) => {
    return status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED || status === QueueStatus.NO_SHOW;
  };

  useEffect(() => {
    const active = [];
    const completed = [];
    for (const shop of shops) {
      for (const q of shop.queues) {
        const userEntries = q.entries.filter(e => e.userId === user.id);
        const myActiveEntry = userEntries.find(e => !isTerminalStatus(e.status));
        if (myActiveEntry) {
          active.push({ shopName: shop.name, queueName: q.name, entry: myActiveEntry, shopId: shop.id, queueId: q.id, shop: shop });
        }
        const myCompletedEntries = userEntries.filter(e => e.status === QueueStatus.COMPLETED && e.rating === undefined);
        for (const entry of myCompletedEntries) {
          completed.push({ shopName: shop.name, queueName: q.name, entry, shopId: shop.id, queueId: q.id });
        }
      }
    }
    setMyQueues(active);
    setCompletedVisits(completed);
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

  const handleSearch = async () => {
    if (!searchQuery) { setFilteredShops(shops); return; }
    setIsSearching(true);
    const rankedIds = await searchShops(searchQuery, shops);
    const result = shops.filter(s => rankedIds.includes(s.id));
    setFilteredShops(result);
    setIsSearching(false);
  };

  const generateAvailableSlots = (shop: Shop, queue: Queue) => {
    if (!queue.timeslotConfig?.isEnabled) return [];
    
    const slots = [];
    const [startH, startM] = (shop.openingTime || "09:00").split(':').map(Number);
    const [endH, endM] = (shop.closingTime || "18:00").split(':').map(Number);
    const duration = queue.timeslotConfig.slotDuration;
    
    const startTime = new Date().setHours(startH, startM, 0, 0);
    const endTime = new Date().setHours(endH, endM, 0, 0);
    const now = Date.now();

    let current = startTime;
    while (current < endTime) {
      const isFull = queue.entries.filter(e => !isTerminalStatus(e.status) && e.bookedSlotStart === current).length >= queue.timeslotConfig.maxPerSlot;
      const isPast = current < now;
      
      // Handle Lunch Break
      const [lStartH, lStartM] = (shop.lunchStart || "13:00").split(':').map(Number);
      const [lEndH, lEndM] = (shop.lunchEnd || "14:00").split(':').map(Number);
      const lStart = new Date().setHours(lStartH, lStartM, 0, 0);
      const lEnd = new Date().setHours(lEndH, lEndM, 0, 0);
      const isLunch = current >= lStart && current < lEnd;

      if (!isLunch) {
        slots.push({
          time: current,
          label: new Date(current).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          available: !isFull && !isPast
        });
      }
      current += duration * 60000;
    }
    return slots;
  };

  const handleJoinClick = (shop: Shop, queue: Queue) => {
    if (queue.timeslotConfig?.isEnabled) {
      setBookingQueue({ shop, queue });
    } else {
      joinQueue(shop, queue);
    }
  };

  const joinQueue = async (shop: Shop, queue: Queue, slotTime?: number) => {
    const queueLength = queue.entries.filter(e => e.status === QueueStatus.WAITING).length;
    const estMinutes = await estimateWaitTime(queueLength, shop.category);
    const newEntry: QueueEntry = { 
      id: 'entry-' + Math.random().toString(36).substr(2, 9), 
      userId: user.id, 
      userName: user.name, 
      joinedAt: Date.now(), 
      status: QueueStatus.WAITING, 
      estimatedMinutes: slotTime ? 0 : estMinutes,
      bookedSlotStart: slotTime
    };
    setShops(prevShops => prevShops.map(s => s.id === shop.id ? { ...s, queues: s.queues.map(q => q.id === queue.id ? { ...q, entries: [...q.entries, newEntry] } : q) } : s));
    setSelectedShop(null);
    setBookingQueue(null);
  };

  const leaveQueue = (shopId: string, queueId: string, entryId: string) => {
    if (confirm("Are you sure you want to leave this queue?")) {
      setShops(prevShops => prevShops.map(s => s.id === shopId ? { ...s, queues: s.queues.map(q => q.id === queueId ? { ...q, entries: q.entries.map(e => e.id === entryId ? { ...e, status: QueueStatus.CANCELLED } : e) } : q) } : s));
    }
  };

  const submitRating = (shopId: string, queueId: string, entryId: string) => {
    const rating = ratingInput[entryId];
    if (!rating || rating.score === 0) { alert("Please select a star rating first."); return; }
    setShops(prevShops => prevShops.map(s => s.id === shopId ? { ...s, queues: s.queues.map(q => q.id === queueId ? { ...q, entries: q.entries.map(e => e.id === entryId ? { ...e, rating: rating.score, feedback: rating.feedback } : e) } : q) } : s));
  };

  const getFirstLineAddress = (address: string) => address.split(',')[0].trim();
  const openDirections = (address: string) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');

  return (
    <div className="space-y-6">
      {/* Active Queues */}
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
                  <button onClick={() => leaveQueue(mq.shopId, mq.queueId, mq.entry.id)} className="p-3 bg-white/10 hover:bg-red-500/80 rounded-2xl transition-all border border-white/10"><Trash2 className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">Status</p>
                    <p className="text-xl font-black uppercase tracking-tighter">
                      {mq.entry.bookedSlotStart ? 'Scheduled' : 'In Line'}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1 opacity-60">
                      {mq.entry.bookedSlotStart ? 'Time' : 'Est. Wait'}
                    </p>
                    <p className="text-2xl font-black">
                      {mq.entry.bookedSlotStart 
                        ? new Date(mq.entry.bookedSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : `${mq.entry.estimatedMinutes}m`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => openDirections(mq.shop.address)} className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Navigation className="w-4 h-4" /> Directions</button>
                  <a href={`tel:${mq.shop.phone}`} className="flex-1 bg-indigo-500 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all"><Phone className="w-4 h-4" /> Call</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ratings Section */}
      {completedVisits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Rate Your Visit</h2>
          {completedVisits.map(visit => (
            <div key={visit.entry.id} className="bg-white border-2 border-amber-100 rounded-[2.5rem] p-8 shadow-xl shadow-amber-50/50">
              <div className="flex justify-between items-start mb-6">
                <div><h3 className="text-xl font-black text-slate-900 tracking-tight">{visit.shopName}</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{visit.queueName}</p></div>
                <div className="bg-amber-50 p-3 rounded-2xl"><Star className="w-6 h-6 text-amber-500" /></div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRatingInput(p => ({ ...p, [visit.entry.id]: { ...p[visit.entry.id], score: star } }))} className={`p-1.5 transition-all transform ${(ratingInput[visit.entry.id]?.score || 0) >= star ? 'scale-110 text-amber-500' : 'text-slate-200 grayscale opacity-40'}`}>
                      <Star className={`w-10 h-10 ${ (ratingInput[visit.entry.id]?.score || 0) >= star ? 'fill-amber-500' : ''}`} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Tell us how it went..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none min-h-[80px]" value={ratingInput[visit.entry.id]?.feedback || ''} onChange={(e) => setRatingInput(p => ({ ...p, [visit.entry.id]: { ...p[visit.entry.id], feedback: e.target.value } }))} />
                <button onClick={() => submitRating(visit.shopId, visit.queueId, visit.entry.id)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Submit Feedback</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discovery Section */}
      <div className="space-y-5">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Discover Services</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-11 pr-4 py-5 bg-white border border-gray-200 rounded-[1.5rem] text-black font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all" placeholder="Find shops..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <button onClick={() => setShowScanner(true)} className="p-5 bg-white border border-gray-200 rounded-[1.5rem] text-gray-500 hover:text-indigo-600 transition-all shadow-sm"><QrCode className="w-6 h-6" /></button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredShops.map(s => (
            <button key={s.id} onClick={() => setSelectedShop(s)} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex justify-between items-center group">
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><MapPin className="w-7 h-7" /></div>
                <div>
                  <div className="flex items-center gap-1.5"><h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{s.name}</h4>{s.isVerified && <BadgeCheck className="w-5 h-5 text-indigo-600" />}</div>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em] mt-1">{s.category}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{selectedShop.name}</h3>{selectedShop.isVerified && <BadgeCheck className="w-8 h-8 text-indigo-600" />}</div>
                <p className="text-sm text-slate-500 font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedShop.address}</p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Available Services</h4>
              {selectedShop.queues.map(q => (
                <div key={q.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div>
                    <p className="font-black text-slate-800 text-xl tracking-tight">{q.name}</p>
                    {q.timeslotConfig?.isEnabled ? (
                      <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Booking Enabled
                      </span>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{q.entries.filter(e => !isTerminalStatus(e.status)).length} In Queue</p>
                    )}
                  </div>
                  <button onClick={() => handleJoinClick(selectedShop, q)} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-50 active:scale-95 transition-all">
                    {q.timeslotConfig?.isEnabled ? 'Book Slot' : 'Join Queue'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeslot Picker Modal */}
      {bookingQueue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pick a Timeslot</h3>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{bookingQueue.queue.name}</p>
              </div>
              <button onClick={() => setBookingQueue(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
              {generateAvailableSlots(bookingQueue.shop, bookingQueue.queue).map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => joinQueue(bookingQueue.shop, bookingQueue.queue, slot.time)}
                  className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                    slot.available 
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg' 
                      : 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            
            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase text-center tracking-[0.2em] leading-relaxed">
              * Showing available slots for today based on business hours and current capacity.
            </p>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 flex flex-col items-center relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-6 right-6 p-4 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-700" />
            </button>
            <div id="qr-reader" className="w-full rounded-[2.5rem] border-8 border-slate-50 shadow-2xl mt-10"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
