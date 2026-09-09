import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, ArrowRight, UserPlus,
  MapPin, Phone, Shield, FileText, Globe,
  CheckCircle2, Trophy, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { authService } from '../services/api';

const Register = () => {
  const [formType, setFormType] = useState('membership'); // 'membership' or 'basic'
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    address: '',
    nationality: '',
    aadhaar: '',
    docType: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.register({
        ...formData,
        membershipStatus: formType === 'membership' ? 'ACTIVE' : 'FREE'
      });
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
      if (formType === 'membership') setShowSuccess(true);
      else navigate('/profile');
    } catch (err) {
      if (!err.response) {
        setError('Backend server on port 5000 is unreachable. Please make sure your server is running (npm start in server directory).');
      } else {
        setError(err.response?.data?.msg || 'Unable to register account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 lg:pt-32 pb-12 lg:pb-20 min-h-screen flex items-center justify-center px-4 lg:px-6 relative font-ironman">
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
        className="w-full max-w-7xl relative z-10"
      >
        <div className="glass-card border-none shadow-2xl flex flex-col lg:flex-row min-h-auto lg:min-h-[700px] overflow-visible">
          {/* Left Column: Branding/Type Selection */}
          <div className="lg:w-[25%] p-8 lg:p-12 bg-primary/10 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10 mb-8 lg:mb-0">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 lg:mb-8 shadow-lg shadow-primary/30">
                <UserPlus size={28} className="text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-tight mb-4">
                Forge <br className="hidden lg:block" /> <span className="text-primary">Community</span>
              </h1>
              <p className="text-gray-400 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">
                Join the elite network of performance athletes and metabolic masters.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <button
                disabled={loading}
                type="button"
                onClick={() => setFormType('membership')}
                className={`w-full p-4 lg:p-5 rounded-xl border transition-all text-left group ${formType === 'membership' ? 'bg-primary border-primary shadow-[0_0_30px_rgba(225,6,0,0.3)]' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest ${formType === 'membership' ? 'text-white/80' : 'text-gray-500'}`}>Premium Tier</p>
                <p className="font-black italic text-sm lg:text-base mt-1">Community Member</p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[10px] lg:text-[11px] font-bold opacity-60">₹4,999 / Year</span>
                   <CheckCircle2 size={16} className={formType === 'membership' ? 'opacity-100' : 'opacity-0'} />
                </div>
              </button>

              <button
                disabled={loading}
                type="button"
                onClick={() => setFormType('basic')}
                className={`w-full p-4 lg:p-5 rounded-xl border transition-all text-left group ${formType === 'basic' ? 'bg-primary border-primary shadow-[0_0_30px_rgba(225,6,0,0.3)]' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest ${formType === 'basic' ? 'text-white/80' : 'text-gray-500'}`}>Standard Access</p>
                <p className="font-black italic text-sm lg:text-base mt-1">Free Account</p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[10px] lg:text-[11px] font-bold opacity-60">Basic Website Access</span>
                   <CheckCircle2 size={16} className={formType === 'basic' ? 'opacity-100' : 'opacity-0'} />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="flex-1 p-8 lg:p-14">
            <div className="mb-8 lg:mb-12 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter mb-2">
                {formType === 'membership' ? 'Membership Application' : 'Quick Registration'}
              </h2>
              <p className="text-gray-500 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em]">Biometric & Legal Verification</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[11px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="group">
                  <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Athlete Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      disabled={loading}
                      className="input-hero pl-12 py-4 lg:py-5"
                      placeholder="FULL NAME"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Digital Identity</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      className="input-hero pl-12 py-4 lg:py-5"
                      placeholder="EMAIL ADDRESS"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {formType === 'membership' && (
                  <motion.div
                    key="premium-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 lg:space-y-8 overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                      <div className="group">
                        <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Communication</label>
                        <div className="relative flex items-center bg-black border border-white/10 rounded-xl focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 transition-all group h-[58px] lg:h-[68px]">
                          <Phone className="absolute left-4 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />

                          <div className="relative h-full flex items-center border-r border-white/10">
                            <select
                              disabled={loading}
                              className="h-full w-28 lg:w-32 bg-transparent pl-12 pr-6 lg:pr-8 text-[10px] lg:text-[11px] font-black outline-none appearance-none cursor-pointer uppercase text-white"
                              value={formData.countryCode}
                              onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                            >
                              <option className="bg-black text-white" value="+91">+91 (IND)</option>
                              <option className="bg-black text-white" value="+1">+1 (USA)</option>
                              <option className="bg-black text-white" value="+44">+44 (UK)</option>
                              <option className="bg-black text-white" value="+971">+971 (UAE)</option>
                              <option className="bg-black text-white" value="+61">+61 (AUS)</option>
                              <option className="bg-black text-white" value="+65">+65 (SGP)</option>
                            </select>
                            <ChevronDown className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                          </div>

                          <input
                            type="tel"
                            required
                            disabled={loading}
                            className="flex-1 h-full bg-transparent px-4 lg:px-6 text-[12px] lg:text-[13px] font-bold tracking-widest outline-none text-white placeholder:text-gray-700 uppercase"
                            placeholder="PHONE NUMBER"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Nationality</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                          <select
                            className="input-hero pl-12 pr-10 appearance-none cursor-pointer py-4 lg:py-5"
                            value={formData.nationality}
                            disabled={loading}
                            onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                            required
                          >
                            <option className="bg-black text-white" value="" disabled>SELECT NATIONALITY</option>
                            <option className="bg-black text-white" value="Indian">Indian</option>
                            <option className="bg-black text-white" value="American">American</option>
                            <option className="bg-black text-white" value="British">British</option>
                            <option className="bg-black text-white" value="Other">International / Other</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Permanent Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-5 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                        <textarea
                          className="input-hero pl-12 min-h-[100px] lg:min-h-[120px] py-4 lg:py-5 leading-relaxed"
                          placeholder="COMPLETE RESIDENTIAL ADDRESS FOR WELCOME KIT DELIVERY"
                          value={formData.address}
                          disabled={loading}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          required
                        ></textarea>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                      <div className="group">
                        <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Citizenship Proof</label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                          <select
                            className="input-hero pl-12 pr-10 appearance-none cursor-pointer py-4 lg:py-5"
                            value={formData.docType}
                            disabled={loading}
                            onChange={(e) => setFormData({...formData, docType: e.target.value})}
                            required
                          >
                            <option className="bg-black text-white" value="" disabled>SELECT DOCUMENT TYPE</option>
                            <option className="bg-black text-white" value="Passport">Passport</option>
                            <option className="bg-black text-white" value="Driving License">Driving License</option>
                            <option className="bg-black text-white" value="National ID Card">National ID Card</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                        </div>
                      </div>

                      {formData.nationality === 'Indian' && (
                        <div className="group">
                          <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Aadhaar Verification</label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                              type="text"
                              className="input-hero pl-12 py-4 lg:py-5"
                              placeholder="12-DIGIT AADHAAR NO"
                              maxLength="12"
                              disabled={loading}
                              value={formData.aadhaar}
                              onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="group">
                <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 lg:mb-3 ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    className="input-hero pl-12 py-4 lg:py-5"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hero-button w-full py-5 lg:py-6 text-sm lg:text-base group mt-4 disabled:opacity-50"
              >
                <span className="flex items-center justify-center">
                  {loading ? 'Initializing...' : (
                    <>
                      {formType === 'membership' ? 'Secure Premium Membership' : 'Initialize Account'}
                      <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 lg:mt-10 text-center">
              <p className="text-[10px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Existing athlete? <Link to="/login" className="text-primary hover:text-white transition-colors underline underline-offset-4">Authenticate Now</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card max-w-lg p-12 text-center relative border-primary/20 shadow-[0_0_100px_rgba(225,6,0,0.2)]"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                <Trophy className="text-primary" size={48} />
              </div>
              <h3 className="text-3xl font-black uppercase italic mb-6 tracking-tighter">Application <span className="text-primary">Received</span></h3>
              <div className="space-y-4 mb-10">
                <p className="text-gray-300 text-sm font-bold uppercase tracking-widest leading-relaxed">
                  We've got your application, <span className="text-white">{formData.name}</span>.
                </p>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider leading-relaxed">
                  After verification, we will mail you a welcome letter and your exclusive welcome kit. Stay tuned to an exciting and fit lifestyle ahead!
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  window.location.href = '/profile';
                }}
                className="text-primary text-xl font-black uppercase italic tracking-tighter hover:text-white transition-colors animate-pulse flex items-center justify-center mx-auto group"
              >
                THANK YOU <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
