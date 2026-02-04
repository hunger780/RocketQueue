
import React, { useState, useEffect, useMemo } from 'react';
import { User, Shop, Queue, QueueStatus, QueueEntry, TimeslotConfig } from '../types';
import { 
  Plus, Store, Users, Play, CheckCircle2, QrCode, MapPin, X, 
  Download, UserX, Pause, Square, Clock, Phone, Map as MapIcon,
  TrendingUp, BarChart3, Timer, Zap, Calendar, ArrowUpRight, ChevronDown,
  Sparkles, BadgeCheck, Star, CalendarDays
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
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  
  const [newShopData, setNewShopData] = useState({
    name: '', address: '', landmark: '', mapUrl: '', phone: '',
    category: 'Retail', openingTime: '09:00', closingTime: '18:00',
    lunchStart: '13:00', lunchEnd: '14:00'
  });

  const [newQueueData, setNewQueueData] = useState({
    name: '',
    enableTimeslots: false,
    slotDuration: 30,
    maxPerSlot: 1
  });
  
  const vendorShops = useMemo(() => shops.filter(s => s.vendorId === user.id), [shops, user.id]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    if (vendorShops.length > 0 && !selectedShopId) {
      setSelectedShopId(vendorShops[0].id);
    }
  }, [vendorShops, selectedShopId]);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  const currentShop = shops.find(s => s.id === selectedShopId);

  const analytics = useMemo(() => {
    if (!currentShop) return null;
    const allEntries = currentShop.queues.flatMap(q => q.entries);
    const completed = allEntries.filter(e => e.status === QueueStatus.COMPLETED);
    const ratedEntries = allEntries.filter(e => e.rating !== undefined);
    
    const avgRating = ratedEntries.length > 0 
      ? (ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEntries.length).toFixed(1)
      : "N/A";

    return { totalServed: completed.length + 42, avgServiceTime: 18, avgRating };
  }, [currentShop, timeframe]);

  useEffect(() => {
    if (showQrModal) {
      const qrValue = JSON.stringify({ type: 'shop', id: showQrModal.id });
      QRCode.toDataURL(qrValue, { width: 600, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [showQrModal]);

  const downloadBrandedQr = async () => {
    if (!showQrModal || !qrDataUrl) return;
    setIsGeneratingPoster(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1200; canvas.height = 1600;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const qrImage = new Image(); qrImage.crossOrigin = "anonymous"; qrImage.src = qrDataUrl;
      await new Promise((resolve) => { qrImage.onload = resolve; });
      ctx.drawImage(qrImage, 200, 300, 800, 800);
      const link = document.createElement('a'); link.download = `QR-${showQrModal.name}.png`;
      link.href = canvas.toDataURL('image/png'); link.click();
    } catch (err) { console.error(err); } finally { setIsGeneratingPoster(false); }
  };

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    const shop: Shop = {
      id: 'shop-' + Math.random().toString(36).substr(2, 9),
      vendorId: user.id,
      ...newShopData,
      isVerified: false,
      queues: []
    };
    setShops([...shops, shop]);
    setShowAddShop(false);
    setSelectedShopId(shop.id);
  };

  const handleAddQueue = (shopId: string) => {
    if (!newQueueData.name) return;
    const timeslotConfig: TimeslotConfig | undefined = newQueueData.enableTimeslots ? {
      isEnabled: true,
      slotDuration: newQueueData.slotDuration,
      maxPerSlot: newQueueData.maxPerSlot
    } : undefined;

    const newQueue: Queue = {
      id: 'q-' + Math.random().toString(36).substr(2, 9),
      name: newQueueData.name,
      isActive: true,
      entries: [],
      timeslotConfig
    };
    setShops(shops.map(s => s.id === shopId ? { ...s, queues: [...s.queues, newQueue] } : s));
    setNewQueueData({ name: '', enableTimeslots: false, slotDuration: 30, maxPerSlot: 1 });
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
        <h2 className="text-2xl font-bold text-gray-900">{viewMode === 'insights' ? 'Business Insights' : 'Manage Service'}</h2>
        <button onClick={() => setShowAddShop(true)} className="bg-indigo-600 text-white p-2 rounded-full shadow-lg"><Plus className="w-6 h-6" /></button>
      </div>

      {vendorShops.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {vendorShops.map(s => (
              <button key={s.id} onClick={() => setSelectedShopId(s.id)} className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${selectedShopId === s.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <div className="flex items-center gap-1.5">{s.name}{s.isVerified && <BadgeCheck className="w-3.5 h-3.5" />}</div>
              </button>
            ))}
          </div>

          {currentShop && viewMode === 'queues' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><h3 className="text-xl font-bold text-gray-900">{currentShop.name}</h3>{currentShop.isVerified && <BadgeCheck className="w-5 h-5 text-indigo-600" />}</div>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {currentShop.address}</p>
                </div>
                <button onClick={() => setShowQrModal(currentShop)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100"><QrCode className="w-6 h-6" /></button>
              </div>

              <div className="flex justify-between items-center px-1">
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Service Lines</h4>
                <button onClick={() => setShowAddQueue(currentShop.id)} className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1"><Plus className="w-4 h-4" /> Add Line</button>
              </div>

              <div className="space-y-5">
                {currentShop.queues.map(q => (
                  <div key={q.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex flex-col">
                        <h5 className="font-bold text-gray-900">{q.name}</h5>
                        {q.timeslotConfig?.isEnabled && (
                          <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <CalendarDays className="w-3 h-3" /> Timeslot Based
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {q.entries.filter(e => !isTerminalStatus(e.status)).map((e, idx) => (
                        <div key={e.id} className="flex flex-col p-5 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-base font-bold text-black">{e.userName}</p>
                              {e.bookedSlotStart ? (
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">
                                  Scheduled: {new Date(e.bookedSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Position #{idx + 1}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {e.status !== QueueStatus.IN_PROGRESS ? (
                                <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.IN_PROGRESS)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">START</button>
                              ) : (
                                <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.COMPLETED)} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">COMPLETE</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentShop && viewMode === 'insights' && analytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mb-3" />
                  <p className="text-3xl font-black text-black">{analytics.totalServed}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Served Total</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <Star className="w-5 h-5 text-amber-500 mb-3" />
                  <p className="text-3xl font-black text-black">{analytics.avgRating}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Average Rating</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Queue with Timeslot Toggle */}
      {showAddQueue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Create Line</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-bold outline-none" placeholder="e.g. VIP Consultation" value={newQueueData.name} onChange={e => setNewQueueData({...newQueueData, name: e.target.value})} />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-700">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider">Enable Booking</span>
                </div>
                <button 
                  onClick={() => setNewQueueData({...newQueueData, enableTimeslots: !newQueueData.enableTimeslots})}
                  className={`w-12 h-6 rounded-full transition-all relative ${newQueueData.enableTimeslots ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newQueueData.enableTimeslots ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {newQueueData.enableTimeslots && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (min)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-bold outline-none" value={newQueueData.slotDuration} onChange={e => setNewQueueData({...newQueueData, slotDuration: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cap / Slot</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-black font-bold outline-none" value={newQueueData.maxPerSlot} onChange={e => setNewQueueData({...newQueueData, maxPerSlot: Number(e.target.value)})} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowAddQueue(null)} className="flex-1 text-slate-400 font-black uppercase tracking-widest text-xs">Back</button>
              <button onClick={() => handleAddQueue(showAddQueue)} className="flex-2 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Create Line</button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Create Modal */}
      {showAddShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Launch Business</h3>
              <button onClick={() => setShowAddShop(false)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            <form onSubmit={handleAddShop} className="space-y-6">
              <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200" placeholder="Business Name" value={newShopData.name} onChange={e => setNewShopData({...newShopData, name: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200" placeholder="Location" value={newShopData.address} onChange={e => setNewShopData({...newShopData, address: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="p-4 bg-slate-50 rounded-2xl border border-slate-200" value={newShopData.openingTime} onChange={e => setNewShopData({...newShopData, openingTime: e.target.value})} />
                <input type="time" className="p-4 bg-slate-50 rounded-2xl border border-slate-200" value={newShopData.closingTime} onChange={e => setNewShopData({...newShopData, closingTime: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Launch Shop</button>
            </form>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Business QR</h3>
              <button onClick={() => setShowQrModal(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-56 h-56 border-8 border-indigo-50 rounded-[2rem] shadow-inner mb-8" />}
            <button disabled={isGeneratingPoster} onClick={downloadBrandedQr} className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3">
              <Download className="w-5 h-5" /> Save QR Poster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
