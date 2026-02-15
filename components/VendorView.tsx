
import React, { useState, useEffect, useMemo } from 'react';
import { User, Shop, Queue, QueueStatus, TimeRange } from '../types';
import { 
  Plus, Store, Users, Play, CheckCircle2, QrCode, MapPin, X, 
  Download, Clock, Settings, Trash2, Coffee, Edit3, CalendarCheck
} from 'lucide-react';
import QRCode from 'qrcode';

interface VendorViewProps {
  user: User;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
}

const VendorView: React.FC<VendorViewProps> = ({ user, shops, setShops }) => {
  const [showAddShop, setShowAddShop] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showAddQueue, setShowAddQueue] = useState<string | null>(null);
  const [editingQueue, setEditingQueue] = useState<{ shopId: string, queue: Queue } | null>(null);
  const [showQrModal, setShowQrModal] = useState<Shop | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  
  const [shopFormData, setShopFormData] = useState({
    name: '', address: '', category: '', phone: '',
    openingTime: '09:00', closingTime: '21:00'
  });
  
  const [queueFormData, setQueueFormData] = useState({
    name: '',
    isSlotBooking: false,
    slotDuration: 30,
    slotCapacity: 1,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [] as TimeRange[]
  });
  
  const vendorShops = useMemo(() => shops.filter(s => s.vendorId === user.id), [shops, user.id]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    if (vendorShops.length > 0 && !selectedShopId) {
      setSelectedShopId(vendorShops[0].id);
    }
  }, [vendorShops, selectedShopId]);

  const currentShop = shops.find(s => s.id === selectedShopId);

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

      canvas.width = 1200;
      canvas.height = 1800;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createLinearGradient(0, 0, 0, 450);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 450);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 80px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROCKET QUEUE', canvas.width / 2, 220);
      
      ctx.font = '600 36px Inter, sans-serif';
      ctx.fillText('SCAN TO JOIN THE DIGITAL LINE', canvas.width / 2, 290);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#111827';
      ctx.font = '900 85px Inter, sans-serif';
      ctx.fillText(showQrModal.name.toUpperCase(), canvas.width / 2, 1420);

      ctx.fillStyle = '#4b5563';
      ctx.font = '600 45px Inter, sans-serif';
      const addressLines = showQrModal.address.match(/.{1,40}(\s|$)/g) || [showQrModal.address];
      addressLines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, 1510 + (i * 65));
      });

      const qrSize = 850;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 480;

      ctx.shadowColor = 'rgba(79, 70, 229, 0.15)';
      ctx.shadowBlur = 100;
      ctx.fillStyle = '#ffffff';
      const cornerRadius = 80;
      ctx.beginPath();
      ctx.roundRect(qrX - 40, qrY - 40, qrSize + 80, qrSize + 80, cornerRadius);
      ctx.fill();
      ctx.shadowBlur = 0;

      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";
      qrImage.src = qrDataUrl;
      
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillText('SKIP THE WAIT WITH ROCKET QUEUE APP', canvas.width / 2, canvas.height - 65);

      const link = document.createElement('a');
      link.download = `RocketQueue-Poster-${showQrModal.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Error generating QR poster:", err);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShop) {
      setShops(shops.map(s => s.id === editingShop.id ? { ...s, ...shopFormData } : s));
      setEditingShop(null);
    } else {
      const shop: Shop = {
        id: 'shop-' + Math.random().toString(36).substr(2, 9),
        vendorId: user.id,
        ...shopFormData,
        isVerified: false,
        serviceLines: []
      };
      setShops([...shops, shop]);
      setShowAddShop(false);
      setSelectedShopId(shop.id);
    }
    setShopFormData({ name: '', address: '', category: '', phone: '', openingTime: '09:00', closingTime: '21:00' });
  };

  const startEditingShop = (shop: Shop) => {
    setShopFormData({
      name: shop.name,
      address: shop.address,
      category: shop.category,
      phone: shop.phone,
      openingTime: shop.openingTime || '09:00',
      closingTime: shop.closingTime || '21:00'
    });
    setEditingShop(shop);
  };

  const handleSaveQueue = (shopId: string) => {
    if (!queueFormData.name) return;
    
    const schedule = {
      startTime: queueFormData.startTime,
      endTime: queueFormData.endTime,
      breaks: queueFormData.breaks
    };

    const slotConfig = queueFormData.isSlotBooking ? {
      isEnabled: true,
      duration: queueFormData.slotDuration,
      maxCapacity: queueFormData.slotCapacity
    } : undefined;

    if (editingQueue) {
      setShops(shops.map(s => s.id === shopId ? {
        ...s,
        serviceLines: s.serviceLines.map(q => q.id === editingQueue.queue.id ? {
          ...q,
          name: queueFormData.name,
          slotConfig,
          schedule
        } : q)
      } : s));
      setEditingQueue(null);
    } else {
      const newQueue: Queue = {
        id: 'q-' + Math.random().toString(36).substr(2, 9),
        name: queueFormData.name,
        isActive: true,
        entries: [],
        slotConfig,
        schedule
      };
      setShops(shops.map(s => s.id === shopId ? { ...s, serviceLines: [...s.serviceLines, newQueue] } : s));
      setShowAddQueue(null);
    }
    // Reset form
    setQueueFormData({ 
      name: '', 
      isSlotBooking: false, 
      slotDuration: 30, 
      slotCapacity: 1,
      startTime: '09:00', 
      endTime: '17:00', 
      breaks: [] 
    });
  };

  const startEditingQueue = (shopId: string, queue: Queue) => {
    // Determine default start/end from shop if queue specific not set
    const shop = shops.find(s => s.id === shopId);
    
    setQueueFormData({
      name: queue.name,
      isSlotBooking: queue.slotConfig?.isEnabled || false,
      slotDuration: queue.slotConfig?.duration || 30,
      slotCapacity: queue.slotConfig?.maxCapacity || 1,
      startTime: queue.schedule?.startTime || shop?.openingTime || '09:00',
      endTime: queue.schedule?.endTime || shop?.closingTime || '17:00',
      breaks: queue.schedule?.breaks || []
    });
    setEditingQueue({ shopId, queue });
  };

  const handleAddBreak = () => {
    setQueueFormData({
      ...queueFormData,
      breaks: [...queueFormData.breaks, { name: '', start: '12:00', end: '13:00' }]
    });
  };

  const updateBreak = (index: number, field: keyof TimeRange, value: string) => {
    const newBreaks = [...queueFormData.breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setQueueFormData({ ...queueFormData, breaks: newBreaks });
  };

  const removeBreak = (index: number) => {
    const newBreaks = queueFormData.breaks.filter((_, i) => i !== index);
    setQueueFormData({ ...queueFormData, breaks: newBreaks });
  };

  const updateEntryStatus = (queueId: string, entryId: string, status: QueueStatus) => {
    setShops(shops.map(s => ({
      ...s,
      serviceLines: s.serviceLines.map(q => q.id === queueId ? {
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

  const initQueueForm = (shopId: string) => {
     const shop = shops.find(s => s.id === shopId);
     setQueueFormData({ 
      name: '', 
      isSlotBooking: false, 
      slotDuration: 30, 
      slotCapacity: 1,
      startTime: shop?.openingTime || '09:00',
      endTime: shop?.closingTime || '17:00',
      breaks: []
    });
    setShowAddQueue(shopId);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Operations</h2>
        <button
          onClick={() => {
            setShopFormData({ name: '', address: '', category: '', phone: '', openingTime: '09:00', closingTime: '21:00' });
            setShowAddShop(true);
          }}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {vendorShops.length === 0 ? (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center">
          <Store className="w-12 h-12 text-indigo-400 mb-6" />
          <h3 className="text-xl font-black text-indigo-900 mb-2">Setup Your Business</h3>
          <p className="text-indigo-600/70 font-medium max-w-[260px] leading-relaxed mb-8">
            Start by adding your shop to generate QR codes and manage lines.
          </p>
          <button 
            onClick={() => setShowAddShop(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" /> Add First Shop
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {vendorShops.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedShopId(s.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                  selectedShopId === s.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {currentShop && (
            <div className="space-y-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{currentShop.name}</h3>
                      <button onClick={() => startEditingShop(currentShop)} className="p-1 text-slate-400 hover:text-indigo-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentShop.address}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQrModal(currentShop)}
                  className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors"
                >
                  <QrCode className="w-6 h-6" />
                </button>
              </div>

              <div className="flex justify-between items-center px-2">
                <h4 className="font-bold text-gray-700">Service Lines</h4>
                <button 
                  onClick={() => initQueueForm(currentShop.id)}
                  className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Line
                </button>
              </div>

              <div className="space-y-4">
                {currentShop.serviceLines.map(q => (
                  <div key={q.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                           {q.slotConfig?.isEnabled ? <CalendarCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-gray-900">{q.name}</h5>
                          <button onClick={() => startEditingQueue(currentShop.id, q)} className="p-1 text-slate-400 hover:text-indigo-600">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                        {q.entries.filter(e => !isTerminalStatus(e.status)).length} Live
                      </span>
                    </div>

                    <div className="space-y-3">
                      {q.entries.filter(e => !isTerminalStatus(e.status)).length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-2xl">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No active customers</p>
                        </div>
                      ) : (
                        q.entries
                          .filter(e => !isTerminalStatus(e.status))
                          .sort((a, b) => (a.bookedSlotStart || a.joinedAt) - (b.bookedSlotStart || b.joinedAt))
                          .map((e, idx) => (
                            <div key={e.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="text-indigo-600/20 font-black text-3xl">#{idx + 1}</span>
                                  <div>
                                    <p className="text-base font-bold text-slate-800">{e.userName}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                      {e.bookedSlotStart ? `Scheduled: ${new Date(e.bookedSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `Joined: ${new Date(e.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                  </div>
                                </div>
                                {e.status === QueueStatus.IN_PROGRESS && <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Serving</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {e.status !== QueueStatus.IN_PROGRESS ? (
                                  <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.IN_PROGRESS)} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                                    <Play className="w-4 h-4 fill-white" /> Start Turn
                                  </button>
                                ) : (
                                  <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.COMPLETED)} className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                                    <CheckCircle2 className="w-4 h-4" /> Finish
                                  </button>
                                )}
                                <div className="flex gap-2">
                                  <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.NO_SHOW)} className="flex-1 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors">Absent</button>
                                  <button onClick={() => updateEntryStatus(q.id, e.id, QueueStatus.ON_HOLD)} className="flex-1 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-500 transition-colors">Hold</button>
                                </div>
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
        </>
      )}

      {(showAddShop || editingShop) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{editingShop ? 'Edit Shop' : 'Setup New Shop'}</h3>
            <form onSubmit={handleSaveShop} className="space-y-5">
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium" placeholder="Business Name" value={shopFormData.name} onChange={e => setShopFormData({...shopFormData, name: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium" placeholder="Category (e.g. Clinic, Bakery)" value={shopFormData.category} onChange={e => setShopFormData({...shopFormData, category: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium" placeholder="Full Business Address" value={shopFormData.address} onChange={e => setShopFormData({...shopFormData, address: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium" placeholder="Phone Number" value={shopFormData.phone} onChange={e => setShopFormData({...shopFormData, phone: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-black font-medium" value={shopFormData.openingTime} onChange={e => setShopFormData({...shopFormData, openingTime: e.target.value})} />
                <input required type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-black font-medium" value={shopFormData.closingTime} onChange={e => setShopFormData({...shopFormData, closingTime: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowAddShop(false); setEditingShop(null); }} className="flex-1 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100">
                  {editingShop ? 'Update Details' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 flex flex-col items-center animate-in zoom-in duration-300 relative">
            <button onClick={() => setShowQrModal(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            <div className="text-center mb-8 mt-4">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{showQrModal.name}</h3>
               <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{showQrModal.category}</p>
            </div>
            <div className="bg-white p-6 rounded-[3rem] border-8 border-indigo-50/50 mb-10 shadow-inner flex items-center justify-center">
              {qrDataUrl ? <img src={qrDataUrl} alt="Shop QR" className="w-60 h-60 rounded-xl" /> : <div className="w-60 h-60 animate-pulse bg-slate-100 rounded-xl"></div>}
            </div>
            <div className="w-full bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-8">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Business Address</p>
               <p className="text-xs text-slate-600 font-bold leading-relaxed">{showQrModal.address}</p>
            </div>
            <button 
              disabled={isGeneratingPoster || !qrDataUrl}
              onClick={downloadBrandedQr} 
              className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" /> Save Shop Poster
            </button>
          </div>
        </div>
      )}

      {(showAddQueue || editingQueue) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300 my-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">{editingQueue ? 'Edit Line' : 'New Service Line'}</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Name</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-black" placeholder="e.g. Walk-in Customers" value={queueFormData.name} onChange={e => setQueueFormData({...queueFormData, name: e.target.value})} />
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Slot Booking</span>
                  <span className="text-[9px] font-bold text-slate-400">Scheduled appointments</span>
                </div>
                <button onClick={() => setQueueFormData({...queueFormData, isSlotBooking: !queueFormData.isSlotBooking})} className={`w-12 h-6 rounded-full transition-all relative ${queueFormData.isSlotBooking ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${queueFormData.isSlotBooking ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {queueFormData.isSlotBooking && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mins / Slot</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-black" value={queueFormData.slotDuration} onChange={e => setQueueFormData({...queueFormData, slotDuration: parseInt(e.target.value) || 15})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cap / Slot</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-black" value={queueFormData.slotCapacity} onChange={e => setQueueFormData({...queueFormData, slotCapacity: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-indigo-500" /> Working Hours
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Start Time</label>
                    <input type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={queueFormData.startTime} onChange={e => setQueueFormData({...queueFormData, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">End Time</label>
                    <input type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={queueFormData.endTime} onChange={e => setQueueFormData({...queueFormData, endTime: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Coffee className="w-3 h-3 text-amber-500" /> Breaks
                  </h4>
                  <button onClick={handleAddBreak} className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold uppercase transition-colors">
                    + Add Break
                  </button>
                </div>
                
                <div className="space-y-3">
                  {queueFormData.breaks.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[10px] text-slate-400">No breaks configured</p>
                    </div>
                  ) : (
                    queueFormData.breaks.map((brk, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2 animate-in slide-in-from-left-2">
                        <input 
                          className="flex-1 bg-white border-0 rounded-lg text-xs font-bold p-2 w-full" 
                          placeholder="Name (e.g. Lunch)" 
                          value={brk.name} 
                          onChange={(e) => updateBreak(idx, 'name', e.target.value)}
                        />
                        <input 
                          type="time" 
                          className="bg-white border-0 rounded-lg text-xs font-bold p-2 w-20" 
                          value={brk.start} 
                          onChange={(e) => updateBreak(idx, 'start', e.target.value)}
                        />
                        <span className="text-slate-300">-</span>
                        <input 
                          type="time" 
                          className="bg-white border-0 rounded-lg text-xs font-bold p-2 w-20" 
                          value={brk.end} 
                          onChange={(e) => updateBreak(idx, 'end', e.target.value)}
                        />
                        <button onClick={() => removeBreak(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button onClick={() => { setShowAddQueue(null); setEditingQueue(null); }} className="flex-1 text-slate-400 font-bold">Cancel</button>
                <button onClick={() => handleSaveQueue(showAddQueue || editingQueue?.shopId || '')} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-colors">
                  {editingQueue ? 'Save Changes' : 'Create Line'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorView;
