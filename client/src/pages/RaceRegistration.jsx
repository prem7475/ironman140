import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Phone, ShieldAlert, User, Timer, AlertCircle, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  getCheckoutSession,
  updateCheckoutParticipant,
  clearCheckoutSession,
  formatTimerSeconds,
  startCheckoutSession
} from '../utils/checkoutSession';

const RaceRegistration = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 600 seconds = 10 minutes
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  // Initialize or resume checkout session
  useEffect(() => {
    let activeSession = getCheckoutSession();

    if (!activeSession && state?.race) {
      activeSession = startCheckoutSession(
        state.race,
        state.category,
        state.distance,
        state.calculatedPrice,
        user
      );
    }

    if (!activeSession) {
      navigate('/races');
      return;
    }

    setSession(activeSession);
    const participant = activeSession.participant || {};
    setForm({
      name: participant.name || user?.name || '',
      email: participant.email || user?.email || '',
      phone: participant.phone || user?.phone || '',
      emergencyName: participant.emergencyName || '',
      emergencyPhone: participant.emergencyPhone || ''
    });
  }, [state, user, navigate]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const updateTimer = () => {
      const remainingMs = session.expiresAt - Date.now();
      const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        clearCheckoutSession();
        alert('Session Expired: Your 10-minute registration timer has ended. Please select your race again.');
        navigate('/races');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, navigate]);

  if (!session || !session.race) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-6 text-center font-ironman">
        <p className="text-gray-500 uppercase tracking-widest text-sm">Race registration session unavailable or expired.</p>
        <button onClick={() => navigate('/races')} className="hero-button inline-block mt-6 text-xs">Back to Races</button>
      </div>
    );
  }

  const race = session.race;
  const currentPrice = session.calculatedPrice || race.price;

  const update = event => {
    const updatedForm = { ...form, [event.target.name]: event.target.value };
    setForm(updatedForm);
    updateCheckoutParticipant(updatedForm);
  };

  const submit = event => {
    event.preventDefault();
    updateCheckoutParticipant(form);
    navigate('/payment', {
      state: {
        race,
        category: session.category,
        distance: session.distance,
        calculatedPrice: currentPrice,
        participant: form
      }
    });
  };

  return (
    <div className="pt-28 pb-16 min-h-screen max-w-4xl mx-auto px-4 font-ironman">
      {/* 10-Minute Session Timer Bar */}
      <div className="glass-card p-4 mb-6 border-primary/30 bg-primary/10 flex items-center justify-between flex-wrap gap-4 border-none">
        <div className="flex items-center gap-3">
          <Clock className="text-primary animate-pulse" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reserved Checkout Session</p>
            <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">Slot held for {session.category} ({session.distance})</p>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-2 rounded-xl border border-primary/40 flex items-center gap-2">
          <Timer size={16} className="text-primary" />
          <span className="text-xl font-black italic text-primary tracking-widest">{formatTimerSeconds(timeLeft)}</span>
        </div>
      </div>

      <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Athlete Information & Registration</p>
      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mt-1">
        Confirm Entry <span className="text-primary">Details</span>
      </h1>
      <p className="text-gray-400 mt-2 font-bold text-sm">
        {race.title} · {race.location} ({session.distance}) · Entry Fee: <strong className="text-primary">₹{currentPrice.toLocaleString('en-IN')}</strong>
      </p>

      <form onSubmit={submit} className="glass-card p-6 md:p-10 mt-8 grid md:grid-cols-2 gap-6 border-none">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Full Name (Prefilled from Profile)
          <div className="relative mt-2">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
            <input name="name" required value={form.name} onChange={update} className="input-hero pl-11 py-4 font-bold" />
          </div>
        </label>

        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Email Address (Prefilled from Profile)
          <div className="relative mt-2">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
            <input type="email" name="email" required value={form.email} onChange={update} className="input-hero pl-11 py-4 font-bold" />
          </div>
        </label>

        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Contact Phone Number
          <div className="relative mt-2">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
            <input type="tel" name="phone" required value={form.phone} onChange={update} className="input-hero pl-11 py-4 font-bold" placeholder="+91 9876543210" />
          </div>
        </label>

        <div className="md:col-span-2 border-t border-white/10 pt-6">
          <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={15} /> Emergency Contact Intel
          </p>
        </div>

        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Emergency Contact Name
          <input name="emergencyName" required value={form.emergencyName} onChange={update} className="input-hero mt-2 py-4 font-bold" placeholder="PRIMARY GUARDIAN / COACH" />
        </label>

        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Emergency Contact Phone
          <input type="tel" name="emergencyPhone" required value={form.emergencyPhone} onChange={update} className="input-hero mt-2 py-4 font-bold" placeholder="+91 9123456789" />
        </label>

        <button className="hero-button md:col-span-2 py-4 flex items-center justify-center gap-2 text-xs">
          Proceed to Payment Desk <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
};

export default RaceRegistration;
