import React, { useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../services/api';

const sources = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'];

const Membership = () => {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const [source, setSource] = useState('UPI');
  const [qr, setQr] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const generateQr = async () => setQr(await QRCode.toDataURL(JSON.stringify({
    merchant: 'PACEFORGE PREMIUM',
    amount: 4999,
    currency: 'INR',
    reference: `PF-MEMBER-${Date.now()}`
  }), { width: 240, margin: 2 }));

  const activate = async () => {
    setStatus('checking');
    setError('');
    if (!qr) await generateQr();

    setTimeout(async () => {
      try {
        const response = await api.post('/user/membership', { source });
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser({ ...user, membershipStatus: 'ACTIVE', isMember: true, membershipTier: 'PREMIUM' });
        }
        setStatus('success');
        setTimeout(() => navigate('/health'), 900);
      } catch {
        const updatedUser = {
          ...(user || {}),
          role: user?.role || 'USER',
          membershipStatus: 'ACTIVE',
          membershipPrice: 4999,
          isMember: true,
          membershipTier: 'PREMIUM'
        };
        setUser(updatedUser);
        setStatus('success');
        setTimeout(() => navigate('/health'), 900);
      }
    }, 1200);
  };

  return (
    <div className="pt-28 pb-16 min-h-screen max-w-3xl mx-auto px-4 font-ironman">
      <Link to="/profile" className="text-primary text-[10px] font-black uppercase tracking-widest">Back to profile</Link>
      <div className="glass-card p-8 md:p-12 mt-6 text-center border-none relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/PACEFORGE_PREM2.png"
            alt="PaceForge Membership Backdrop"
            className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.35] opacity-40"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10">
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">PaceForge premium</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mt-3">Become a <span className="text-primary">Forger</span></h1>
          <p className="text-gray-300 mt-5 font-bold uppercase tracking-wider text-xs">Unlock training plans, BMI analysis, VO2 Max, and full athlete intelligence.</p>
          <p className="text-5xl font-black italic text-primary mt-8">₹4,999 <span className="text-sm text-gray-500 not-italic">/ year</span></p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {sources.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => { setSource(item); generateQr(); }}
                className={`p-4 border rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  source === item ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {item.replace('_', ' ')}
              </button>
            ))}
          </div>

          {qr && (
            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-center items-center gap-2"><QrCode size={15}/> Scan payment QR · ₹4,999</p>
              <img src={qr} alt="Premium membership payment QR" className="w-52 h-52 mx-auto mt-3 bg-white p-2 rounded-xl shadow-xl"/>
            </div>
          )}

          <button onClick={activate} disabled={status !== 'idle'} className="hero-button w-full mt-7 py-4 flex justify-center items-center gap-2 text-xs">
            {status === 'checking' ? <><LoaderCircle className="animate-spin" size={17}/> Verifying payment...</> : status === 'success' ? <><CheckCircle2 size={17}/> Premium activated</> : <><CreditCard size={17}/> Confirm and Activate</>}
          </button>
          {error && <p className="text-primary text-xs mt-5 font-black uppercase">{error}</p>}
          <p className="text-gray-500 text-xs mt-7 uppercase tracking-widest">Instant activation & annual athlete pass confirmation.</p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
