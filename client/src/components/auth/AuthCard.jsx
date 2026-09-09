import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-xl mx-auto"
    >
      {/* Outer Subtle Red Ambient Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.85)] p-6 sm:p-10 md:p-12 text-white bg-[#0A0A0A]/70 backdrop-blur-2xl transition-all ${className}`}
      >
        {/* Subtle Top Inner Highlight Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Children Form Contents */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
};

export default AuthCard;
