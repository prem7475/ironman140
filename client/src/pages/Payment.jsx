import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, Wallet, Clock, Timer } from 'lucide-react';
import QRCode from 'qrcode';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { registrationService } from '../services/api';
import ActivityAnimation from '../components/ActivityAnimation';
import useStore from '../store/useStore';
import {
  getMockWalletBalance,
  updateMockWalletBalance,
  saveMockRegistration,
  addMockWalletTransaction
} from '../utils/mockStorage';
import {
  getCheckoutSession,
  clearCheckoutSession,
  formatTimerSeconds
} from '../utils/checkoutSession';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const [session, setSession] = useState(getCheckoutSession());
  const [timeLeft, setTimeLeft] = useState(600);
  const [wallet, setWallet] = useState(0);
  const [source, setSource] = useState('WALLET');
  const [qr, setQr] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const race = state?.race || session?.race;
  const category = state?.category || session?.category;
  const distance = state?.distance || session?.distance;
  const participant = state?.participant || session?.participant;

  const amount = Number(state?.calculatedPrice || session?.calculatedPrice || race?.price || 0);
  const tax = Number((amount * 0.18).toFixed(2));
  const extra = amount > 0 ? 25 : 0;
  const total = amount + tax + extra;
  const walletUsed = Math.min(wallet, total);
  const due = Math.max(0, total - walletUsed);

  // Timer Countdown Effect
  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const updateTimer = () => {
      const remainingMs = session.expiresAt - Date.now();
      const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        clearCheckoutSession();
        alert('Session Expired: Your 10-minute payment window has ended.');
        navigate('/races');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, navigate]);

  // Load Wallet Balance
  useEffect(() => {
    if (!user) return;
    const userEmail = user.email;
    api.get('/wallet')
      .then(response => {
        if (response.data && response.data.walletBalance !== undefined) {
          setWallet(response.data.walletBalance);
        } else {
          setWallet(getMockWalletBalance(userEmail));
        }
      })
      .catch(() => {
        setWallet(getMockWalletBalance(userEmail));
      });
  }, [user]);

  // QR Code Generator for external sources
  useEffect(() => {
    if (source === 'WALLET') {
      setQr('');
      return undefined;
    }
    QRCode.toDataURL(JSON.stringify({
      merchant: 'PACEFORGE PAYMENTS',
      amount: due,
      currency: 'INR',
      reference: `PF-PAY-${Date.now()}`
    }), { width: 250, margin: 2 }).then(setQr).catch(() => {});
    return undefined;
  }, [source, due]);

  const checkPayment = async () => {
    setError('');

    // Check wallet balance if paying with wallet
    if (source === 'WALLET' && wallet < total) {
      setError(`Insufficient wallet balance (₹${wallet.toLocaleString('en-IN')}). Please add funds or select another payment method.`);
      return;
    }

    setStatus('checking');
    setTimeout(async () => {
      try {
        const response = await registrationService.registerForEvent({
          eventId: race._id,
          category,
          distance,
          participant,
          paymentSource: source
        });

        // Deduct from wallet if wallet was used
        if (source === 'WALLET') {
          api.post('/wallet/withdraw', { amount: total }).catch(() => {});
          updateMockWalletBalance(user?.email, total, 'DEBIT');
          addMockWalletTransaction(user?.email, {
            reference: `PF-W-${Date.now().toString(36).toUpperCase()}`,
            amount: total,
            type: 'DEBIT',
            source: `Race Entry: ${race.title}`,
            createdAt: new Date().toISOString()
          });
        }

        clearCheckoutSession();
        setStatus('success');
        setTimeout(() => navigate(`/booking-confirmation/${response.data.registrationId}`), 900);
      } catch (reqErr) {
        if (reqErr.response?.status === 409) {
          setError(reqErr.response?.data?.msg || 'You are already registered for this race category.');
          setStatus('idle');
          return;
        }

        // Offline / Netlify fallback booking
        const offlineRegId = `PF-REG-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const offlineBooking = {
          _id: `booking-${Date.now()}`,
          registrationId: offlineRegId,
          bookingId: `PF-BOOK-${Date.now().toString(36).toUpperCase()}`,
          bibNumber: `BIB-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'CONFIRMED',
          paymentStatus: 'Payment Successful',
          amount: total,
          category: category || race.category || 'Marathon',
          distance: distance || '21.1 KM',
          participant: {
            name: participant?.name || user?.name || 'Athlete Participant',
            email: participant?.email || user?.email || 'athlete@paceforge.com',
            phone: participant?.phone || user?.phone || '+91 9876543210'
          },
          event: {
            title: race.title,
            category: race.category,
            date: race.date,
            location: race.location,
            venue: race.venue || `${race.location} Sports Complex`
          }
        };

        saveMockRegistration(offlineBooking);

        if (source === 'WALLET') {
          updateMockWalletBalance(user?.email, total, 'DEBIT');
          addMockWalletTransaction(user?.email, {
            reference: `PF-W-${Date.now().toString(36).toUpperCase()}`,
            amount: total,
            type: 'DEBIT',
            source: `Race Entry: ${race.title}`,
            createdAt: new Date().toISOString()
          });
        }

        clearCheckoutSession();
        setStatus('success');
        setTimeout(() => navigate(`/booking-confirmation/${offlineRegId}`), 900);
      }
    }, 1600);
  };

  if (!race) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-6 text-center font-ironman">
        <p className="text-gray-500 uppercase tracking-widest text-sm">Payment session unavailable or expired.</p>
        <button onClick={() => navigate('/races')} className="hero-button inline-block mt-6 text-xs">Back to Races</button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 min-h-screen max-w-5xl mx-auto px-4 font-ironman">
      {/* 10-Minute Timer Header */}
      <div className="glass-card p-4 mb-6 border-primary/30 bg-primary/10 flex items-center justify-between flex-wrap gap-4 border-none">
        <div className="flex items-center gap-3">
          <Clock className="text-primary animate-pulse" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reserved Checkout Session</p>
            <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">{race.title} ({distance})</p>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-2 rounded-xl border border-primary/40 flex items-center gap-2">
          <Timer size={16} className="text-primary" />
          <span className="text-xl font-black italic text-primary tracking-widest">{formatTimerSeconds(timeLeft)}</span>
        </div>
      </div>

      <ActivityAnimation category={race.category} compact />
      <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-6">Secure Checkout Desk</p>
      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mt-2">Payment <span className="text-primary">Desk</span></h1>

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="glass-card p-7 border-none">
          <h2 className="text-2xl font-black uppercase italic">Invoice Summary</h2>
          <p className="text-gray-400 mt-2 font-bold text-sm">{race.title}</p>
          <div className="space-y-4 border-t border-white/10 mt-6 pt-6 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Selected Distance</span><span className="font-bold text-white">{distance}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Distance Fee</span><span className="font-bold text-white">₹{amount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Processing Charge</span><span>₹{extra.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-xl font-black border-t border-white/10 pt-5"><span>Total Invoice</span><span className="text-primary">₹{total.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="mt-7 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm"><Wallet size={17} className="text-primary"/>Available Wallet Balance</span>
            <strong className="text-white text-base">₹{wallet.toLocaleString('en-IN')}</strong>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {source === 'WALLET' ? `Deducting full ₹${total.toLocaleString('en-IN')} from wallet.` : `Wallet used: ₹${walletUsed.toLocaleString('en-IN')} · External payment: ₹${due.toLocaleString('en-IN')}`}
          </p>
        </div>

        <div className="glass-card p-7 border-none">
          <h2 className="text-2xl font-black uppercase italic">Select Payment Source</h2>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {['WALLET', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'].map(item => (
              <button
                key={item}
                onClick={() => setSource(item)}
                className={`p-4 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  source === item ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20' : 'border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {item === 'WALLET' ? 'Athlete Wallet' : item.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={checkPayment}
            disabled={status !== 'idle'}
            className="hero-button w-full mt-6 py-4 flex items-center justify-center gap-2 text-xs"
          >
            {status === 'checking' ? <><LoaderCircle className="animate-spin" size={17}/> Authorizing Entry...</> : status === 'success' ? <><CheckCircle2 size={17}/> Entry Confirmed!</> : <><CreditCard size={17}/> Complete Registration</>}
          </button>

          {qr && (
            <div className="mt-7 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scan payment QR · ₹{due.toLocaleString('en-IN')}</p>
              <img src={qr} alt="Payment QR code" className={`w-52 h-52 mx-auto mt-3 bg-white p-2 rounded-2xl shadow-2xl ${status === 'checking' ? 'animate-pulse' : ''}`}/>
            </div>
          )}

          {error && <p className="text-primary text-xs font-black uppercase tracking-widest mt-5 p-3 bg-primary/10 rounded-lg border border-primary/20">{error}</p>}
          <p className="text-gray-500 text-xs mt-6">Authorized payment activates your digital ticket immediately.</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
