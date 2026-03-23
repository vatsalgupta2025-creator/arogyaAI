# AAROGYA AI - Required API Keys & External Services

This document lists all API keys and external services needed to build a complete, production-ready healthcare monitoring system based on the hackathon blueprint.

---

## Current Project Status

### What's Already Built:
- ✅ React frontend with dashboard (vitals, sepsis, trajectory, equity audit)
- ✅ Python ML models (trajectory, sepsis, anomaly, bias detection, HRV)
- ✅ Flask API server for ML inference
- ✅ Role-based views (patient, caregiver, physician)
- ✅ Personalized baselining system

### What's Missing (Based on Blueprint):
- LLM integration for medical report parsing
- Voice stress analysis
- Real-time data streaming
- FHIR/EHR integration
- On-device inference (TensorFlow.js)

---

## Required API Keys & Services

### 1. LLM/AI Services

| Service | Purpose | Free Tier | Cost | Link |
|---------|---------|-----------|------|------|
| **OpenAI API** | Medical report parsing, differential diagnosis generation | $18 credit | Pay-per-use | https://platform.openai.com |
| **Anthropic Claude** | Report analysis (alternative to OpenAI) | $25 credit | Pay-per-use | https://www.anthropic.com |
| **Groq API** | Fast inference for real-time queries | 1000 requests/mo | Free + Paid | https://console.groq.com |
| **Ollama (Local)** | Run LLaMA 3.2 locally - NO API key needed | Free | Free | https://ollama.com |

**Recommendation for Hackathon:**
```bash
# For medical report parsing, use Groq (fastest free option)
# Sign up at https://console.groq.com
# Get free API key - no credit card needed
```

---

### 2. Healthcare Data APIs

| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **PhysioNet** | MIMIC-IV dataset access (free with DUA) | Free | https://physionet.org |
| **HL7 FHIR** | EHR integration standard | Free | https://www.hl7.org/fhir |
| **1mg API** | Indian drug/medicine database | Contact for access | https://www.1mg.com |

**For Dataset Access:**
```bash
# PhysioNet - Free registration required
# 1. Register at https://physionet.org/register/
# 2. Request access to MIMIC-IV (takes 1-2 days)
# 3. Download via wfdb Python package
```

---

### 3. External Data Services

| Service | Purpose | Free Tier | Cost | Link |
|---------|---------|-----------|------|------|
| **OpenWeatherMap** | Environmental data (AQI, temperature) | 1000 calls/day | Free | https://openweathermap.org/api |
| **Ambee** | India-specific air quality data | 1000 calls/mo | Free | https://www.getambee.com |
| **WeatherAPI** | Weather data for context | 1M calls/mo | Free | https://www.weatherapi.com |

---

### 4. Frontend/Deployment Services

| Service | Purpose | Free Tier | Cost | Link |
|---------|---------|-----------|------|------|
| **Vercel** | Frontend hosting | 100GB bandwidth | Free | https://vercel.com |
| **Railway** | Python backend hosting | $5 credit/mo | Free | https://railway.app |
| **Render** | Backend API hosting | 750 hours/mo | Free | https://render.com |
| **Cloudflare** | CDN, security | Unlimited | Free | https://cloudflare.com |

---

### 5. Database Services

| Service | Purpose | Free Tier | Cost | Link |
|---------|---------|-----------|------|------|
| **Supabase** | PostgreSQL + Auth | 500MB storage | Free | https://supabase.com |
| **Redis Cloud** | Caching for baselines | 30MB | Free | https://redis.com/cloud |
| **Timescale Cloud** | Time-series DB | 30-day trial | Paid | https://timescale.com |

---

### 6. Communication APIs (Optional)

| Service | Purpose | Free Tier | Cost | Link |
|---------|---------|-----------|------|------|
| **Twilio** | SMS alerts to caregivers | $15 credit | Pay-per-use | https://twilio.com |
| **WhatsApp Business API** | Critical alerts | 1000 messages | Paid | https://business.whatsapp.com |
| **Exotel** | India SMS/voice (cheaper) | ₹500 credit | ₹0.30/sms | https://exotel.com |

---

## API Keys Already Used (No Configuration Needed)

The current project uses these free/open resources:

| Resource | URL/Source | Status |
|----------|------------|--------|
| Google Fonts | fonts.googleapis.com | ✅ Works |
| Lucide Icons | lucide.dev | ✅ Included in package.json |
| Recharts | recharts.org | ✅ Included in package.json |
| Framer Motion | framer.com/motion | ✅ Included in package.json |
| Background Video | d8j0ntlcm91z4.cloudfront.net | ✅ Works (hardcoded URL) |

---

## Environment Variables Needed

Create a `.env` file in your project root:

```env
# Backend API Keys (Flask)
FLASK_ENV=development
PORT=5000

# LLM APIs (Choose one)
GROQ_API_KEY=your_groq_key_here
# OR
OPENAI_API_KEY=your_openai_key_here

# External Data (Optional)
OPENWEATHERMAP_API_KEY=your_key_here
AMBEE_API_KEY=your_key_here

# Database (Optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Alert Services (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Quick Start - Get These First

### Priority 1 (Essential for Demo):
1. **Groq API Key** - https://console.groq.com (instant, free)
   - Use for: Medical report parsing, differential diagnosis
   
2. **PhysioNet Access** - https://physionet.org (1-2 days)
   - Use for: Training data (MIMIC-IV)

### Priority 2 (Makes it Complete):
3. **OpenWeatherMap** - https://openweathermap.org/api (instant)
   - Use for: Environmental context (AQI, temperature)

4. **Vercel Account** - https://vercel.com (instant)
   - Use for: Deploy frontend

### Priority 3 (Production Ready):
5. **Railway/Render** - https://railway.app or https://render.com
   - Use for: Deploy Python backend

---

## Getting Groq API Key (Recommended First)

1. Go to https://console.groq.com
2. Click "Create API Key"
3. Name it "AAROGYA AI Hackathon"
4. Copy the key (starts with `gsk_`)
5. Add to your `.env` file:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Why Groq?**
- Fastest inference (important for real-time demo)
- 1000 free requests/month (enough for hackathon)
- No credit card required
- Works great for LLaMA models

---

## Adding LLM to Medical Report Parsing

Update `src/ml_models/server.py` to add LLM-powered parsing:

```python
from groq import Groq

client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

def parse_medical_report_with_llm(report_text):
    response = client.chat.completions.create(
        model="llama-3.2-7b-versatile",
        messages=[{
            "role": "system",
            "content": "You are a medical report parser. Extract: diagnoses, medications, lab values, vital history. Return as JSON."
        }, {
            "role": "user",
            "content": report_text
        }],
        temperature=0.1
    )
    return response.choices[0].message.content
```

---

## Summary Checklist

| Item | Where to Get | Time Needed | Cost |
|------|---------------|-------------|------|
| Groq API Key | console.groq.com | 2 min | Free |
| PhysioNet Access | physionet.org | 1-2 days | Free |
| OpenWeatherMap | openweathermap.org | 2 min | Free |
| Vercel Account | vercel.com | 3 min | Free |
| Railway Account | railway.app | 5 min | Free |
| Twilio (optional) | twilio.com | 10 min | $15 credit |

---

*Document for AAROGYA AI Hackathon Preparation*