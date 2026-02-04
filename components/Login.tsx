
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  User as UserIcon, 
  Building2, 
  Smartphone, 
  Mail, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      // Special check for mock data user
      const isMockUser = formData.email.toLowerCase() === 'r@r.com';
      const newUser: User = {
        id: isMockUser ? 'vendor-r-mock' : Math.random().toString(36).substr(2, 9),
        ...formData,
        name: isMockUser && !formData.name ? 'Premium Vendor' : formData.name,
        age: parseInt(formData.age) || undefined,
        role
      };
      onLogin(newUser);
      setLoading(false);
    }, 800);
  };

  const isVendor = role === UserRole.VENDOR;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-8 font-['Inter']">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Rocket <span className="text-indigo-600">Queue</span>
          </h1>
          <p className="text-slate-500 font-medium">
            The intelligent way to wait. 
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="flex p-2 bg-slate-50/80 m-6 rounded-2xl border border-slate-100">
            <button
              onClick={() => setRole(UserRole.CUSTOMER)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 ${
                !isVendor ? 'bg-white shadow-sm text-indigo-600 scale-100 ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 grayscale opacity-70'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="font-bold text-sm">Customer</span>
            </button>
            <button
              onClick={() => setRole(UserRole.VENDOR)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 ${
                isVendor ? 'bg-white shadow-sm text-indigo-600 scale-100 ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 grayscale opacity-70'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="font-bold text-sm">Vendor</span>
            </button>
          </div>

          <div className="px-8 pb-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {isVendor 
                  ? 'Manage your business queues with AI insights'
                  : 'Join queues from anywhere, track in real-time'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginMode && (
                <div className="space-y-1.5 group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <UserIcon className="w-full h-full" />
                    </div>
                    <input
                      required={!isLoginMode}
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-black placeholder:text-slate-400"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail className="w-full h-full" />
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="alex@company.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-black placeholder:text-slate-400"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {!isLoginMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Smartphone className="w-full h-full" />
                      </div>
                      <input
                        required={!isLoginMode}
                        type="tel"
                        placeholder="Mobile"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-black placeholder:text-slate-400"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Age</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Calendar className="w-full h-full" />
                      </div>
                      <input
                        type="number"
                        placeholder="Age"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-black placeholder:text-slate-400"
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLoginMode ? 'Sign In' : (isVendor ? 'Get Your QR Code' : 'Start Discovery')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors"
              >
                {isLoginMode ? "Don't have an account? " : "Already using Rocket Queue? "}
                <span className="font-bold text-indigo-600 underline underline-offset-4 decoration-2">
                  {isLoginMode ? 'Create Profile' : 'Sign In'}
                </span>
              </button>
              
              <div className="flex items-center gap-6 text-slate-300">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.1em]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.1em]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI-Powered
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase font-bold tracking-widest leading-relaxed">
          Rocket Queue v2.0 &bull; Designed for small-to-medium scale shops
        </p>
      </div>
    </div>
  );
};

export default Login;
