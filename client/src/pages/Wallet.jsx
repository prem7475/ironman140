import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../services/api';
import useStore from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import {
  getMockWalletBalance,
  updateMockWalletBalance,
  getMockWalletTransactions,
  addMockWalletTransaction
} from '../utils/mockStorage';

const sources = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'];

const Wallet = () => {
  const user = useStore(state => state.user);
  const { socket, connected } = useSocket();

  const [data, setData] = useState({ walletBalance: 0, walletTransactions: [] });
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('UPI');
  const [mode, setMode] = useState('add');
  const [qr, setQr] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadWallet = () => {
    api.get('/wallet')
      .then(response => {
        setData({
          walletBalance: response.data.walletBalance || 0,
          walletTransactions: response.data.walletTransactions || []
        });
      })
      .catch(() => {
        const userEmail = user?.email;
        setData({
          walletBalance: getMockWalletBalance(userEmail),
          walletTransactions: getMockWalletTransactions(userEmail)
        });
      });
  };

  useEffect(() => {
    loadWallet();
  }, [user]);

  // Real-Time WebSocket Wallet Listener
  useEffect(() => {
    if (!socket) return;

    socket.on('wallet_updated', (payload) => {
      const currentUserId = user?.id || user?._id;
      if (payload.userId === currentUserId) {
        setData({
          walletBalance: payload.walletBalance,
          walletTransactions: payload.walletTransactions
        });
      }
    });

    return () => {
      socket.off('wallet_updated');
    };
  }, [socket, user]);

  const generateQr = async () => {
    setQr(await QRCode.toDataURL(JSON.stringify({
      merchant: 'PACEFORGE ATHLETE WALLET',
      amount: Number(amount || 0),
      currency: 'INR',
      source,
      reference: `PF-W-${Date.now()}`
    }), { width: 230, margin: 2 }));
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    const numAmount = Number(amount || 0);
    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }

    try {
      const response = await api.post(`/wallet/${mode}`, { amount: numAmount, source });
      setMessage(response.data.msg);
      setAmount('');
      setQr('');
      loadWallet();
    } catch {
      const userEmail = user?.email;
      const type = mode === 'add' ? 'CREDIT' : 'DEBIT';
      const newBal = updateMockWalletBalance(userEmail, numAmount, type);
      const newTx = {
        reference: `PF-W-${Date.now().toString(36).toUpperCase()}`,
        amount: numAmount,
        type,
        source: mode === 'withdraw' ? 'WITHDRAWAL' : source,
        createdAt: new Date().toISOString()
      };
      addMockWalletTransaction(userEmail, newTx);
      setData({
        walletBalance: newBal,
        walletTransactions: getMockWalletTransactions(userEmail)
      });
      setMessage(type === 'CREDIT' ? `₹${numAmount.toLocaleString('en-IN')} added to wallet` : `₹${numAmount.toLocaleString('en-IN')} withdrawn from wallet`);
      setAmount('');
      setQr('');
    }
  };

  const userEmail = user?.email || 'Guest';

  return (
    <div className="pt-28 pb-16 min-h-screen max-w-4xl mx-auto px-4 font-ironman">
      <Link to="/profile" className="text-primary text-[10px] font-black uppercase tracking-widest">
        ← Back to profile
      </Link>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Financial Hub</span>
            {connected && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Radio size={12} /> WebSockets Live
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter mt-1">
            Athlete <span className="text-primary">Wallet</span>
          </h1>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-right">
          <p className="text-[9px] text-gray-500 uppercase font-black">Account</p>
          <p className="text-xs font-bold text-white truncate max-w-[200px]">{userEmail}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card mt-8 p-8 bg-gradient-to-br from-primary/15 via-black/40 to-transparent border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <WalletIcon size={120} className="text-primary" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Wallet Balance</p>
        <p className="text-5xl sm:text-6xl font-black italic text-white mt-2">
          ₹{Number(data.walletBalance || 0).toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-primary" /> Protected & Tied to {userEmail}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => { setMode('add'); setError(''); setMessage(''); }}
          className={`hero-button px-6 py-3.5 text-xs font-black flex items-center ${mode === 'add' ? '' : '!bg-white/5 !text-gray-400 border border-white/10'}`}
        >
          <ArrowDownToLine size={16} className="mr-2 text-primary" /> Add Money
        </button>
        <button
          onClick={() => { setMode('withdraw'); setError(''); setMessage(''); }}
          className={`hero-button px-6 py-3.5 text-xs font-black flex items-center ${mode === 'withdraw' ? '' : '!bg-white/5 !text-gray-400 border border-white/10'}`}
        >
          <ArrowUpFromLine size={16} className="mr-2 text-primary" /> Withdraw Funds
        </button>
      </div>

      {/* Deposit / Withdraw Form */}
      <form onSubmit={submit} className="glass-card mt-4 p-6 sm:p-8 space-y-5 border-none">
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
          Amount (INR)
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={event => setAmount(event.target.value)}
            className="input-hero mt-2 py-4 text-lg font-black"
            placeholder="E.G. 1000"
          />
        </label>

        {mode === 'add' && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
            Funding Method
            <select
              value={source}
              onChange={event => setSource(event.target.value)}
              className="input-hero mt-2 py-4 text-xs font-black"
            >
              {sources.map(item => (
                <option key={item} value={item} className="bg-black text-white">
                  {item.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generateQr}
              className="mt-3 text-primary text-xs uppercase font-black tracking-widest hover:underline"
            >
              + Generate Payment QR for ₹{Number(amount || 0).toLocaleString('en-IN')}
            </button>
          </label>
        )}

        <button className="hero-button w-full py-4 text-xs font-black">
          {mode === 'add' ? 'Credit Wallet' : 'Withdraw Funds'}
        </button>

        {qr && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Scan Payment QR</p>
            <img src={qr} alt="Wallet funding QR" className="w-48 h-48 bg-white p-2 mx-auto rounded-xl shadow-xl" />
          </div>
        )}

        {message && (
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest flex gap-2 items-center">
            <CheckCircle2 size={16} /> {message}
          </p>
        )}
        {error && <p className="text-primary text-xs font-black uppercase tracking-widest">{error}</p>}
      </form>

      {/* Transaction Records Column Table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
            <WalletIcon className="text-primary" size={20} /> Transaction Ledger
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {data.walletTransactions.length} Record(s)
          </span>
        </div>

        <div className="space-y-3">
          {(data.walletTransactions || []).slice().reverse().map((item, index) => (
            <div key={`${item.reference || index}-${index}`} className="glass-card p-4 sm:p-5 flex items-center justify-between border-none">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary'
                }`}>
                  {item.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-black uppercase italic text-sm sm:text-base text-white">
                    {item.source ? item.source.replace('_', ' ') : (item.type === 'CREDIT' ? 'Deposit' : 'Withdrawal')}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    Ref: <span className="text-gray-400">{item.reference || 'PF-W-TX'}</span> · {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-black italic ${item.type === 'CREDIT' ? 'text-emerald-400' : 'text-primary'}`}>
                  {item.type === 'CREDIT' ? '+' : '-'}₹{Number(item.amount || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {item.type === 'CREDIT' ? 'CREDITED' : 'DEBITED'}
                </span>
              </div>
            </div>
          ))}

          {(!data.walletTransactions || data.walletTransactions.length === 0) && (
            <div className="glass-card p-8 text-center border-none">
              <p className="text-gray-500 text-xs uppercase font-black tracking-widest">No wallet transactions recorded yet for this account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
