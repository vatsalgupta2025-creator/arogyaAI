import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FLOWER_VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

export { FLOWER_VIDEO_URL };

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#000', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {/* Flower Video Background — fills screen, no scroll */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <video
            src={FLOWER_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        </div>

        {/* Centered Content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          {/* Animated Heart Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative' }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(251, 191, 36, 0.5), 0 0 80px rgba(251, 191, 36, 0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: 40, height: 40 }}>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </motion.div>

            {/* Pulse rings */}
            <motion.div
              animate={{
                scale: [1, 2.5],
                opacity: [0.4, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: '2px solid rgba(251, 191, 36, 0.4)',
              }}
            />
            <motion.div
              animate={{
                scale: [1, 2.5],
                opacity: [0.4, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5
              }}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: '2px solid rgba(251, 191, 36, 0.4)',
              }}
            />
          </motion.div>

          {/* App Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-6xl md:text-7xl lg:text-[6rem] font-heading italic tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            Aarogya AI
          </motion.h1>

          {/* Life-saving Quote */}
          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 300,
              fontSize: 18,
              letterSpacing: 0.5,
              maxWidth: 500,
              textAlign: 'center',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}
          >
            "Every second counts. Every heartbeat matters. We predict the future to protect the present."
          </motion.p>

          {/* Loading Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 16
            }}
          >
            <div style={{
              width: 200,
              height: 3,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 99,
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #fbbf24, #fef08a)',
                  borderRadius: 99
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, delay: 1, ease: 'easeInOut' }}
              />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              style={{
                color: 'rgba(251,191,36,0.6)',
                fontSize: 11,
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontWeight: 500
              }}
            >
              Initializing Clinical Intelligence
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
