⚡ HWX Gateway

Connect. Send. Manage.

HWX Gateway is an Android SMS Gateway project designed to connect Android devices with a web dashboard and allow applications to send SMS through API integration.

Manage connected devices, select SIM slots, send SMS requests, and monitor request results from one place.

<p align="center">Developed by "HWX Lab" (https://github.com/hwxlab)

"GitHub" (https://github.com/hwxlab/Hwx-getway) · "Instagram" (https://www.instagram.com/hwxlab/)

</p>---

📌 Quick Navigation

- "Features" (#-features)
- "How It Works" (#-how-it-works)
- "Project Structure" (#-project-structure)
- "Getting Started" (#-getting-started)
- "Firebase Configuration" (#-firebase-configuration)
- "API Integration" (#-api-integration)
- "Android App Setup" (#-android-app-setup)
- "Deployment" (#-deployment)
- "Security" (#-security)
- "Documentation" (#-documentation)
- "Support" (#-support)

---

🚀 Features

- Device Pairing: Connect Android devices with a dashboard using a QR code or pairing code.
- Device Management: View and manage connected Android devices.
- SIM Selection: Select the required SIM slot when sending SMS.
- SMS API: Integrate SMS sending into your own applications.
- API Keys: Authenticate API requests using API credentials.
- SMS Logs: Track SMS requests and their reported results.
- Test API: Test SMS API requests from the dashboard.
- Job Tracking: Track request status using job IDs.
- Firebase Integration: Use your own Firebase project for backend services and data storage.
- Responsive Dashboard: Access the dashboard from desktop and mobile browsers.

«Feature availability depends on the implementation and configuration of the current project version. Configure and test your own Firebase and Android environment before production use.»

---

🔄 How It Works

The basic device connection and SMS request workflow:

flowchart TD
    Dashboard["1. Open HWX Gateway Dashboard"]
    AddDevice["2. Select Add Device"]
    Pairing["3. Generate QR Code or Pairing Code"]
    Android["4. Open HWX Gateway Android App"]
    Connect["5. Scan QR or Enter Pairing Code"]
    Permission["6. Grant Required Android Permissions"]
    Connected["7. Device Connects to Gateway"]
    Select["8. Select Device and SIM Slot"]
    Request["9. Send SMS Using API"]
    Result["10. Check Job Status and SMS Logs"]

    Dashboard --> AddDevice
    AddDevice --> Pairing
    Pairing --> Android
    Android --> Connect
    Connect --> Permission
    Permission --> Connected
    Connected --> Select
    Select --> Request
    Request --> Result

Simple explanation

1. Open the web dashboard.
2. Add a new Android device.
3. Generate its pairing QR code or pairing code.
4. Open the Android app and connect the device.
5. Grant the required permissions.
6. Select the connected device and SIM slot.
7. Send SMS requests through the API.
8. Check the request status and logs.

---

📁 Project Structure

HWX-Gateway/
│
├── api/
│   └── index.ts
│
├── server/
│   ├── firebaseAdmin.ts
│   ├── queue.ts
│   └── routes/
│
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── ANDROID_GATEWAY_APP_PROMPT.md
├── VERCEL_DEPLOYMENT_GUIDE.md
├── PRODUCTION_GUIDE.md
├── .env.example
├── .gitignore
├── firebase-blueprint.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
├── server.ts
└── README.md

---

💻 Getting Started

1. Clone the repository

git clone https://github.com/hwxlab/Hwx-getway.git

cd Hwx-getway

2. Install dependencies

Using Bun:

bun install

Or using npm:

npm install

3. Configure environment variables

Create your local environment file:

cp .env.example .env

Open ".env" and add your own Firebase and application configuration.

4. Run the project

Check the scripts available in "package.json":

npm run

Run the appropriate development script listed there.

---

🔥 Firebase Configuration

This repository is a reusable starter project. It is not connected to the original developer's Firebase project.

You must configure your own Firebase project.

Setup

1. Open the "Firebase Console" (https://console.firebase.google.com/).
2. Create a Firebase project.
3. Register your web application.
4. Enable the Firebase services required by the project.
5. Configure Firestore.
6. Configure Firebase Authentication if required by the application.
7. Generate your Firebase Admin SDK service-account credentials.
8. Add the required values to your environment variables.

Important

- Never commit your service-account JSON file.
- Never publish private keys or secrets in frontend code.
- Keep server-side credentials in server environment variables.
- Do not use another developer's Firebase credentials.

Firebase documentation: https://firebase.google.com/docs

---

🔌 API Integration

HWX Gateway is intended to let external applications communicate with the SMS Gateway through API requests.

A typical integration involves:

1. Creating or obtaining an API key.
2. Selecting a connected device.
3. Selecting a SIM slot where supported.
4. Sending an SMS request.
5. Tracking the request using its job ID.

Example API request

The following is an illustrative request format. Confirm the exact endpoint, headers, and request fields against the current backend implementation and API documentation before using it.

curl -X POST "YOUR_GATEWAY_URL/v1/sms/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "sim_slot": 1,
    "to": "+911234567890",
    "message": "Hello from HWX Gateway"
  }'

Replace:

- "YOUR_GATEWAY_URL" with your deployed backend URL.
- "YOUR_API_KEY" with your API key.
- "YOUR_DEVICE_ID" with your connected device ID.
- "sim_slot" with the SIM slot supported by your device.

Important: An accepted API request does not necessarily mean the SMS was delivered. Check the returned status and job details for the result reported by the device.

---

📱 Android App Setup

The Android application is responsible for pairing with the dashboard and handling SMS operations on the connected device.

The intended pairing options are:

- Scan a QR code.
- Enter a pairing code.

After pairing, the app requests the Android permissions required for its supported functions.

For the Android app development instructions, use:

"📱 Android Gateway App Prompt" (./ANDROID_GATEWAY_APP_PROMPT.md)

---

☁️ Deployment

The project includes a deployment guide for hosting the web dashboard and backend.

Recommended deployment components

Component| Purpose
Vercel| Dashboard and supported backend deployment
Firebase Firestore| Application data
Firebase Authentication| User authentication, if configured
Firebase Admin SDK| Secure server-side Firebase access
Android Device| SMS operations

Deploy to Vercel

1. Push the project to your GitHub repository.
2. Open "Vercel" (https://vercel.com/).
3. Import the repository.
4. Configure the required environment variables.
5. Deploy the project.
6. Test the dashboard and backend endpoints.

"🚀 Open Vercel Deployment Guide" (./VERCEL_DEPLOYMENT_GUIDE.md)

---

🔐 Security

Security is important when building an SMS Gateway.

- Keep API keys private.
- Never expose Firebase Admin credentials.
- Use HTTPS for production deployments.
- Validate API request data.
- Protect device pairing with secure, expiring pairing codes.
- Apply authentication and authorization to sensitive endpoints.
- Add request limits and abuse protection.
- Store only the data required by the application.
- Obtain appropriate permission and consent before sending SMS.

Do not use the gateway for spam, unsolicited messages, or unauthorized messaging.

---

📚 Documentation

Documentation| Description
"Android App Prompt" (./ANDROID_GATEWAY_APP_PROMPT.md)| Instructions for building the Android application
"Vercel Deployment Guide" (./VERCEL_DEPLOYMENT_GUIDE.md)| Dashboard and backend deployment
"Production Guide" (./PRODUCTION_GUIDE.md)| Production configuration and setup

---

🛠️ Technologies

The project uses technologies including:

- React
- TypeScript
- Vite
- Node.js
- Express
- Firebase
- Firestore
- Firebase Admin SDK
- Android / Kotlin (for the companion app)

Refer to "package.json" and the project source for the exact dependencies and versions.

---

🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request.

Please include a clear description of the changes.

---

📩 Support & Community

HWX Lab

- GitHub: https://github.com/hwxlab
- Project Repository: https://github.com/hwxlab/Hwx-getway
- Instagram: https://www.instagram.com/hwxlab/

Follow @hwxlab for project updates and more development work.

---

📄 License

Check the repository for its license information before using, modifying, or distributing this project.

---

<p align="center">⚡ HWX Gateway

Connect. Send. Manage.

Built with ❤️ by HWX Lab

"GitHub" (https://github.com/hwxlab/Hwx-getway) · "Instagram" (https://www.instagram.com/hwxlab/)

</p>
