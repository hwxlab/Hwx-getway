<div align="center"><img src="assets/branding/hwx-gateway-banner.png" alt="HWX Gateway Banner" width="100%"/>⚡ HWX Gateway

Connect. Send. Manage.

A Modern Android SMS Gateway Platform

""Brand" (https://img.shields.io/badge/Brand-HWX%20Lab-00CFFF?style=for-the-badge)" (https://github.com/hwxlab)
""Platform" (https://img.shields.io/badge/Platform-Web%20%2B%20Android-6366F1?style=for-the-badge)" (#)
""Backend" (https://img.shields.io/badge/Backend-API-8B5CF6?style=for-the-badge)" (#)
""Database" (https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge)" (#)

Manage Android devices and send SMS through an API-driven gateway.

"Features" (#-features) • "Architecture" (#-architecture) • "Installation" (#-installation) • "Configuration" (#-configuration) • "API" (#-api-documentation) • "Deployment" (#-deployment)

</div>---

🚀 About HWX Gateway

HWX Gateway is an Android-based SMS Gateway platform developed under HWX Lab.

It is designed to connect Android devices with a centralized web dashboard, allowing users to manage connected devices and integrate SMS functionality through API requests.

The project combines a web dashboard, backend services, Firebase integration, and an Android device application.

Our goal is to make Android SMS gateway management simple, accessible, and developer-friendly.

✨ Features

- 📱 Android Device Integration — Connect Android devices with the gateway.
- 🔗 Device Pairing — Designed around QR code and pairing-code connection.
- 📡 SMS API — Send SMS through API requests.
- 📶 SIM Selection — Support for selecting available SIM slots where implemented.
- 📊 Web Dashboard — Centralized device and SMS management.
- 🔥 Firebase Integration — Firebase-based application infrastructure.
- 📋 SMS Logs — Track SMS requests and their available results.
- ⚙️ API Documentation — Developer-friendly API integration.
- 📱 Mobile-Friendly Interface — Responsive dashboard experience.

«Feature availability depends on the implementation in the current source code and the connected Android device.»

🏗️ Architecture

<div align="center"><img src="assets/branding/hwx-architecture.png" alt="HWX Gateway Architecture" width="100%"/></div>System Components

Component| Responsibility
Web Dashboard| Device and API management
Backend API| Request handling and processing
Firebase| Database and application services
Android App| Device connection and SMS operations
SIM Card| SMS transmission through the device

🔄 How It Works

<div align="center"><img src="assets/branding/hwx-workflow.png" alt="HWX Gateway Workflow" width="100%"/></div>Basic Workflow

1. Open the HWX Gateway dashboard.
2. Add a device.
3. Generate a QR code or pairing code.
4. Connect the Android application.
5. Grant the required Android permissions.
6. Synchronize available device and SIM information.
7. Select a connected device and SIM.
8. Submit an SMS API request.
9. Backend processes the request.
10. View the available SMS result and logs.

This workflow describes the intended platform flow. Individual steps require corresponding implementation in the source code.

🛠️ Technology Stack

<div align="center">"React" (https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
"TypeScript" (https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
"Vite" (https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
"Firebase" (https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
"Node.js" (https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
"Android" (https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)
"Kotlin" (https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white)

</div>The badges represent the intended technology ecosystem. Verify the actual dependencies against the repository before publishing.

📂 Project Structure

HWX-Gateway/
│
├── assets/
│   └── branding/
│       ├── hwx-gateway-banner.png
│       ├── hwx-gateway-logo.png
│       ├── hwx-workflow.png
│       ├── hwx-architecture.png
│       ├── hwx-features.png
│       └── hwx-lab-social.png
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│
├── client/                  # Web dashboard (if present)
├── server/                  # Backend (if present)
├── android/                 # Android application (if present)
│
├── .env.example
├── .gitignore
├── package.json
└── README.md

Folder names above illustrate the documentation layout. Your actual repository structure may differ.

⚙️ Installation

Prerequisites

Before starting, make sure you have:

- Node.js (LTS recommended)
- npm or Bun
- Git
- A Firebase project
- Android Studio (for Android development)
- Android device with a SIM card (for device-side SMS functionality)

1. Clone Repository

git clone https://github.com/hwxlab/Hwx-getway.git

cd Hwx-getway

2. Install Dependencies

For npm:

npm install

For Bun:

bun install

3. Configure Environment

Create your environment file:

cp .env.example .env

Add your own configuration values.

4. Start Development

Use the development scripts defined in your project's "package.json".

For example:

npm run dev

5. Build Project

npm run build

Commands may need adjustment depending on the actual project scripts.

🔥 Firebase Configuration

HWX Gateway uses Firebase services for its application infrastructure.

Setup

1. Open the "Firebase Console" (https://console.firebase.google.com/).
2. Create or select a Firebase project.
3. Register your web application.
4. Configure Firebase Authentication if required by the application.
5. Create a Firestore database.
6. Enable Firebase Cloud Messaging if required by the device communication implementation.
7. Generate the appropriate Firebase configuration.
8. Configure credentials through environment variables.

Firebase Security

- Never commit private service-account JSON files.
- Never expose private credentials in frontend code.
- Configure Firestore Security Rules.
- Restrict administrative access to trusted backend services.
- Use environment variables for deployment secrets.

🔐 Environment Variables

Create ".env.example" with generic placeholders.

Example:

# Application
NODE_ENV=development
PORT=3000

# Firebase Web Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Firebase Admin Configuration
FIREBASE_SERVICE_ACCOUNT_JSON=YOUR_SERVICE_ACCOUNT_JSON

# Application URLs
APP_BASE_URL=http://localhost:3000

«Important: Adjust variable names to match the actual source code. Frontend environment variables are not private secrets merely because they are stored in an environment file. Never put service-account credentials in frontend variables.»

📡 API Documentation

HWX Gateway is designed to provide API-based SMS integration.

The following is an illustrative request format. Confirm the actual endpoint, authentication header, and request schema from the backend implementation before using it.

Send SMS

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

Illustrative response only. Actual response fields and delivery status depend on the backend implementation.

API Integration

Developers can integrate the gateway with:

- Websites
- Backend applications
- Custom automation systems
- Supported third-party applications

Use your own API key and authorized connected device.

🚀 Deployment

Deploy Backend and Dashboard on Vercel

1. Push the project to GitHub.
2. Open "Vercel" (https://vercel.com/).
3. Import your GitHub repository.
4. Configure the correct project root directory.
5. Set the required environment variables.
6. Configure the build command and output settings according to the project.
7. Deploy the application.
8. Verify the API and dashboard after deployment.

Deployment Checklist

- [ ] Environment variables configured.
- [ ] Firebase project connected.
- [ ] Firestore permissions configured.
- [ ] Backend routes verified.
- [ ] API authentication tested.
- [ ] Dashboard deployment verified.
- [ ] Android connection tested.
- [ ] SMS functionality tested on a supported device.

Important: Vercel serverless functions are not persistent background servers. Long-running device connections and background jobs require an appropriate infrastructure design.

🛡️ Security

Security is an important part of HWX Gateway.

- Keep API keys private.
- Never publish Firebase service-account credentials.
- Validate incoming API requests.
- Restrict unauthorized device access.
- Use secure authentication.
- Apply rate limiting where appropriate.
- Protect sensitive SMS logs and device information.
- Follow Android permission requirements.

For security-related reports, see "SECURITY.md" (SECURITY.md).

🤝 Contributing

Contributions, suggestions, bug reports, and improvements are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request.

Please read "CONTRIBUTING.md" (CONTRIBUTING.md) before contributing.

📸 Project Preview

<div align="center"><img src="assets/branding/hwx-features.png" alt="HWX Gateway Features" width="100%"/></div>🌐 Follow HWX Lab

<div align="center"><img src="assets/branding/hwx-lab-social.png" alt="HWX Lab Social Branding" width="100%"/>Stay Connected with HWX Lab

Follow us for technology tutorials, project updates, development insights, and new releases.

""Instagram" (https://img.shields.io/badge/Instagram-@hwxlab-E4405F?style=for-the-badge&logo=instagram&logoColor=white)" (https://www.instagram.com/hwxlab/)

Instagram: "@hwxlab" (https://www.instagram.com/hwxlab/)

</div>---

<div align="center"><img src="assets/branding/hwx-gateway-logo.png" alt="HWX Lab Logo" width="110"/>HWX Gateway

Connect. Send. Manage.

Made with ❤️ by HWX Lab

Build Smarter. Grow Together.

"GitHub" (https://github.com/hwxlab) · "Instagram" (https://www.instagram.com/hwxlab/)

</div>
