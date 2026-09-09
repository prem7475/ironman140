import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card max-w-md w-full p-8 sm:p-10 relative border-white/15 bg-[#0A0A0A]/90 text-white font-ironman"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {!sent ? (
              <>
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <ShieldCheck size={28} />
                </div>

                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                  Reset <span className="text-primary">Key</span>
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-6 leading-relaxed">
                  Enter your registered athlete email below. We will send security instructions to restore your account key.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER ATHLETE EMAIL"
                      className="w-full bg-black/80 border border-white/10 focus:border-primary/80 py-4 pl-12 pr-4 text-xs font-bold text-white rounded-xl outline-none transition-all uppercase tracking-wider"
                    />
                  </div>

                  <button type="submit" className="hero-button w-full py-4 text-xs flex items-center justify-center gap-2">
                    Send Reset Instructions <ArrowRight size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                  Instructions <span className="text-emerald-400">Dispatched</span>
                </h3>
                <p className="text-xs text-gray-300 font-bold uppercase tracking-wider leading-relaxed">
                  Security reset link sent to <span className="text-primary font-black">{email}</span>. Please check your inbox or contact support.
                </p>
                <button onClick={handleClose} className="hero-button w-full py-3.5 text-xs mt-4">
                  Return to Authenticate
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
