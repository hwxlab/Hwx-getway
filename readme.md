<div align="center">⚡ HWX Gateway

Connect. Send. Manage.

A Modern Android SMS Gateway Platform by HWX Lab

""HWX Lab" (https://img.shields.io/badge/BUILT%20BY-HWX%20LAB-00CFFF?style=for-the-badge)" (https://github.com/hwxlab)
""Platform" (https://img.shields.io/badge/PLATFORM-Web%20%2B%20Android-6366F1?style=for-the-badge)" (#)
""Firebase" (https://img.shields.io/badge/BACKEND-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)" (https://firebase.google.com/)
""License" (https://img.shields.io/badge/LICENSE-MIT-8B5CF6?style=for-the-badge)" (LICENSE)

Connect Android Devices. Manage SIMs. Integrate SMS Through APIs.

"Features" (#-features) • "Workflow" (#-workflow) • "Installation" (#-installation) • "Configuration" (#-configuration) • "API" (#-api-documentation) • "Deployment" (#-deployment)

</div>---

🚀 About

HWX Gateway is an Android-based SMS Gateway platform developed by HWX Lab.

It connects Android devices with a centralized web dashboard, providing an API-driven approach to SMS management.

The platform is designed to help developers and users manage connected devices, select SIM slots, submit SMS requests, and monitor available results through a centralized interface.

🎯 Our Vision

To make Android-based SMS gateway integration simple, accessible, and developer-friendly.

✨ Features

Feature| Description
📱 Android Integration| Connect Android devices
🔗 Device Pairing| QR code and pairing-code workflow
🌐 Web Dashboard| Centralized device management
📡 SMS API| API-based SMS requests
📶 SIM Selection| Select available SIM slots
🔥 Firebase| Firebase application infrastructure
📋 SMS Logs| View available SMS records
🔐 API Security| Authenticated API access
📱 Responsive UI| Mobile-friendly dashboard

«Features are subject to actual implementation and supported device capabilities.»

🔄 Workflow

flowchart TD
    A["🌐 Website Dashboard"]
    B["➕ Add Device"]
    C["🔗 Generate QR / Pairing Code"]
    D["📱 Android App Connects"]
    E["🔐 Grant Required Permissions"]
    F["📡 Device & SIM Information"]
    G["🎛️ Select Device & SIM"]
    H["📨 SMS API Request"]
    I["⚙️ Backend Processing"]
    J["📋 SMS Result & Logs"]

    A --> B --> C --> D
    D --> E --> F --> G
    G --> H --> I --> J

    style A fill:#172554,stroke:#3B82F6,color:#fff
    style H fill:#312E81,stroke:#8B5CF6,color:#fff
    style J fill:#164E63,stroke:#06B6D4,color:#fff

The diagram represents the intended workflow. Only implemented functionality should be considered available.

🏗️ Architecture

flowchart TD
    U["👤 User / Developer"]
    W["🌐 Web Dashboard"]
    B["⚙️ Backend API"]
    F[("🔥 Firebase")]
    A["📱 Android App"]
    S["📶 Android SIM"]
    L["📋 SMS Logs"]

    U --> W
    W <--> B
    B <--> F
    B <--> A
    A --> S
    B --> L
    F --> L

Core Components

- Dashboard: Device and API management interface.
- Backend: Handles application requests and business logic.
- Firebase: Database and supported Firebase services.
- Android Application: Connects authorized devices.
- SIM: Provides device-side SMS transmission.

🛠️ Technology Stack

"React" (https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
"TypeScript" (https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
"Vite" (https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
"Node.js" (https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
"Firebase" (https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
"Android" (https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)
"Kotlin" (https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white)

Verify the actual dependencies in the repository before publishing this technology list.

📂 Project Structure

HWX-Gateway/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── client/
├── server/
├── android/
│
├── .env.example
├── .gitignore
├── package.json
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md

Illustrative structure. Refer to the actual repository for available directories.

⚙️ Installation

Prerequisites

- Node.js LTS
- npm or Bun
- Git
- Firebase Project
- Android Studio (for Android development)
- Android device with an active SIM

1. Clone Repository

git clone https://github.com/hwxlab/Hwx-getway.git

cd Hwx-getway

2. Install Dependencies

Using npm:

npm install

Using Bun:

bun install

3. Configure Environment

cp .env.example .env

Add your own configuration values.

4. Start Development Server

npm run dev

5. Build Project

npm run build

Use the scripts actually defined in package.json.

🔥 Firebase Configuration

HWX Gateway uses Firebase for its application infrastructure.

Setup Steps

1. Visit "Firebase Console" (https://console.firebase.google.com/).
2. Create a Firebase project.
3. Register your web application.
4. Configure Firebase Authentication if required.
5. Create a Firestore database.
6. Enable Firebase Cloud Messaging if required by the implementation.
7. Configure the appropriate credentials.
8. Set the required environment variables.

Security Recommendations

- Never publish Firebase service-account JSON.
- Never commit private API keys or tokens.
- Configure Firestore Security Rules.
- Restrict administrative credentials to backend services.
- Validate user permissions.

🔐 Environment Variables

Example ".env.example":

NODE_ENV=development
PORT=3000

# Firebase Web Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_JSON=YOUR_SERVICE_ACCOUNT_JSON

# Application
APP_BASE_URL=http://localhost:3000

Important: Match variable names with the actual backend and frontend code. Variables prefixed with "VITE_" are exposed to client-side code. Never put service-account secrets in them.

📡 API Documentation

HWX Gateway is designed to support API-based SMS integration.

Send SMS Request

Illustrative example:

curl -X POST "YOUR_BACKEND_URL/v1/sms/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "to": "+911234567890",
    "message": "Hello from HWX Gateway",
    "sim_slot": 1
  }'

Example Response

{
  "success": true,
  "message": "Request received",
  "job_id": "YOUR_JOB_ID"
}

«This is an illustrative example, not a verified API contract. Check the actual backend routes and schemas before integration.»

🚀 Deployment

Vercel Deployment

1. Push your project to GitHub.
2. Open "Vercel" (https://vercel.com/).
3. Import your repository.
4. Configure the project root directory.
5. Add environment variables.
6. Set the correct build command.
7. Deploy the project.
8. Verify dashboard and API functionality.

Deployment Checklist

- [ ] Environment variables configured.
- [ ] Firebase connected.
- [ ] Firestore rules configured.
- [ ] Backend routes verified.
- [ ] API authentication tested.
- [ ] Dashboard tested.
- [ ] Android device connection tested.
- [ ] SMS functionality tested.

Infrastructure note: Vercel serverless functions are not persistent WebSocket servers. Persistent device connections and background processing need appropriate infrastructure.

🔒 Security

Security is a priority for HWX Gateway.

- Protect API keys.
- Never publish service-account credentials.
- Validate incoming requests.
- Restrict unauthorized device pairing.
- Apply appropriate rate limits.
- Protect device information and SMS logs.
- Follow Android permission requirements.

For security reports, see "SECURITY.md" (SECURITY.md).

🤝 Contributing

Contributions and suggestions are welcome!

1. Fork this repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request.

Read "CONTRIBUTING.md" (CONTRIBUTING.md) before contributing.

🌐 Follow HWX Lab

Stay connected with HWX Lab for:

- Technology tutorials.
- Open-source projects.
- Development updates.
- New releases.
- Programming and AI insights.

Instagram: "@hwxlab" (https://www.instagram.com/hwxlab/)

""Instagram" (https://img.shields.io/badge/Follow%20HWX%20Lab-Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)" (https://www.instagram.com/hwxlab/)

---

<div align="center">⚡ HWX Gateway

Connect. Send. Manage.

Made with ❤️ by HWX Lab

Build Smarter. Grow Together.

"GitHub" (https://github.com/hwxlab) · "Instagram" (https://www.instagram.com/hwxlab/)

</div>
