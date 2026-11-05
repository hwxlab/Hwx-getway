
# ⚡ HWX Gateway

### Connect. Send. Manage.

**A Modern Android SMS Gateway Platform by HWX Lab**

[![HWX Lab](https://img.shields.io/badge/BUILT_BY-HWX_LAB-00CFFF?style=for-the-badge)](https://github.com/hwxlab)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

**Connect Android Devices. Manage SIMs. Integrate SMS Through APIs.**

[Repository](https://github.com/hwxlab/Hwx-getway) · [Issues](https://github.com/hwxlab/Hwx-getway/issues) · [Instagram](https://www.instagram.com/hwxlab/)

---

## 🚀 About HWX Gateway

**HWX Gateway** is a web-managed Android SMS Gateway platform developed by **HWX Lab**.

It combines a modern web dashboard, REST API backend, Firebase infrastructure, and an Android device integration workflow.

The platform is designed to help users:

- Manage connected Android devices.
- Pair devices using QR codes and pairing codes.
- View available SIM information.
- Send SMS through REST API requests.
- Process single and bulk SMS jobs.
- Track job status and SMS logs.
- Create and manage API keys.
- Monitor gateway usage and activity.

Our goal is to make Android SMS gateway integration simple, accessible, and developer-friendly.

## ✨ Features

### 📱 Device Management

- Device registration and pairing workflow.
- QR code and manual pairing-code support.
- Device identification and management.
- SIM information synchronization.
- Device heartbeat and connectivity tracking.

### 📨 SMS Gateway

- Single SMS API.
- Bulk SMS API.
- SIM slot selection.
- High-priority single SMS queue.
- Bulk job management.
- SMS job status tracking.
- SMS transmission logs.

### 🔐 API Management

- API key generation.
- Secure API key hashing.
- API key revocation.
- Firebase authentication.
- Request validation.
- Rate limiting.

### 📊 Dashboard

- Overview and usage statistics.
- Connected devices.
- SIM management.
- Single SMS dispatcher.
- Bulk SMS dispatcher.
- SMS jobs and logs.
- API documentation.
- API testing console.
- Account settings.
- Security and audit logs.

### 🔥 Firebase Infrastructure

- Firebase Authentication.
- Cloud Firestore.
- Firebase Admin SDK.
- Firebase Cloud Messaging integration support.
- Firestore security rules.

> Android hardware SMS transmission requires a compatible Android application, granted permissions, a supported SIM, and working device-side integration.

## 🔄 How HWX Gateway Works

```mermaid
flowchart TD
    A["🌐 Web Dashboard"]
    B["➕ Add Device"]
    C["🔗 QR / Pairing Code"]
    D["📱 Android Gateway"]
    E["🔐 Permissions"]
    F["📡 Device & SIM Sync"]
    G["🎛️ Select Device & SIM"]
    H["📨 SMS API Request"]
    I["⚙️ Backend Queue"]
    J["📲 Device SMS Processing"]
    K["📋 Result & SMS Logs"]

    A --> B --> C --> D
    D --> E --> F --> G
    G --> H --> I --> J --> K
```

This diagram describes the intended end-to-end workflow. The Android application source is maintained as a separate development phase.

## 🏗️ System Architecture

```mermaid
flowchart TB
    U["👤 User / Developer"]

    subgraph FRONTEND["Frontend"]
        W["React Dashboard"]
        P["API Documentation"]
        T["API Test Console"]
    end

    subgraph BACKEND["Backend"]
        E["Express REST API"]
        Q["SMS Priority Queue"]
        AU["Authentication"]
        DK["Device Management"]
    end

    subgraph FIREBASE["Firebase Services"]
        FA["Firebase Authentication"]
        FS[("Cloud Firestore")]
        FM["Firebase Cloud Messaging"]
    end

    subgraph DEVICE["Device Layer"]
        A["Android Gateway App"]
        S["SIM 1 / SIM 2"]
    end

    U --> W
    W --> P
    W --> T
    W <--> E
    E --> AU
    E --> DK
    E --> Q
    E <--> FA
    E <--> FS
    E --> FM
    FM --> A
    A <--> E
    A --> S
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Application development |
| Vite | Frontend tooling |
| Tailwind CSS | UI styling |
| Express.js | REST API backend |
| Node.js | Server runtime |
| Firebase Auth | Authentication |
| Cloud Firestore | Database |
| Firebase Admin | Backend Firebase access |
| Firebase Messaging | Device notifications |
| Zod | Request validation |
| QRCode | QR code generation |
| Vercel | Deployment platform |

## 📂 Project Structure

```text
Hwx-getway/
│
├── api/
│   └── index.ts
│
├── server/
│   ├── firebaseAdmin.ts
│   ├── queue.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimiter.ts
│   │
│   └── routes/
│       ├── sms.ts
│       ├── devices.ts
│       ├── keys.ts
│       └── system.ts
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .github/
│
├── ANDROID_GATEWAY_APP_PROMPT.md
├── PRODUCTION_GUIDE.md
├── VERCEL_DEPLOYMENT_GUIDE.md
│
├── firebase-blueprint.json
├── firestore.rules
├── firestore.indexes.json
│
├── api/
├── server.ts
├── package.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── readme.md
```

## 📋 Prerequisites

Before installing HWX Gateway, make sure you have:

| Requirement | Purpose |
|---|---|
| Node.js LTS | JavaScript runtime |
| npm or Bun | Package manager |
| Git | Source code management |
| Firebase Account | Authentication and database |
| Firebase Project | Application configuration |
| Vercel Account | Cloud deployment |
| Android Studio | Future Android app development |
| Android Device | Hardware SMS integration |

Useful links:

- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel](https://vercel.com/)
- [Android Studio](https://developer.android.com/studio)

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/hwxlab/Hwx-getway.git
```

```bash
cd Hwx-getway
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=development
PORT=3000

# Firebase Web Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_JSON=YOUR_SERVICE_ACCOUNT_JSON
```

Use your own Firebase project credentials.

Never upload your private `.env` file or service-account JSON to GitHub.

### 4. Start Development Server

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:3000
```

### 5. Build Project

```bash
npm run build
```

### 6. Start Production Server

```bash
npm start
```

### 7. TypeScript Check

```bash
npm run lint
```

## 🔥 Firebase Configuration

HWX Gateway uses Firebase services for authentication, database operations, and backend integration.

### Step 1: Create Firebase Project

Visit:

https://console.firebase.google.com/

Create a new Firebase project.

### Step 2: Enable Authentication

Open:

Firebase Console → Authentication → Sign-in Method

Enable the authentication providers you intend to use:

- Email/Password
- Google Sign-In (optional)

### Step 3: Create Firestore Database

Open:

Firebase Console → Firestore Database

Create your database and configure its security rules.

### Step 4: Register Web Application

Register a Firebase Web App and obtain:

- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
- Measurement ID

Add these values to your environment variables.

### Step 5: Configure Firebase Admin

Generate a Firebase Admin service-account key for your own project.

Set its complete JSON content in:

```env
FIREBASE_SERVICE_ACCOUNT_JSON=YOUR_SERVICE_ACCOUNT_JSON
```

This variable must remain server-side only.

### Step 6: Firebase Cloud Messaging

If using Android push notifications:

1. Enable Firebase Cloud Messaging.
2. Configure the Android Firebase application.
3. Register the Android FCM token with the backend.
4. Configure Firebase Admin Messaging credentials.

## 🔐 Environment Variable Security

Important security rules:

- Never commit `.env`.
- Never expose service-account JSON.
- Never place backend secrets in `VITE_` variables.
- Keep API keys private.
- Configure Firebase Authentication authorized domains.
- Use restrictive Firestore Security Rules.
- Protect device authentication tokens.

The Firebase Web API key is a client configuration value, not a replacement for authentication or Firestore security rules.

## 📡 API Documentation

Base URL:

```text
https://YOUR-DEPLOYMENT.vercel.app
```

All protected endpoints require authentication.

Supported authentication formats:

```http
X-API-Key: YOUR_API_KEY
```

Or:

```http
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

### 1. Health Check

**GET** `/v1/health`

```bash
curl "YOUR_BACKEND_URL/v1/health"
```

### 2. Send Single SMS

**POST** `/v1/sms/send`

```bash
curl -X POST "YOUR_BACKEND_URL/v1/sms/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "sim_slot": 1,
    "to": "+911234567890",
    "message": "Hello from HWX Gateway"
  }'
```

Example response:

```json
{
  "success": true,
  "job_id": "YOUR_JOB_ID",
  "status": "queued",
  "created_at": "TIMESTAMP"
}
```

### 3. Send Bulk SMS

**POST** `/v1/sms/bulk`

```bash
curl -X POST "YOUR_BACKEND_URL/v1/sms/bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "sim_slot": 1,
    "recipients": [
      "+911234567890",
      "+919876543210"
    ],
    "message": "Hello from HWX Gateway"
  }'
```

Example response:

```json
{
  "success": true,
  "bulk_job_id": "YOUR_BULK_JOB_ID",
  "total_recipients": 2,
  "queued_count": 2,
  "status": "queued"
}
```

The backend currently validates up to 1,000 recipients per bulk request.

### 4. Check SMS Job Status

**GET** `/v1/sms/status/:job_id`

```bash
curl "YOUR_BACKEND_URL/v1/sms/status/YOUR_JOB_ID" \
  -H "X-API-Key: YOUR_API_KEY"
```

### 5. Check Bulk Job Status

**GET** `/v1/sms/bulk/:bulk_job_id`

```bash
curl "YOUR_BACKEND_URL/v1/sms/bulk/YOUR_BULK_JOB_ID" \
  -H "X-API-Key: YOUR_API_KEY"
```

### 6. Get SMS Logs

**GET** `/v1/sms/logs`

```bash
curl "YOUR_BACKEND_URL/v1/sms/logs?page=1&limit=25" \
  -H "X-API-Key: YOUR_API_KEY"
```

### 7. API Key Management

Create API Key:

```http
POST /v1/keys
```

List API Keys:

```http
GET /v1/keys
```

Revoke API Key:

```http
DELETE /v1/keys/:key_id
```

### 8. Device Management

List Devices:

```http
GET /v1/devices
```

Initiate Pairing:

```http
POST /v1/devices/pairing/initiate
```

Verify Pairing:

```http
POST /v1/devices/pairing/verify
```

Register FCM Token:

```http
POST /v1/devices/:device_id/fcm-token
```

Heartbeat:

```http
POST /v1/devices/:device_id/heartbeat
```

> Refer to `server/routes/` for request validation, authentication requirements, and the complete route implementation.

## 📚 Additional Documentation

The repository includes additional development resources.

| Document | Description |
|---|---|
| [Android App Prompt](ANDROID_GATEWAY_APP_PROMPT.md) | Native Android development specification |
| [Production Guide](PRODUCTION_GUIDE.md) | Firebase and production configuration |
| [Vercel Deployment](VERCEL_DEPLOYMENT_GUIDE.md) | Vercel deployment instructions |
| [Firestore Rules](firestore.rules) | Database access rules |
| [Firebase Blueprint](firebase-blueprint.json) | Firebase configuration blueprint |

## 🚀 Vercel Deployment

HWX Gateway includes a Vercel deployment configuration.

### Deployment Steps

1. Push the repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/).
3. Select **Add New Project**.
4. Import `hwxlab/Hwx-getway`.
5. Configure the project settings.
6. Add Firebase environment variables.
7. Deploy the project.
8. Verify the health endpoint.

### Build Configuration

Framework:

```text
Vite
```

Build Command:

```bash
npm run build
```

Output Directory:

```text
dist
```

### Verify Deployment

Open:

```text
https://YOUR-DEPLOYMENT.vercel.app/v1/health
```

Check that the API responds correctly.

For complete instructions, read:

[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

### Important Infrastructure Note

Vercel serverless functions do not provide persistent background processes or always-on WebSocket connections.

The current architecture uses REST API endpoints and Firebase services. Device communication, queue durability, and background processing must be validated against the actual deployment environment.

## ⚠️ Current Implementation Notes

HWX Gateway is actively being developed.

Please consider the following before production deployment:

- Native Android application source is maintained as a separate development phase.
- Android hardware SMS functionality requires a compatible device application.
- The current queue and several runtime registries use in-memory Maps.
- Firestore integration exists, but the entire runtime state is not yet implemented as a fully durable distributed queue.
- FCM notification delivery requires valid device tokens and Firebase Admin configuration.
- A successful API queue response does not itself confirm cellular SMS delivery.
- Production deployment requires end-to-end testing with a real Android device.

Do not use the platform for unsolicited messaging or unauthorized communications.

## 🔒 Security

Security is important to HWX Gateway.

Recommended practices:

- Use strong API keys.
- Protect Firebase service-account credentials.
- Keep device tokens private.
- Use secure HTTPS connections.
- Validate API request payloads.
- Apply rate limits.
- Restrict Firestore access.
- Monitor authentication failures.
- Protect recipient information and SMS logs.

For security-related issues, please use responsible disclosure.

## 🤝 Contributing

Contributions and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Run the available checks.
5. Submit a Pull Request.

Please include a clear description of your changes.

## 🐛 Issues & Support

Found a bug or have a suggestion?

- [Report a Bug](https://github.com/hwxlab/Hwx-getway/issues)
- [Request a Feature](https://github.com/hwxlab/Hwx-getway/issues)
- [View Repository](https://github.com/hwxlab/Hwx-getway)

## 🌐 Follow HWX Lab

Stay connected with HWX Lab for:

- Technology tutorials.
- Open-source projects.
- Development updates.
- AI and programming insights.
- New releases and announcements.

**Instagram:** [@hwxlab](https://www.instagram.com/hwxlab/)

[![Instagram](https://img.shields.io/badge/FOLLOW-HWX_LAB-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/hwxlab/)

## ❤️ Our Mission

We believe in building useful technology, sharing knowledge, and growing together.

---

## ⚡ HWX Gateway

**Connect. Send. Manage.**

Made with ❤️ by **HWX Lab**

### Build Smarter. Grow Together.

[GitHub](https://github.com/hwxlab) · [Instagram](https://www.instagram.com/hwxlab/)

