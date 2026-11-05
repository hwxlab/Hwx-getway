⚡ HWX Gateway

<p align="center">Android SMS Gateway with API Integration

Connect. Send. Manage.

A simple and powerful platform to connect Android devices with your applications through an SMS API.

""GitHub" (https://img.shields.io/badge/GitHub-HWX%20Gateway-black?logo=github)" (https://github.com/hwxlab/Hwx-getway)
""Firebase" (https://img.shields.io/badge/Backend-Firebase-orange?logo=firebase)" (https://firebase.google.com/)
""Vercel" (https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)" (https://vercel.com/)

Developed by "HWX Lab" (https://github.com/hwxlab)

"Instagram" (https://www.instagram.com/hwxlab/) · "Repository" (https://github.com/hwxlab/Hwx-getway)

</p>---

🚀 About HWX Gateway

HWX Gateway is an Android-based SMS Gateway platform that allows developers to send SMS from their own applications using API integration.

Connect your Android device, select a SIM slot, generate API requests, and manage SMS operations through a web dashboard.

No complicated SMS API integration is needed on your application side. Your connected Android device handles the SMS operation.

✨ Key Features

- 📱 Android Device Pairing – Connect devices using QR code or pairing code.
- 🌐 Web Dashboard – Manage devices and SMS operations.
- 🔌 REST API Integration – Send SMS from your own applications.
- 📶 Dual SIM Support – Select the SIM slot when supported.
- 🔑 API Key Authentication – Authenticate API requests.
- 📊 SMS Logs – Monitor SMS requests and results.
- ⚡ Job Tracking – Track requests using Job IDs.
- 🔥 Firebase Integration – Connect your own Firebase project.
- 📱 Mobile-Friendly UI – Access the dashboard from mobile or desktop.

🔄 How It Works

flowchart TD
    A["🌐 Open Web Dashboard"] --> B["➕ Add Android Device"]
    B --> C["🔳 Generate QR / Pairing Code"]
    C --> D["📱 Pair Android App"]
    D --> E["🔐 Grant Required Permissions"]
    E --> F["✅ Device Connected"]
    F --> G["📶 Select Device & SIM"]
    G --> H["🔌 Send SMS Through API"]
    H --> I["📊 Check Status & Logs"]

🧩 Technology Stack

Technology| Purpose
React + TypeScript| Dashboard
Vite| Frontend build
Node.js + Express| Backend
Firebase| Database and authentication
Firestore| Application data
Vercel| Hosting and deployment
Android / Kotlin| SMS device application

⚙️ Quick Start

1. Clone Repository

git clone https://github.com/hwxlab/Hwx-getway.git
cd Hwx-getway

2. Install Dependencies

bun install

Or:

npm install

3. Configure Environment

cp .env.example .env

Add your own Firebase and application credentials to ".env".

4. Start Development

Check the available scripts:

npm run

Run the development command defined in "package.json".

🔥 Firebase Setup

This repository is a public starter project. It does not include the original developer's Firebase credentials.

You must configure your own:

- Firebase Project
- Firestore Database
- Firebase Authentication, if required
- Firebase Admin SDK credentials
- Environment variables

Never upload private keys or service-account credentials to GitHub.

🔌 API Integration

Use the API to connect your own website, application, or backend with HWX Gateway.

Example request format (verify the exact schema against the current backend):

curl -X POST "YOUR_GATEWAY_URL/v1/sms/send" \
-H "Content-Type: application/json" \
-H "X-API-Key: YOUR_API_KEY" \
-d '{
  "device_id": "YOUR_DEVICE_ID",
  "sim_slot": 1,
  "to": "+911234567890",
  "message": "Hello from HWX Gateway"
}'

Replace the URL, API key, device ID, and recipient with your own values.

📚 Documentation & Guides

Everything you need to configure and extend the project:

Guide| Description
"📱 Android App Prompt" (./ANDROID_GATEWAY_APP_PROMPT.md)| Build the Android companion app
"🚀 Vercel Deployment" (./VERCEL_DEPLOYMENT_GUIDE.md)| Deploy dashboard and backend
"⚙️ Production Guide" (./PRODUCTION_GUIDE.md)| Production configuration and setup

🔐 Security Notice

- Keep API keys and Firebase credentials private.
- Use HTTPS in production.
- Protect device pairing and authentication.
- Validate API requests.
- Apply appropriate request limits.
- Send SMS only with proper authorization and consent.

🤝 Contributing

Contributions are welcome!

1. Fork this repository.
2. Create a new branch.
3. Make your changes.
4. Submit a Pull Request.

🌐 Connect With HWX Lab

<p align="center">Follow us for updates, projects, and development work.

""Instagram" (https://img.shields.io/badge/Instagram-@hwxlab-E4405F?logo=instagram&logoColor=white)" (https://www.instagram.com/hwxlab/)
""GitHub" (https://img.shields.io/badge/GitHub-hwxlab-181717?logo=github&logoColor=white)" (https://github.com/hwxlab)

</p>---

<p align="center">⚡ HWX Gateway

Connect. Send. Manage.

Made with ❤️ by HWX Lab

</p>
