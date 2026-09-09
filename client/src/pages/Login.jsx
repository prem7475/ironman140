import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(formData);
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
      navigate(redirectPath);
    } catch (err) {
      if (!err.response) {
        setError('Backend server on port 5000 is unreachable. Please make sure your server is running (npm start in server directory).');
      } else {
        setError(err.response?.data?.msg || 'Invalid credentials. Check your identity and key.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen flex items-center justify-center px-4 md:px-6 relative overflow-hidden font-ironman">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-cyclist-riding-on-a-mountain-road-4062-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="glass-card overflow-hidden border-none shadow-2xl flex flex-col md:flex-row">
          {/* Left Column: Email Form */}
          <div className="flex-1 p-8 md:p-14 border-b md:border-b-0 md:border-r border-white/5">
            <div className="mb-8 md:mb-10 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">
                Athlete <span className="text-primary">Login</span>
              </h1>
              <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Credentials Access</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[11px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Identity</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    className="input-hero pl-12 py-4"
                    placeholder="ENTER REGISTERED EMAIL"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    className="input-hero pl-12 py-4"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hero-button w-full py-4 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center">
                  {loading ? 'Authenticating...' : (
                    <>
                      Authenticate <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column: Social Links */}
          <div className="flex-1 p-8 md:p-14 bg-black/40 backdrop-blur-sm flex flex-col justify-center">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                Quick <span className="text-primary">Sync</span>
              </h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Connect with Platforms</p>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-md hover:bg-white hover:text-black transition-all group">
                <div className="flex items-center space-x-4">
                  <Globe size={20} className="text-primary group-hover:text-black" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Continue with Google</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>

              <button className="w-full flex items-center justify-between px-6 py-4 bg-[#FC4C02]/10 border border-[#FC4C02]/20 rounded-md hover:bg-[#FC4C02] hover:text-white transition-all group">
                <div className="flex items-center space-x-4">
                  <Activity size={20} className="text-[#FC4C02] group-hover:text-white" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Connect Strava</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>
            </div>

            <div className="mt-12 text-center">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 New Athlete? <Link to="/register" className="text-primary hover:text-white transition-colors">Join the Forge</Link>
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
