import { motion } from 'framer-motion';
import { ArrowUpRight, Play, Zap, Palette, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlurText from '../components/BlurText';
import HLSVideo from '../components/HLSVideo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen font-body overflow-x-hidden relative selection:bg-white/20">
      
      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-6">
        <div className="liquid-glass rounded-full px-2 py-2 flex items-center justify-between w-full max-w-5xl">
          <div className="flex items-center space-x-2 pl-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="font-heading italic font-bold text-xl tracking-tight leading-none mt-1 text-white">VitalAI</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/80">
            <a href="#" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Methodology</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Validation</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-black font-medium text-sm rounded-full px-5 py-2 flex items-center gap-1 hover:scale-105 transition-transform"
          >
            Get Started <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative h-[1000px] bg-black overflow-hidden flex flex-col items-center pt-[150px]">
        {/* Background Video */}
        <div className="absolute top-[20%] w-full h-auto z-0 flex justify-center opacity-80 pointer-events-none mix-blend-screen">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-6xl object-contain"
            poster="/images/hero_bg.jpeg"
          />
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/5 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 z-[1] h-[300px] bg-gradient-to-b from-transparent to-black pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-glass rounded-full px-3 py-1.5 flex items-center gap-2 mb-8"
          >
            <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">New</span>
            <span className="text-sm font-medium text-white/90">Introducing next-generation temporal trajectory analysis.</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-4px] mb-8 max-w-4xl mx-auto">
            <BlurText text="Clinical Intelligence Reimagined" delay={0.2} />
          </h1>

          <motion.p 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="text-white/60 font-light text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Continuous multi-modal monitoring. Predictive trajectory forecasts. Built to amplify clinical intuition, not replace it.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="liquid-glass-strong rounded-full px-8 py-4 text-white font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              Get Started <ArrowUpRight className="w-5 h-5" />
            </button>
            <button className="rounded-full px-8 py-4 text-white/80 font-medium flex items-center gap-2 hover:text-white transition-colors group">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
              </span>
              Watch the Film
            </button>
          </motion.div>
        </div>

        {/* SECTION 3 — PARTNERS BAR */}
        <div className="relative z-10 mt-auto pb-12 pt-16 w-full flex flex-col items-center opacity-80">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white/70 mb-8 tracking-wide uppercase">
            Validated by leading medical institutions
          </div>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 opacity-60">
            {['Mayo Clinic', 'Johns Hopkins', 'Cleveland Clinic', 'Mass General', 'Stanford Health'].map((partner, i) => (
              <span key={i} className="text-2xl md:text-3xl font-heading italic text-white tracking-tight">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — START SECTION ("How It Works") */}
      <section className="relative w-full min-h-[700px] py-32 px-6 md:px-16 lg:px-24 flex items-center justify-center overflow-hidden">
        {/* HLS Video Background */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-10" />
          <HLSVideo src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-10" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center min-h-[400px] justify-center">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            Predictive Engine
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] mb-6">
            You monitor. We predict.
          </h2>
          <p className="text-white/60 font-light text-base md:text-lg max-w-2xl mx-auto mb-10">
            Focus on your patient. Our AI analyzes thousands of temporal data points per minute—detecting subtle clinical decompensation hours before it happens.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="liquid-glass-strong rounded-full px-6 py-3 text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform"
          >
            Launch Dashboard <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 5 — FEATURES CHESS */}
      <section className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            Pro features. Zero complexity.
          </h2>
        </div>

        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
          <div className="lg:w-1/2">
            <h3 className="text-3xl font-heading italic text-white mb-6 leading-tight">Designed for clinicians.<br />Built for outcomes.</h3>
            <p className="text-white/60 font-light text-base leading-relaxed mb-8">
              Every alert is intentional. VitalAI studies personal baselines instead of population averages—drastically reducing alarm fatigue and prioritizing actionable insights.
            </p>
            <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-medium text-sm hover:bg-white/5 transition-colors">
              Explore our models
            </button>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-24 h-24 rounded-full border border-white/20 animate-[spin_4s_linear_infinite] border-t-cyan-400" />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2">
            <h3 className="text-3xl font-heading italic text-white mb-6 leading-tight">It learns the patient.<br />Automatically.</h3>
            <p className="text-white/60 font-light text-base leading-relaxed mb-8">
              The system adapts to individual physiologies over time. AI monitors every subtle shift in heart rate variability and SpO2—optimizing anomaly thresholds in real time.
            </p>
            <button className="bg-transparent border border-white/30 rounded-full px-6 py-3 text-white font-medium text-sm hover:bg-white/10 transition-colors">
              View the clinical trial
            </button>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-24 h-24 rounded-full border border-white/20 flex flex-col items-center justify-center gap-1">
                <div className="flex items-end gap-1 h-8">
                  <div className="w-1.5 h-3 bg-white/50 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  <div className="w-1.5 h-5 bg-white/70 animate-[pulse_1.2s_ease-in-out_infinite_0.2s]" />
                  <div className="w-1.5 h-8 bg-white/90 animate-[pulse_1s_ease-in-out_infinite_0.4s]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURES GRID */}
      <section className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            Why Us
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            The difference is everything.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Zap className="w-5 h-5 text-cyan-400" />, title: "Hours, Not Minutes", desc: "Predictive warnings arrive up to 4.5 hours before clinical decompensation." },
            { icon: <Palette className="w-5 h-5 text-emerald-400" />, title: "Clinically Validated", desc: "Tested across diverse cohorts to ensure zero bias in SpO2 readings." },
            { icon: <BarChart3 className="w-5 h-5 text-amber-400" />, title: "Built to Save Lives", desc: "Differential diagnosis probabilities informed by real-time labs." },
            { icon: <Shield className="w-5 h-5 text-violet-400" />, title: "HIPAA Compliant", desc: "Enterprise-grade encryption and access controls come standard." }
          ].map((feature, i) => (
            <div key={i} className="liquid-glass rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center mb-5 text-white">
                {feature.icon}
              </div>
              <h3 className="text-lg font-heading italic text-white mb-2">{feature.title}</h3>
              <p className="text-white/60 font-body font-light text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — STATS */}
      <section className="relative w-full py-32 px-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-10" />
          <HLSVideo 
            src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8" 
            style={{ filter: 'saturate(0)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-10" />
        </div>

        <div className="relative z-10 max-w-5xl w-full">
          <div className="liquid-glass rounded-3xl p-12 md:p-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { val: "2M+", label: "Patient Hours" },
              { val: "94%", label: "Prediction Accuracy" },
              { val: "4.5h", label: "Advance Warning" },
              { val: "-45%", label: "False Alarms" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white mb-2 tracking-tight">{stat.val}</div>
                <div className="text-white/60 font-light text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — TESTIMONIALS */}
      <section className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            What They Say
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            Don't take our word for it.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "VitalAI caught a subtle sepsis trajectory 4 hours before the patient's lactate levels spiked. It completely changed our intervention strategy.", name: "Dr. Sarah Chen", role: "Chief of Critical Care" },
            { quote: "The reduction in alarm fatigue is staggering. Nurses aren't silencing monitors anymore because when VitalAI alerts, it actually means something.", name: "Marcus Webb", role: "Director of Nursing" },
            { quote: "The caregiver view has transformed how we communicate with families. Seeing a 'Stability Score' gives them immense peace of mind.", name: "Elena Voss", role: "Patient Experience Director" }
          ].map((test, i) => (
            <div key={i} className="liquid-glass rounded-2xl p-8 flex flex-col justify-between">
              <p className="text-white/80 font-light text-sm leading-relaxed italic mb-8">"{test.quote}"</p>
              <div>
                <div className="text-white font-medium text-sm">{test.name}</div>
                <div className="text-white/50 font-light text-xs mt-0.5">{test.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9 — CTA FOOTER */}
      <section className="relative w-full overflow-hidden pt-32 pb-12 flex flex-col items-center justify-center text-center mt-12 border-t border-white/5">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-10" />
          <HLSVideo src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-10" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 mb-32 flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-[0.9] mb-8">
            The future of care starts here.
          </h2>
          <p className="text-white/60 font-light text-lg mb-12">
            Schedule a clinical demonstration. See how predictive AI saves lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="liquid-glass-strong rounded-full px-8 py-4 text-white font-medium hover:bg-white/10 transition-colors">
              Schedule Demo
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white text-black rounded-full px-8 py-4 font-medium hover:scale-105 transition-transform"
            >
              Enter Dashboard
            </button>
          </div>
        </div>

        <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/40 text-xs gap-4">
          <div>© 2026 VitalAI Medical Systems. All rights reserved. FDA Cleared Class II.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
