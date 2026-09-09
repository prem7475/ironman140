import React from 'react';
import { motion } from 'framer-motion';

const AuthBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none select-none">
      {/* Base Sports Image Layer 1 - PACEFORGE_PREM2 (Wide Composition) */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/PACEFORGE_PREM2.png"
          alt="PACEFORGE Athletes"
          className="w-full h-full object-cover object-center filter grayscale-[30%] contrast-[1.15] brightness-[0.7]"
          loading="eager"
        />
      </motion.div>

      {/* Layer 2 Overlay - PACEFORGE_PREM1 (Action Collage) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute inset-0 z-1 hidden md:block mix-blend-screen"
      >
        <img
          src="/PACEFORGE_PREM1.png"
          alt="PACEFORGE Performance Collage"
          className="w-full h-full object-cover object-right filter grayscale-[20%] contrast-[1.2]"
          loading="eager"
        />
      </motion.div>

      {/* Radial Vignette & Gradient Overlays for High Contrast Readability */}
      <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#050505] via-black/75 to-[#050505]/90" />
      <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#050505]/95 via-black/60 to-[#050505]/95" />

      {/* Ambient PACEFORGE Red Glow Lighting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.25, 0.4, 0.25], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-primary/20 rounded-full blur-[140px] z-3 pointer-events-none"
      />

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] z-3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-[120px] z-3" />

      {/* Subtle Noise / Texture Overlay */}
      <div className="absolute inset-0 z-4 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
};

export default AuthBackground;
