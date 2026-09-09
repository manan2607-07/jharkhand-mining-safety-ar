# AR-Based Vocational Training & Safety Certification Simulator
### For Jharkhand's Mining, Steel & Mica Processing Workforce
**Smart India Hackathon 2026 | Problem Statement ID: 26041**  
**Organization:** Government of Jharkhand  
**Department:** Dept. of Higher & Technical Education  
**Regulatory Statutory Framework:** Mines Act, 1952 • Factories Act, 1948 • DGMS Dhanbad Circulars  

---

## Executive Summary
Safety training in Jharkhand's mining corridors (Dhanbad, Bokaro, Ramgarh, Koderma, Giridih) faces critical hurdles:
- **48 fatal mine accidents** recorded by DGMS Dhanbad in 2022–23.
- **<20% retention** from static manual classroom lectures.
- **30 days or less orientation** for a large share of workers involved in fatal incidents.
- Zero existing digital platforms supporting native tribal languages like **Santali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)** with offline field resilience.

This platform delivers camera-first, phone-based AR safety drills, on-device competency assessments, tamper-evident cryptographic QR certifications, and live compliance visibility for mine owners, site safety officers, DGMS inspectors, and state nodal officers.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│             FRONTLINE WORKER (MOBILE ANDROID / WEBAR PWA)              │
│                                                                        │
│  [ Camera Feed & Three.js 3D Viewport ]                                │
│       ├── Module 1: Fire & Explosion (PASS Extinguisher Technique)    │
│       └── Module 2: Gas Leak & Confined Space (CH4, CO, PPE Donning)  │
│                                                                        │
│  [ On-Device Assessment Engine ] ──> [ SHA-256 HMAC QR Cert Generator ]│
│                                                    │                   │
│  [ Multilingual Voice Narration ]                  ▼                   │
│     (English / हिन्दी / ᱚᱞ ᱪᱤᱠᱤ)         [ IndexedDB Offline Store ]   │
└────────────────────────────────────────────────────┬───────────────────┘
                                                     │
                                 Opportunistic Sync  │ (Auto-flushes on reconnect)
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CLOUD BACKEND (Node.js + Express + GraphQL)              │
│                                                                        │
│   ├── JWT Auth & Role-Based Access Control (4 Personas)                │
│   ├── Worker & Cohort Registry (Coal / Steel / Mica sites)             │
│   ├── Tamper-Evident Certificate Verification Service                  │
│   ├── Opportunistic Sync Engine (/api/sync)                            │
│   ├── DGMS Compliance Analytics Engine                                 │
│   └── SQLite / PostgreSQL Database (Built-in High-Concurrency Engine)  │
└───────────────────────┬──────────────────────────────────┬─────────────┘
                        │                                  │
                        ▼                                  ▼
┌───────────────────────────────────┐  ┌─────────────────────────────────┐
│     WEB ADMIN COMPLIANCE CONSOLE  │  │   DGMS REGULATOR VERIFICATION   │
│   (Site Officers & State Nodal)   │  │   (Dr. A.K. Sengupta, Dhanbad)  │
│                                   │  │                                 │
│  • 12,480+ Workers Trained        │  │  • Live Camera QR Scan Verifier │
│  • 86% Module 1 Pass Rate         │  │  • Cryptographic Hash Tamper Check│
│  • District Coverage Heatmaps     │  │  • Refresher Warning Radar      │
│  • Weekly Volume Analytics        │  │  • Mines Act 1952 Audit Export  │
└───────────────────────────────────┘  └─────────────────────────────────┘
```

---

## Key Features & Deliverables Checklist

### 1. Two Complete AR Modules (MVP Scope)
- **Module 1: Fire & Explosion Response**
  - Live device camera video background with WebGL 3D hazard warning overlays.
  - Emergency escape route waypoints and shaft exit indicators.
  - Step-by-step interactive **PASS Technique** simulator:
    1. **P**ull safety pin (unlocks valve)
    2. **A**im at base of fire (gyro/touch crosshair lock)
    3. **S**queeze handle lever (chemical foam discharge)
    4. **S**weep side-to-side (progressive flame smothering gauge to 100%)
  - Critical evacuation decision protocol under smoke spread.
- **Module 2: Gas Leak & Confined Space Protocol**
  - Confined coal mine seam inspection.
  - Calibrated Digital Multi-Gas Detector ($CH_4$ Methane, $CO$ Carbon Monoxide, $O_2$ Oxygen).
  - Flashing hazard alarm & acoustic siren trigger when $CH_4 > 1.25\%$ (statutory DGMS explosive threshold).
  - 3-point PPE donning sequence (Positive-pressure SCBA oxygen mask, intrinsically safe mining helmet with cap lamp, 5-point safety harness).
  - Two-Person Buddy-System radio frequency check and lifeline rope signaling protocol (2-tugs = advance, 3-tugs = emergency extraction).

### 2. Multi-Language Localisation & Audio Voiceover
- **Santali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)**: Native script support via Google Noto Sans Ol Chiki for tribal frontline workers.
- **Hindi (हिन्दी / देवनागरी)**: Full Devanagari translation for regional industrial workforce.
- **English**: Standard administrative and statutory compliance interface.
- **Speech Synthesis Voiceover Engine**: Audio prompts and step-by-step guidance spoken aloud to empower low-literacy miners.

### 3. On-Device Adaptive Assessment Engine
- Scenario-branching decision quizzes evaluating critical sequence choices rather than rote memorization.
- Automatically incorporates AR execution accuracy into final DGMS score.
- Dynamic pass/fail evaluation against the 75% DGMS competency benchmark.

### 4. Tamper-Evident QR Certification
- On-device cryptographic generation of signed certificates.
- Incorporates SHA-256 HMAC hash containing Worker ID, Site ID, Module, Score, and Statutory Issue/Expiry Dates.
- Auto-expiring validity window (365 days) mapped to Mines Act 1952 & Factories Act 1948 refresher training mandates.
- Printable official certificate card with embedded QR passport.

### 5. Offline-First Functionality & Opportunistic Sync
- Full simulation, assessment, and certificate issuance run completely without internet connection.
- Local IndexedDB store (`JharkhandSafetyOfflineDB`) caches training sessions and issued certificates.
- Automatically listens for network reconnection and flushes sync queue to `/api/sync` opportunistically.

### 6. Role-Based Stakeholder Portals
1. **Frontline Worker Portal**: Module catalog, camera AR drills, assessment, and personal QR certificate wallet.
2. **Site Safety Officer Console**: Cohort management, worker roster, bulk recruit onboarding, and training progression tracking.
3. **DGMS Dhanbad Regulator Portal**: Live QR hash verifier, tamper detection check, compliance audit log, and one-click statutory CSV export.
4. **State Nodal Officer Analytics Dashboard**:
   - High-level KPIs: 12,480 Workers Trained, 86% Pass Rate, 341 Sites Onboarded, 96% Valid Certs Today.
   - Weekly Certification Volume by District (Chart.js).
   - Tribal Language Adoption breakdown (55% Santali Ol Chiki, 35% Hindi, 6% Mundari/Ho, 4% English).
   - District & Sector Compliance Heatmap (Dhanbad, Bokaro, Ramgarh, Koderma, Giridih, East Singhbhum, Ranchi).
   - Statutory Refresher Warning Radar flagging certs expiring within 30 days.

---

## Technology Stack

| Layer | Technologies Used |
|---|---|
| **Mobile & Frontend** | React 18, Vite, Three.js (WebGL 3D AR), Chart.js, QRCode, Lucide-react, Web Speech API |
| **Styling & Theme** | Industrial High-Tech Slate (`#0a0f1d`), Safety Orange (`#ff5e14`), Emerald (`#10b981`), Cyber Cyan (`#06b6d4`), Glassmorphism |
| **Typography** | Inter, Outfit, Noto Sans Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ), JetBrains Mono |
| **Backend & APIs** | Node.js (v20+ / v22+ / v26+), Express, GraphQL (`graphql-http`), JWT, Crypto (HMAC SHA-256) |
| **Database** | Node.js Built-in SQLite (`DatabaseSync`), pre-seeded with realistic Jharkhand mining dataset |
| **DevOps & Delivery** | Docker, Docker Compose, GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`) |

---

## Quick Start & Running Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Method 1: Single-Command Concurrent Run (Recommended)

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start both Backend and Frontend concurrently:**
   ```bash
   npm run dev
   ```

- **Frontend Client:** [http://localhost:5176](http://localhost:5176)
- **Backend REST API:** [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **GraphQL Endpoint:** [http://localhost:5001/graphql](http://localhost:5001/graphql)

---

### Method 2: Docker Compose

```bash
docker-compose up --build
```

---

## Demo & Evaluation Guide

1. **Switching Stakeholder Personas:**
   - Use the navigation bar at the top to toggle between:
     - **Worker AR Trainer** (Birsa Hansda, Trainee Coal Driller)
     - **Site Safety Officer** (Rajesh Mahato, BCCL Jharia)
     - **DGMS Dhanbad Verifier** (Dr. A.K. Sengupta)
     - **State Nodal Analytics** (Priya Soren, Ranchi)

2. **Testing Multilingual Voiceover:**
   - Change language in the navbar to **ᱚᱞ ᱪᱤᱠᱤ (Santali)** or **हिन्दी (Hindi)**.
   - Click the **Voice Narration** button on any simulation step or quiz question to hear spoken audio instructions.

3. **Running AR Fire & Gas Simulations:**
   - Click **Start AR Training** on Module 1 (Fire & Explosion).
   - If prompted, allow camera permissions (or enjoy the high-fidelity 3D synthetic coal tunnel fallback).
   - Test the 4-step PASS sequence: Pull pin, click crosshair to aim, hold button to squeeze, and sweep across flames.
   - Complete the scenario quiz to receive a cryptographic QR certificate.

4. **Testing Tamper-Evident QR Verification:**
   - From the issued certificate, click **Verify in DGMS Portal**.
   - Observe the instant verification result confirming HMAC-SHA256 integrity and statutory validity window under the Mines Act, 1952.
   - Click **Test Forgery Detection** to simulate an altered/counterfeit hash and observe immediate rejection by the regulator portal.

5. **Testing Offline-First & Opportunistic Sync:**
   - In browser DevTools, switch network throttling to **Offline**.
   - Complete a training session; observe the offline indicator and pending items queued in IndexedDB.
   - Switch back to **Online**; notice the automatic opportunistic flush and confirmation toast from the cloud sync ledger.
