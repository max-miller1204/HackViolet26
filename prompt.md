# SafeNight — A Women-First Safety & Social Companion

## Problem Statement
College women often face safety risks when going out at night — from unsafe transportation decisions to lack of real-time support if something goes wrong. Existing safety apps are reactive, impersonal, or lack community. SafeNight is a proactive, women-only mobile app that blends AI, voice, real-time data, and decentralized logging to help users go out safely, stay informed, and feel supported.

---

## Target Audience
- College students (women-only)
- Ages 18–26
- Urban and campus-adjacent nightlife environments
- iOS and Android users

---

## Core App Concept
NightSafe helps users:
1. Plan their night out
2. Track drinks and safety signals
3. Receive proactive safety nudges
4. Access SOS features discreetly
5. Connect with trusted women nearby

---

## Key Features
*Use Context7 when connecting/creating with any external libraries/api*
*For any front-end design use the /frontend-design plugin*

### 1. Night Plan & Safety Timeline
Users can log plans such as:
- “Going out at 10:00 PM”
- “Home by 1:00 AM”

The app generates a safety timeline, triggering:
- Reminder notifications (e.g., “Start heading home in 30 minutes”)
- Ride suggestion prompts
- Friend check-in requests (if enabled)

**Tech**
- Gemini API → natural language parsing of plans
- Snowflake → event storage and timeline analytics

---

### 2. Voice & Text-Based Drink Tracking
Users can log drinks via:
- Text input
- Voice input (e.g., “I had an espresso martini”)

The system estimates:
- Approximate BAC (clearly labeled as non-medical)
- Suggested drink pacing
- Time-to-sobriety estimates

**Tech**
- ElevenLabs → voice-to-text and audio feedback
- Gemini API → drink interpretation and BAC estimation logic
- Snowflake → personal drink history and trends

---

### 3. AI Safety Assistant
An in-app AI assistant that can:
- Recommend nearby bars
- Suggest safer venues based on crowd level and time
- Answer questions like:
  - “What bars are chill right now?”
  - “Is this area safe after midnight?”

**Tech**
- Gemini API → conversational intelligence and real-time search
- Vultr → geo-based queries and venue data caching
- LineLeap integration → cover prices and wait times

---

### 4. Interactive Nightlife Map
A real-time map showing:
- Nearby bars and venues
- Crowd density indicators
- Friend presence (opt-in only)

**Tech**
- Vultr → fast geo-spatial queries and map backend
- Snowflake → anonymized analytics and venue trends

---

### 5. SOS & Emergency Mode
Users can trigger SOS via:
- Button press
- Custom voice code word

When activated:
- Trusted contacts are notified
- Location is shared
- Event is immutably logged

**Tech**
- ElevenLabs → voice recognition trigger
- Solana → on-chain logging of SOS events (timestamp and hash)
- Gemini API → context summarization for responders

Blockchain is used only for event integrity, not personal data storage.

---

### 6. Women-Only Social & Help Board
A secure, women-only space to:
- Ask for a ride
- Find friends nearby
- Discover events or plans

Users create lightweight profiles with:
- Interests
- Campus or area
- Night-out preferences

**Tech**
- Snowflake → user profiles and matching logic
- Gemini API → interest-based friend suggestions
- Vultr → real-time local discovery

---

### 7. Smart Check-Ins & Escalation
If a user:
- Misses a planned check-in
- Logs excessive drinks
- Ignores multiple notifications

The app can:
- Prompt a safety confirmation
- Alert nearby trusted friends
- Escalate to SOS mode (opt-in only)

**Tech**
- Gemini API → risk scoring and decision logic
- Snowflake → behavioral patterns
- Solana → escalation event logging

---

## Tech Stack & Framework Integration

### Gemini API
- Natural language understanding
- Drink parsing and BAC estimation
- AI assistant and safety reasoning
- Real-time search queries

### ElevenLabs
- Voice-to-text drink logging
- Audio-based AI responses
- SOS voice code detection

### Solana
- Immutable logging of:
  - SOS activations
  - Safety escalations
- Ensures transparency and tamper resistance

### Vultr
- Backend hosting
- Geo-spatial queries for maps and venues
- Low-latency nightlife data

### Snowflake
- User profiles and preferences
- Drink history and analytics
- Risk modeling and trend analysis
- AI-powered querying via REST API

---

## Privacy & Safety Principles
- Women-only access
- All social features are opt-in
- Location sharing is temporary and consent-based
- Blockchain stores hashed events only
- No medical claims — estimates are informational

---

## Hackathon MVP Scope
**Included**
- Night planning
- Voice drink logging
- BAC estimation
- Safety notifications
- SOS demo flow
- Map with nearby venues
- LineLeap integration
- Friend matching AI

---

## Vision
NightSafe is a confidence companion.  
By combining AI, voice, decentralized trust, and women-first design, the app helps users enjoy their nights while knowing support is always available.

Built for women. Designed for safety. Powered by AI.
