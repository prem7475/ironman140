import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, History, Calendar, Settings, Award,
  MapPin, Activity, Zap, ShieldCheck, ChevronRight,
  TrendingUp, Dna, Trophy, X, Camera, Utensils, Download,
  User, CheckCircle2, Phone, Mail, Globe, Heart
} from 'lucide-react';
import useStore from '../store/useStore';
import { getMockRegistrations, getMockWalletBalance } from '../utils/mockStorage';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const localClubsByCity = {
  Mumbai: [
    { name: 'Mumbai Striders Running Club', location: 'Bandras Seafacing & Shivaji Park', discipline: 'Marathon / Distance Running', members: '1,200+' },
    { name: 'Bombay Cyclothon Group', location: 'Marine Drive & Eastern Express Highway', discipline: 'Road Cycling', members: '850+' },
    { name: 'Sea Hawks Open Water Swimming', location: 'Juhu Beach Coastal Zone', discipline: 'Open Water Swim', members: '400+' }
  ],
  Delhi: [
    { name: 'Delhi Runners Group (DRG)', location: 'Lodi Gardens & Nehru Park', discipline: 'Marathon & Trail', members: '2,100+' },
    { name: 'Capital Pedal Tribe', location: 'Gurgaon-Faridabad Highway', discipline: 'Road Cycling', members: '1,500+' }
  ],
  Bangalore: [
    { name: 'Pacemakers Bangalore', location: 'Cubbon Park & Kanteerava', discipline: 'Marathon & Endurance', members: '3,000+' },
    { name: 'Bengaluru Randonneurs', location: 'Hebbal Flyover to Highway', discipline: 'Ultra Long Cycling', members: '1,800+' }
  ],
  Pune: [
    { name: 'Pune Running Beyond Myself', location: 'University Road & Vetal Tekdi', discipline: 'Trail & Road Run', members: '1,600+' }
  ]
};

const Profile = () => {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  const [account, setAccount] = useState(user);
  const [registrations, setRegistrations] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // Modals & Interactive UI States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || 'Mumbai',
    avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
  });

  const [showClubsModal, setShowClubsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }

    setEditProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || 'Mumbai',
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
    });

    const token = localStorage.getItem('paceforge_token');
    fetch(`${API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setAccount(data))
      .catch(() => {});

    fetch(`${API_URL}/registrations/my-races`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(list => {
        if (Array.isArray(list) && list.length > 0) setRegistrations(list);
        else setRegistrations(getMockRegistrations());
      })
      .catch(() => {
        setRegistrations(getMockRegistrations());
      });

    fetch(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.walletBalance !== undefined) setWalletBalance(data.walletBalance);
        else setWalletBalance(getMockWalletBalance(user.email));
      })
      .catch(() => {
        setWalletBalance(getMockWalletBalance(user.email));
      });
  }, [user, navigate]);

  if (!user) return null;

  const currentAccount = account || user;
  const health = currentAccount?.healthDetails || {};

  // Categorize Registrations into Active, Upcoming, and Past Races
  const now = new Date();
  const activePasses = registrations.filter(r => r.status !== 'CANCELLED');
  const upcomingRaces = activePasses.filter(r => new Date(r.event?.date || Date.now()) >= now);
  const pastRaces = activePasses.filter(r => new Date(r.event?.date || Date.now()) < now);

  const stats = [
    ['Height', health.height ? `${health.height} cm` : 'Not set'],
    ['Weight', health.weight ? `${Number(health.weight).toFixed(1)} kg` : 'Not set'],
    ['BMI', health.bmi || 'Not set'],
    ['VO2 Max', health.vo2Max ? `${health.vo2Max} ml/kg/min` : 'Not set']
  ];

  const handleSaveProfileSettings = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      ...editProfileForm
    };
    setUser(updatedUser);
    setAccount(updatedUser);

    const token = localStorage.getItem('paceforge_token');
    if (token) {
      api.put('/user/profile', editProfileForm).catch(() => {});
    }

    setNotice('Profile settings updated successfully.');
    setShowSettingsModal(false);
  };

  const handleRemovePhoto = () => {
    const updatedForm = { ...editProfileForm, avatarUrl: '' };
    setEditProfileForm(updatedForm);
  };

  const cityClubs = localClubsByCity[editProfileForm.city] || localClubsByCity.Mumbai;

  return (
    <div className="pt-24 pb-12 container mx-auto px-6 max-w-7xl font-ironman">
      {notice && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black uppercase tracking-widest flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice('')}><X size={14} /></button>
        </div>
      )}

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 mb-10 relative overflow-hidden !rounded-2xl border-none shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12 relative z-10">
          <div className="relative">
            <div className="w-40 h-40 bg-hero-gray rounded-xl p-1 bg-gradient-to-br from-primary to-transparent shadow-2xl">
              <div className="w-full h-full bg-hero-gray rounded-lg overflow-hidden flex items-center justify-center">
                {editProfileForm.avatarUrl ? (
                  <img src={editProfileForm.avatarUrl} alt={currentAccount.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-500" />
                )}
              </div>
            </div>

            {/* Functional Settings Gear Icon Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettingsModal(true)}
              className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-xl shadow-2xl text-white hover:bg-white hover:text-primary transition-colors cursor-pointer"
              title="Edit Profile Settings"
            >
              <Settings size={20} />
            </motion.button>
          </div>

          <div className="text-center lg:text-left flex-1 space-y-8">
            <div className="space-y-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6">
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                  {currentAccount.name.split(' ')[0]} <span className="text-primary">{currentAccount.name.split(' ').slice(1).join(' ') || ''}</span>
                </h1>
                <span className="bg-white/5 text-primary border border-primary/20 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] w-fit mx-auto lg:mx-0 backdrop-blur-md">
                  {currentAccount.membershipStatus === 'ACTIVE' ? 'Premium Forger' : 'Athlete Member'}
                </span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-400 font-bold uppercase tracking-widest text-sm">
                 <MapPin size={16} className="text-primary" />
                 <span>{editProfileForm.city}, India</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'BMI STATUS', val: health.bmi || '—', sub: health.bmiCategory || 'NOT SET', color: 'text-green-500' },
                 { label: 'MEMBER TIER', val: currentAccount.membershipStatus === 'ACTIVE' ? 'PREMIUM' : 'FREE', sub: 'FORGER PASS', color: 'text-primary' },
                 { label: 'TOTAL RACES', val: activePasses.length, sub: 'REGISTERED', color: 'text-white' },
                 { label: 'VO2 MAX', val: health.vo2Max ? `${health.vo2Max}` : '—', sub: 'ML/KG/MIN', color: 'text-primary' }
               ].map((item, i) => (
                 <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{item.label}</p>
                    <p className="text-xl font-black italic mb-1">{item.val}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.sub}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-3 glass-card p-6 md:p-8 border-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Biometric Intelligence</p>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Performance <span className="text-primary">Vitals</span></h2>
            </div>
            <Link to="/health" className="hero-button inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px]">
              <Settings size={15} /> {health.height || health.weight || health.bmi ? 'Update Metrics' : 'Compute Metrics'}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-7">
            {stats.map(([label, value]) => (
              <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
                <p className="text-lg font-black italic mt-2 text-white">{value}</p>
              </div>
            ))}
            <Link to="/wallet" className="bg-primary/10 border border-primary/30 rounded-xl p-4 hover:bg-primary/20 transition-all">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Wallet Balance</p>
              <p className="text-lg font-black italic mt-2 text-primary">₹{walletBalance.toLocaleString('en-IN')}</p>
            </Link>
          </div>
        </section>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-10">
          {/* Active Passes / Bookings */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                  <Ticket size={20} />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Active <span className="text-primary">Bookings & Passes</span></h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{activePasses.length} Active</span>
            </div>

            <div className="space-y-4">
              {activePasses.map(event => (
                <motion.div
                  key={event.registrationId || event._id}
                  whileHover={{ y: -3 }}
                  className="glass-card p-6 flex flex-col md:flex-row justify-between items-center group border-none bg-gradient-to-br from-white/5 to-transparent shadow-xl"
                >
                  <div className="flex items-center space-x-6 mb-6 md:mb-0">
                    <div className="w-16 h-16 bg-black/40 rounded-xl flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/50 transition-all relative overflow-hidden shrink-0">
                       <Activity size={28} className="relative z-10" />
                       <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-all"></div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1 block">{event.category} ({event.distance || '21 KM'})</span>
                      <h3 className="font-black uppercase italic text-xl mb-1 text-white">{event.event?.title}</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <p className="text-gray-400 text-[10px] font-black flex items-center uppercase tracking-widest">
                          <Calendar size={12} className="mr-1.5 text-primary" /> {event.event?.date && new Date(event.event.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </p>
                        <p className="text-gray-400 text-[10px] font-black flex items-center uppercase tracking-widest">
                          <ShieldCheck size={12} className="mr-1.5 text-primary" /> ID: {event.registrationId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link to={`/my-races/${event.registrationId}/ticket`} className="hero-button py-3 px-8 text-[10px] shadow-2xl shrink-0">
                    Digital Entry
                  </Link>
                </motion.div>
              ))}

              {activePasses.length === 0 && (
                <div className="glass-card p-8 text-center border-none">
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">No active race passes found.</p>
                  <Link to="/races" className="hero-button text-xs py-3 px-6 inline-block">Explore Races</Link>
                </div>
              )}
            </div>
          </section>

          {/* Past Races */}
          {pastRaces.length > 0 && (
            <section>
              <div className="flex items-center space-x-3 mb-6 px-2">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 border border-white/10">
                  <History size={20} />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-400">Past <span className="text-white">Victories</span></h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {pastRaces.map(event => (
                  <div key={event._id} className="glass-card p-6 border-none bg-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black uppercase italic text-base text-gray-200 leading-tight">{event.event?.title}</h3>
                      <Award className="text-orange-500 shrink-0" size={20} />
                    </div>
                    <p className="text-xs text-gray-400 mb-4">{event.category} · {event.distance}</p>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <div>
                         <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Status</p>
                         <p className="text-sm font-black italic text-emerald-400">COMPLETED</p>
                      </div>
                      <Link to={`/my-races/${event.registrationId}/ticket`} className="text-primary text-[10px] font-black uppercase tracking-widest">
                        Pass Record →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Quick Shortcuts & Actions */}
        <div className="space-y-6">
          <div className="glass-card p-8 border-none !rounded-xl">
             <h3 className="text-xl font-black uppercase italic mb-6">Quick Actions</h3>
             <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate('/races')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group text-left"
                >
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">
                     <Trophy size={16} className="text-primary mr-3" />
                     Register New Race
                  </span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setShowNutritionModal(true)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group text-left"
                >
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">
                     <Utensils size={16} className="text-primary mr-3" />
                     Download Nutrition Guide
                  </span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setShowClubsModal(true)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group text-left"
                >
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">
                     <MapPin size={16} className="text-primary mr-3" />
                     Find Local Clubs ({editProfileForm.city})
                  </span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate('/health')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group text-left"
                >
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">
                     <Activity size={16} className="text-primary mr-3" />
                     Recalibrate Vitals & BMI
                  </span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: EDIT PROFILE SETTINGS */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-8 relative border-white/15">
              <button onClick={() => setShowSettingsModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-black uppercase italic mb-6">Profile Settings</h3>

              <form onSubmit={handleSaveProfileSettings} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black/50 overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                    {editProfileForm.avatarUrl ? (
                      <img src={editProfileForm.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Profile Photo URL</label>
                    <input
                      type="url"
                      value={editProfileForm.avatarUrl}
                      onChange={e => setEditProfileForm({ ...editProfileForm, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="input-hero py-2 text-xs"
                    />
                    {editProfileForm.avatarUrl && (
                      <button type="button" onClick={handleRemovePhoto} className="text-primary text-[9px] font-black uppercase tracking-widest hover:underline">
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Full Athlete Name<input type="text" required value={editProfileForm.name} onChange={e => setEditProfileForm({ ...editProfileForm, name: e.target.value })} className="input-hero mt-1 py-3" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address<input type="email" required value={editProfileForm.email} onChange={e => setEditProfileForm({ ...editProfileForm, email: e.target.value })} className="input-hero mt-1 py-3" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number<input type="tel" value={editProfileForm.phone} onChange={e => setEditProfileForm({ ...editProfileForm, phone: e.target.value })} className="input-hero mt-1 py-3" placeholder="+91 9876543210" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Primary City<select value={editProfileForm.city} onChange={e => setEditProfileForm({ ...editProfileForm, city: e.target.value })} className="input-hero mt-1 py-3"><option value="Mumbai" className="bg-black">Mumbai</option><option value="Delhi" className="bg-black">Delhi</option><option value="Bangalore" className="bg-black">Bangalore</option><option value="Pune" className="bg-black">Pune</option><option value="Chennai" className="bg-black">Chennai</option><option value="Hyderabad" className="bg-black">Hyderabad</option></select></label>

                <button className="hero-button w-full mt-4 py-4 text-xs">Save Profile Changes</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: LOCAL CLUBS DIRECTORY */}
      <AnimatePresence>
        {showClubsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-8 relative border-white/15">
              <button onClick={() => setShowClubsModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-black uppercase italic mb-1">Local Athletic Clubs</h3>
              <p className="text-xs text-primary font-black uppercase tracking-widest mb-6">Verified Teams in {editProfileForm.city}</p>

              <div className="space-y-3">
                {cityClubs.map((club, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <p className="font-black uppercase italic text-sm text-white">{club.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{club.discipline} · {club.location}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{club.members} Athletes Active</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowClubsModal(false)} className="hero-button w-full mt-6 py-3 text-xs">Close Directory</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: NUTRITION & METABOLIC GUIDE */}
      <AnimatePresence>
        {showNutritionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-8 relative border-white/15">
              <button onClick={() => setShowNutritionModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <Utensils size={36} className="text-primary mb-4" />
              <h3 className="text-2xl font-black uppercase italic mb-2">Metabolic Nutrition Intel</h3>
              <p className="text-xs text-gray-400 mb-6">Official PACEFORGE pre-race fueling & intra-workout hydration guide.</p>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-black text-primary uppercase text-[10px]">Pre-Race Carbo Loading (3 Hours Before)</p>
                  <p className="text-gray-400 text-[11px] mt-1">Complex carbs: Oatmeal, banana, honey, 500ml electrolyte water.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-black text-primary uppercase text-[10px]">Intra-Workout Fueling (&gt; 60 Mins)</p>
                  <p className="text-gray-400 text-[11px] mt-1">30g-60g carbs/hour via energy gels + 700ml sodium hydration solution.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('PACEFORGE Nutrition Protocol downloaded.');
                  setShowNutritionModal(false);
                }}
                className="hero-button w-full mt-6 py-3 text-xs flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download Protocol PDF
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
