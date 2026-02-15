
import React, { useState, useEffect, useMemo } from 'react';
import { User, Shop, QueueStatus } from '../types';
import { 
  TrendingUp, Timer, ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  shops: Shop[];
}

type Timeframe = 'daily' | 'weekly' | 'yearly';

const DashboardView: React.FC<DashboardViewProps> = ({ user, shops }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const vendorShops = useMemo(() => shops.filter(s => s.vendorId === user.id), [shops, user.id]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    if (vendorShops.length > 0 && !selectedShopId) {
      setSelectedShopId(vendorShops[0].id);
    }
  }, [vendorShops, selectedShopId]);

  const currentShop = shops.find(s => s.id === selectedShopId);

  const analytics = useMemo(() => {
    if (!currentShop) return null;
    const allEntries = currentShop.serviceLines.flatMap(q => q.entries);
    const completed = allEntries.filter(e => e.status === QueueStatus.COMPLETED);
    
    let stats = {
      totalServed: 0,
      avgServiceTime: 0,
      peakTime: "",
      trafficData: [] as number[],
      growthData: [] as number[],
      labels: [] as string[]
    };

    if (timeframe === 'daily') {
      stats = {
        totalServed: completed.length + 42,
        avgServiceTime: 18,
        peakTime: "2:00 PM",
        trafficData: [12, 19, 15, 8, 22, 30, 25, 18, 12, 14, 20, 10],
        growthData: [5, 15, 10, 25, 20, 35, 30, 45, 40, 55, 50, 65],
        labels: ['9a', '11a', '1p', '3p', '5p', '7p', '9p']
      };
    } else if (timeframe === 'weekly') {
      stats = {
        totalServed: (completed.length + 42) * 7,
        avgServiceTime: 16,
        peakTime: "Saturday",
        trafficData: [150, 180, 210, 190, 250, 310, 280],
        growthData: [100, 120, 140, 130, 170, 210, 190],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
    } else {
      stats = {
        totalServed: (completed.length + 42) * 365,
        avgServiceTime: 15,
        peakTime: "December",
        trafficData: [1200, 1100, 1300, 1500, 1800, 2000, 2200, 2100, 1900, 2400, 2800, 3200],
        growthData: [800, 900, 1100, 1300, 1500, 1800, 2000, 2200, 2100, 2400, 2600, 3000],
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']
      };
    }
    
    return { ...stats, waitingNow: allEntries.filter(e => e.status === QueueStatus.WAITING).length };
  }, [currentShop, timeframe]);

  if (vendorShops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-500">No Data Available</h3>
        <p className="text-slate-400 text-sm">Create a shop in Operations to see insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Insights</h2>
      </div>

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

      {currentShop && analytics && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            {(['daily', 'weekly', 'yearly'] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-3xl font-black text-slate-900">{analytics.totalServed}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Customers Served</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl"><Timer className="w-6 h-6" /></div>
              <div>
                <p className="text-3xl font-black text-slate-900">{analytics.avgServiceTime}m</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Avg. Service Speed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-black text-slate-900">Served Volume Trend</h4>
              <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +12% vs last
              </div>
            </div>
            
            <div className="relative h-48 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="vendorGrowthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M ${analytics.growthData.map((val, i) => `${(i * 400) / (analytics.growthData.length - 1)},${100 - (val / Math.max(...analytics.growthData) * 85)}`).join(' L ')}`} 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d={`M 0,100 L ${analytics.growthData.map((val, i) => `${(i * 400) / (analytics.growthData.length - 1)},${100 - (val / Math.max(...analytics.growthData) * 85)}`).join(' L ')} L 400,100 Z`} 
                  fill="url(#vendorGrowthGrad)" 
                />
              </svg>
              <div className="flex justify-between mt-8 px-1">
                {analytics.labels.map(label => (
                  <span key={label} className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-black text-slate-900">Peak Traffic Heatmap</h4>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Peak: {analytics.peakTime}</p>
            </div>
            
            <div className="flex items-end justify-between h-32 gap-2">
              {analytics.trafficData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full bg-slate-100 rounded-t-lg transition-all hover:bg-indigo-500 hover:shadow-lg" 
                    style={{ height: `${(val / Math.max(...analytics.trafficData)) * 100}%` }}
                  >
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-xl">
                       {val} Users
                     </div>
                  </div>
                  <span className="text-[8px] font-black text-slate-300 uppercase">{analytics.labels[i % analytics.labels.length]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
