⚡ HWX GATEWAY

<p align="center">
  <strong>THE ANDROID SMS GATEWAY PLATFORM</strong>
  <br/>
  Connect. Send. Manage.
</p><p align="center">
  <a href="https://github.com/hwxlab/Hwx-getway">
    <img src="https://img.shields.io/badge/HWX-Gateway-00D4FF?style=for-the-badge&logo=android&logoColor=white" alt="HWX Gateway"/>
  </a>
  <a href="https://github.com/hwxlab/Hwx-getway">
    <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Web-7C3AED?style=for-the-badge" alt="Platform"/>
  </a>
  <a href="https://github.com/hwxlab/Hwx-getway">
    <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  </a>
  <a href="https://github.com/hwxlab/Hwx-getway">
    <img src="https://img.shields.io/badge/Status-Open%20Source-22C55E?style=for-the-badge" alt="Open Source"/>
  </a>
</p><p align="center">
  <b>A modern Android SMS Gateway with API integration, device management, SIM selection and a powerful web dashboard.</b>
</p><p align="center">
  <a href="https://github.com/hwxlab/Hwx-getway">Repository</a> •
  <a href="https://github.com/hwxlab/Hwx-getway/issues">Report Issue</a> •
  <a href="https://www.instagram.com/hwxlab/">Instagram</a>
</p>---

◈ INTRODUCTION

HWX Gateway is a developer-focused Android SMS Gateway platform designed to connect Android devices with a web dashboard and API-based SMS management system.

It provides a structured approach to managing connected devices, selecting SIM cards, processing SMS requests and monitoring activity through a centralized interface.

Built for developers who want to explore Android-based SMS integration and create their own communication workflows.

✨ FEATURES

Feature| Description
📱 Device Management| Manage connected Android devices
🔗 Device Pairing| QR code and pairing-code workflow
💳 SIM Selection| Choose the preferred SIM slot
⚡ SMS API| API-based SMS requests
📊 Dashboard| Centralized device and SMS management
🔥 Firebase| Firebase integration
📋 SMS Logs| Monitor SMS request activity
🔐 API Security| Authenticated API access
📦 Queue System| Organized SMS job processing

<sub>Actual feature availability depends on the implementation and configuration in the source code.</sub>

---

◈ HOW IT WORKS

The following diagram illustrates the intended HWX Gateway workflow.

flowchart TD
    A["🌐 WEB DASHBOARD"] --> B["➕ ADD DEVICE"]
    B --> C["🔑 QR / PAIRING CODE"]
    C --> D["📱 ANDROID APP"]
    D --> E["🔐 GRANT PERMISSIONS"]
    E --> F["☁️ FIREBASE BACKEND"]
    F --> G["📡 DEVICE CONNECTED"]
    G --> H["⚡ SMS API REQUEST"]
    H --> I["📦 QUEUE PROCESSING"]
    I --> J["📨 SMS RESULT"]
    J --> K["📋 DASHBOARD LOGS"]

◈ SYSTEM ARCHITECTURE

flowchart LR
    DEV["Developer / API Client"]
    WEB["Web Dashboard"]
    API["Backend API"]
    DB[("Firebase / Firestore")]
    QUEUE["SMS Queue"]
    AND["Android Device"]
    SIM["SIM Card"]

    DEV --> API
    WEB --> API
    API <--> DB
    API --> QUEUE
    QUEUE --> AND
    AND --> SIM

◈ TECHNOLOGY STACK

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android"/>
  <img src="https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white" alt="Bun"/>
</p>Technology| Purpose
React| Frontend interface
TypeScript| Application development
Vite| Frontend tooling
Node.js| Backend runtime
Express| API framework
Firebase| Backend services
Firestore| Database
Firebase Admin| Server-side Firebase access
Android| SMS gateway device

---

◈ PROJECT STRUCTURE

Hwx-getway/
│
├── api/
│
├── server/
│   ├── middleware/
│   ├── routes/
│   ├── firebaseAdmin.ts
│   └── queue.ts
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── App.tsx
│
├── firestore.rules
├── firestore.indexes.json
├── firebase-blueprint.json
├── .env.example
├── package.json
├── server.ts
│
├── ANDROID_GATEWAY_APP_PROMPT.md
├── PRODUCTION_GUIDE.md
├── VERCEL_DEPLOYMENT_GUIDE.md
│
└── README.md

◈ INSTALLATION

01 — Clone Repository

git clone https://github.com/hwxlab/Hwx-getway.git
cd Hwx-getway

02 — Install Dependencies

Using Bun:

bun install

Or using npm:

npm install

03 — Configure Environment

Create your local ".env" file using ".env.example".

Configure your own Firebase project credentials.

04 — Firebase Configuration

1. Create a Firebase project.
2. Enable the required Firebase services.
3. Register your Web App.
4. Configure Firebase Authentication and Firestore.
5. Configure Firebase Admin credentials on the server.
6. Review Firestore security rules.

Security: Never upload your Firebase Admin service-account JSON or private environment variables to GitHub.

05 — Run Development Server

npm run dev

Check "package.json" for the exact available scripts.

---

◈ API INTEGRATION

HWX Gateway is designed to support API-based SMS integration.

Example request format:

curl -X POST "YOUR_API_BASE_URL/v1/sms/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "sim_slot": 1,
    "to": "+1234567890",
    "message": "Hello from HWX Gateway!"
  }'

Important: This is an illustrative request. Confirm the actual request schema and authentication requirements from the backend source before using it.

---

◈ DEPLOYMENT

The repository includes a Vercel deployment guide.

Before deployment:

- Configure environment variables.
- Connect your own Firebase project.
- Configure backend credentials securely.
- Review server runtime compatibility.
- Verify API endpoints.
- Test using an authorized Android device.

See:

- "VERCEL_DEPLOYMENT_GUIDE.md"
- "PRODUCTION_GUIDE.md"

---

◈ SECURITY & RESPONSIBLE USE

Security is important when building communication infrastructure.

- Keep API keys private.
- Never commit ".env" files.
- Never publish service-account credentials.
- Configure Firestore security rules.
- Protect connected devices.
- Send messages only to authorized recipients.
- Follow applicable telecom regulations and carrier policies.

For security concerns, use the repository's Issues section without publishing private credentials or tokens.

---

◈ CONTRIBUTIONS

Want to improve HWX Gateway?

Contributions, bug reports and suggestions are welcome.

1. Fork this repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request.

Repository Issues:

https://github.com/hwxlab/Hwx-getway/issues

---

◈ CONNECT WITH HWX LAB

<p align="center">
  <strong>TECHNOLOGY • DEVELOPMENT • INNOVATION</strong>
</p><p align="center">
  Follow HWX Lab for technology projects, development tutorials, updates and new releases.
</p><p align="center">
  <a href="https://www.instagram.com/hwxlab/">
    <img src="https://img.shields.io/badge/FOLLOW%20ON%20INSTAGRAM-@hwxlab-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Follow HWX Lab on Instagram"/>
  </a>
</p><p align="center">
  <a href="https://github.com/hwxlab">
    <img src="https://img.shields.io/badge/GitHub-HWX%20Lab-181717?style=for-the-badge&logo=github" alt="HWX Lab GitHub"/>
  </a>
</p>---

<p align="center">
  <strong>⚡ HWX GATEWAY</strong>
  <br/>
  Build Smarter. Grow Together.
  <br/><br/>
  Made with ❤️ by <a href="https://github.com/hwxlab"><strong>HWX Lab</strong></a>
</p><p align="center">
  <sub>© HWX Lab. All rights reserved.</sub>
</p>
