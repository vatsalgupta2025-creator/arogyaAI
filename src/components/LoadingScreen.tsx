import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BlurText from './BlurText';

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to dashboard after 6 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-body"
      >
        {/* Flower UI Background Video */}
        <div className="absolute inset-0 z-0 opacity-70 mix-blend-screen pointer-events-none">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </motion.div>

          <h1 className="text-7xl md:text-8xl lg:text-[8rem] font-heading italic tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
            <BlurText text="Arogya" delay={0.3} />
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="text-white/60 font-light text-lg md:text-xl mt-6 tracking-wide"
          >
            Clinical Intelligence Reimagined
          </motion.p>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-200"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, delay: 1, ease: "easeInOut" }}
              />
            </div>
            <span className="text-amber-400/70 text-xs tracking-widest uppercase font-medium">Initializing Models</span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
