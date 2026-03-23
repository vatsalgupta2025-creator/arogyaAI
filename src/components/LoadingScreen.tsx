import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Calendar, FileText, MapPin, Hospital, ArrowRight, Loader2 } from 'lucide-react';
import BlurText from './BlurText';

interface UserData {
  name: string;
  age: string;
  gender: string;
  lastCheckup: string;
  reportFile: File | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  nearbyHospitals: { name: string; distance: string }[];
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyDEplvIdzD4h9ef4LRIeoRXhPoBvNbPLMk';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'loading' | 'form'>('loading');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    gender: '',
    lastCheckup: '',
    reportFile: null,
    location: '',
    latitude: null,
    longitude: null,
    nearbyHospitals: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show form after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('form');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLocationGet = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            setUserData(prev => ({
              ...prev,
              location: address,
              latitude,
              longitude
            }));

            // Find nearby hospitals
            await findNearbyHospitals(latitude, longitude);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          setUserData(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude
          }));
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        alert('Unable to get location. Please enter manually.');
        setIsLoadingLocation(false);
      }
    );
  };

  const findNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results) {
        const hospitals = data.results.slice(0, 3).map((hospital: any) => ({
          name: hospital.name,
          distance: hospital.distance ? `${Math.round(hospital.distance.text)}` : 'Nearby'
        }));

        setUserData(prev => ({
          ...prev,
          nearbyHospitals: hospitals
        }));
      }
    } catch (error) {
      console.error('Hospital search error:', error);
    }
  };

  const handleSubmit = () => {
    if (!userData.name || !userData.age || !userData.gender) {
      alert('Please fill in required fields');
      return;
    }

    // Store user data in localStorage for persistence
    localStorage.setItem('arogya_user', JSON.stringify(userData));

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUserData(prev => ({
        ...prev,
        reportFile: e.target.files![0]
      }));
    }
  };

  // Loading animation screen
  if (step === 'loading') {
    return (
      <AnimatePresence>
        <motion.div
          key="loading"
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-body"
        >
          {/* Ambient Background Effects */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="url(#goldHeartGrad)"
              className="w-20 h-20 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]"
            >
              <defs>
                <linearGradient id="goldHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </motion.div>

          <h1 className="text-7xl md:text-8xl lg:text-[8rem] font-heading italic tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] relative mb-6">
            <BlurText text="Arogya AI" delay={0.3} />
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="text-white/60 font-light text-lg md:text-xl tracking-wide"
          >
            Clinical Intelligence Reimagined
          </motion.p>

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
                transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }}
              />
            </div>
            <span className="text-amber-400/70 text-xs tracking-widest uppercase font-medium">Initializing Models</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Registration Form
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-y-auto font-body">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg mx-4 my-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="url(#goldHeartGrad2)"
              className="w-12 h-12 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
            >
              <defs>
                <linearGradient id="goldHeartGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-heading italic text-white mb-2">Welcome to Arogya AI</h2>
          <p className="text-white/60 text-sm">Let's set up your health profile</p>
        </div>

        {/* Form */}
        <div className="liquid-glass rounded-3xl p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                Age *
              </label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) => setUserData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Years"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block">Gender *</label>
              <select
                value={userData.gender}
                onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="" className="bg-slate-900">Select</option>
                <option value="male" className="bg-slate-900">Male</option>
                <option value="female" className="bg-slate-900">Female</option>
                <option value="other" className="bg-slate-900">Other</option>
              </select>
            </div>
          </div>

          {/* Last Checkup */}
          <div>
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              Last Medical Checkup
            </label>
            <input
              type="date"
              value={userData.lastCheckup}
              onChange={(e) => setUserData(prev => ({ ...prev, lastCheckup: e.target.value }))}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Medical Report Upload */}
          <div>
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              Upload Medical Report (Optional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {userData.reportFile ? (
                <p className="text-amber-400 text-sm">{userData.reportFile.name}</p>
              ) : (
                <p className="text-white/40 text-sm">Click to upload PDF or Image</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              Your Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userData.location}
                onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter address or use GPS"
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
              />
              <button
                onClick={handleLocationGet}
                disabled={isLoadingLocation}
                className="liquid-glass-strong rounded-xl px-4 py-3 text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                {isLoadingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nearby Hospitals */}
          {userData.nearbyHospitals.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Hospital className="w-4 h-4" />
                Nearby Hospitals
              </label>
              <div className="space-y-2">
                {userData.nearbyHospitals.map((hospital, index) => (
                  <div key={index} className="liquid-glass rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-white text-sm">{hospital.name}</span>
                    <span className="text-amber-400/70 text-xs">{hospital.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full liquid-glass-strong rounded-xl py-4 text-white font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Your data is secure and HIPAA compliant
        </p>
      </motion.div>
    </div>
  );
}
