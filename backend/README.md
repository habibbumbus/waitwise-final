# un-hackathon
un-hackathon
🧾 Product Requirements Document (PRD) – WaitWise Health
1. 🧠 Overview

Goal:
Reduce public healthcare wait times by streamlining clinic queues, enabling smart triaging, and dynamically reassigning cancelled appointments to waiting patients through automated notifications.

Core Idea:
Patients use WaitWise to:

Find and book walk-in or clinic appointments near them

Input quick triage symptoms for urgency tagging

Receive live queue updates + SMS notifications for cancellations and readiness

Receive post-visit digital assessment summaries and prescriptions (mocked for demo)

Key Outcome:
Eliminate idle wait time and improve clinic throughput using a digital-first, patient-centric queueing system.

2. 🎯 Target Users
User Type	Description	Needs
Patients	General public seeking clinic appointments	Easy booking, queue transparency, SMS updates
Clinics / Healthcare Providers	Facilities handling patient flow	Reduced no-shows, improved efficiency
System Admins	Oversee platform data integrity	CRUD control, analytics access (future scope)
3. 💡 Core Features (MVP Scope)

Here’s what you can and should build in 7 hours — not the future vision, just MVP.

3.1 User Features
Feature	Description	Implementation
1. Location & Clinic Discovery	User grants location permission → app shows nearby clinics with estimated wait times	Use Google Maps API or static mock JSON of clinic names, coords, wait times
2. Account Creation / Login	User enters: name, email, phone, ID type (Healthcard/Gov ID)	Basic signup form; no need for real auth (store in localstorage or mock backend table)
3. Symptom Input (Triage)	Simple text box with symptom dropdowns or quick questions	Rule-based triage (low/moderate/high urgency) using backend logic
4. Booking & Queue System	Reserve a clinic slot; system stores user’s position	Backend maintains list of queues per clinic (FIFO model)
5. Dynamic Cancellation Offer System	If a user cancels, next users get SMS notification to move up	Backend triggers Twilio API (or mock SMS) sequentially with 5-min response windows
6. Notifications	SMS for booking, readiness, or cancellations	Twilio or simple console simulation
7. Post-Clinic Report	Mock email sent with visit summary + PDF prescription	Flask generates PDF (reportlab) and sends mock email
4. ⚙️ Backend Architecture (FastAPI / Flask)
Tech Stack:

Language: Python

Framework: FastAPI (cleaner async support)

Database: SQLite (for hackathon simplicity)

External APIs:

Twilio (SMS)

Google Maps (Geolocation & Clinics)

SendGrid / SMTP (email simulation)

Core Backend Components:
users Table
Field	Type	Description
id	INT	PK
name	TEXT	User full name
email	TEXT	Contact
phone	TEXT	For SMS
id_type	TEXT	“Healthcard” or “GovID”
urgency_level	TEXT	low / medium / high
clinics Table
Field	Type	Description
id	INT	PK
name	TEXT	Clinic name
address	TEXT	Clinic location
current_wait	INT	Wait time in mins
capacity	INT	Number of active patients
queue	JSON	List of user IDs
appointments Table
Field	Type	Description
id	INT	PK
user_id	INT	FK
clinic_id	INT	FK
status	TEXT	"queued", "notified", "confirmed", "cancelled", "completed"
position	INT	Queue position
created_at	DATETIME	Booking timestamp
Endpoints
Endpoint	Method	Purpose
/register	POST	Create user
/clinics/nearby	GET	Return clinics near given location
/book	POST	Reserve spot in queue
/cancel	POST	Cancel booking → triggers offer chain
/notify-next	POST	Internal function to notify next patient
/triage	POST	Classify symptom urgency
/report	POST	Generate post-visit PDF summary
Example logic for /cancel:
def cancel_appointment(appointment_id):
    appointment = db.get(appointment_id)
    clinic_queue = get_clinic_queue(appointment.clinic_id)
    # remove from queue
    clinic_queue.remove(appointment.user_id)
    # offer slot to next users in order
    for next_user in clinic_queue:
        send_sms(next_user.phone, "Slot available. Confirm in 5 min.")
        wait_for_response(next_user, timeout=300)
        if next_user.confirmed:
            move_user_up(next_user)
            break

5. 💻 Frontend Architecture (React / TailwindCSS)
Tech Stack:

React for components

TailwindCSS for quick styling

Axios for API calls

Map Integration: Google Maps Embed API or Leaflet.js

Page Flow
Page	Components	Functionality
Landing Page	Hero section + Login/Register	Intro + user signup
Dashboard	Clinic cards + map	Show nearby clinics, wait times
Symptom Input	Dropdown or chatbot UI	Input for triage
Booking Page	Confirm slot	Booking confirmation + SMS mock
Queue Page	Display position, ETA	Live updates
Notification Simulation	Popup	Shows “Clinic ready for you” alert
Post Visit Page	PDF download	Displays generated assessment PDF
6. 🧩 Data Flow
User Input → Triage (backend) → Assign urgency
→ Select clinic → Add to queue
→ If cancel → Notify next (loop)
→ Confirm booking → SMS + Email
→ Visit complete → Send PDF summary

7. 📦 Demo Setup (Hackathon-Friendly)

You don’t need real infrastructure. Use mock services smartly:

SMS → Just console.log("SMS sent to +1XXX")

Email → Simulate with print statement

Data → Static JSON for clinics

Queue → Simple list data structure in memory

PDF → Generated from hardcoded “doctor summary” text

8. 🎥 Pitch Video Outline (1–3 min)

Hook:
“In Canada, patients wait hours — sometimes days — for simple care. But what if the system could automatically optimize itself?”

Problem:
“Long wait times and poor coordination cause massive inefficiencies.”

Demo Flow:

User enters symptoms → gets triage classification

Chooses nearby clinic → reserves spot

Patient cancels → next in queue notified live

Clinic ready → patient receives SMS

Post-visit email + prescription demo

Impact:
“If scaled, WaitWise could cut average wait times by 30% using smart queue reallocation and patient-driven coordination.”

Closing:
“Built in 7 hours, but designed for a healthcare system that can’t wait.”

9. 🚀 Stretch Goals (if time allows)

Real SMS via Twilio

Auth with Firebase

Dashboard for clinics to manage queues

Analytics dashboard (avg wait, cancellations saved)

10. 🧱 Recommended Role Split (3–4 ppl)
Role	Responsibilities
Frontend Dev	Build React UI (pages, routing, forms)
Backend Dev	Flask/FastAPI API endpoints + queue logic
Data/API Integrator	Google Maps integration, mock data setup
Pitch/Design	Record demo, design logo, make 1–3 min video


<pre> ```text<                       ┌───────────────────────────────────────────┐
                       │              FRONTEND (React)             │
                       │───────────────────────────────────────────│
                       │ - Login / Register Page                   │
                       │ - Map + Clinic Search Page                │
                       │ - Symptom Input / Triage Chatbot UI       │
                       │ - Queue Dashboard (Live ETA)              │
                       │ - Notifications & Alerts                  │
                       │ - Post-Visit Summary (PDF Link)           │
                       └───────────────┬───────────────────────────┘
                                       │
                              (Axios REST API Calls)
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI / Flask Server)                    │
│────────────────────────────────────────────────────────────────────────│
│  Endpoints:                                                            │
│   • /register       → Create new user                                  │
│   • /clinics/nearby → Get nearby clinics + estimated wait times        │
│   • /triage         → Classify symptom urgency (rule-based AI)         │
│   • /book           → Add user to clinic queue                         │
│   • /cancel         → Cancel booking + trigger offer chain             │
│   • /notify-next    → Notify next patient via SMS/email (mock)         │
│   • /report         → Generate post-visit summary (PDF)                │
│                                                                        │
│  Services:                                                             │
│   • Notification Manager (Twilio mock / console logs)                  │
│   • Queue Manager (FIFO & Offer Logic)                                 │
│   • PDF Generator (ReportLab or fpdf)                                  │
│   • Location/Clinic Data Manager (Google Maps API / mock JSON)         │
└───────────────┬────────────────────────────────────────────────────────┘
                │
         (Database ORM - SQLAlchemy)
                │
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (SQLite for MVP)                       │
│────────────────────────────────────────────────────────────────────────│
│  Tables:                                                               │
│   • Users:        id, name, contact, id_type, urgency_level            │
│   • Clinics:      id, name, location, current_wait, queue JSON         │
│   • Appointments: id, user_id, clinic_id, status, position             │
└────────────────────────────────────────────────────────────────────────┘

Optional Integrations:
  • Twilio API         → SMS notifications
  • SendGrid / SMTP    → Email confirmations
  • Google Maps API    → Geolocation + clinic mapping
    > ``` </pre>
