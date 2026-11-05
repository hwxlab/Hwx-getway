# HWX Gateway — Deployment Guide

## Overview
HWX Gateway is a web-managed Android SMS Gateway platform.
- Frontend: React, TypeScript, Tailwind CSS and Three.js
- Backend: Express REST API
- Database and authentication: Firebase Firestore + Firebase Authentication
- Device notifications: Firebase Cloud Messaging (FCM) where configured
- Queue: bounded-concurrency priority queue

## 1. Create your own Firebase project
1. Create a new project in the Firebase Console.
2. Enable **Authentication** and choose Email/Password (and Google sign-in only if you configure its OAuth consent and authorized domains).
3. Create a **Firestore Database**.
4. Register a Web App and copy its Firebase configuration into the Vite environment variables below.
5. Create a Firebase Admin service account for server-side use. Keep its JSON private.

## 2. Environment variables

Copy `.env.example` to `.env` for local development. In Vercel, add the same variables under Project Settings → Environment Variables.

### Browser / Vite variables
```env
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_WEB_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
```

### Server-only variable
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"YOUR_PROJECT_ID", "...":"use your real downloaded service-account JSON"}
```
The line above is an example only, not valid credentials. Paste your complete service-account JSON as a single-line JSON string into the Vercel server environment. Never use a service-account JSON in a `VITE_` variable.

## 3. Deploy to Vercel
1. Push this project to your own GitHub repository.
2. Import the repository into Vercel.
3. Set Framework Preset to Vite.
4. Set Build Command to `npm run build` and Output Directory to `dist` (confirm against the current `package.json`).
5. Add your own Firebase environment variables.
6. Deploy and inspect the build logs.

## 4. Firebase security
- Configure Firestore Security Rules for authenticated users and account ownership.
- Add your deployed Vercel domain under Firebase Authentication → Settings → Authorized domains.
- Enable FCM and configure the required Android app credentials if using push notifications.
- Do not publish private service-account keys or device tokens.

## 5. Validation
Check the deployed `/v1/health` endpoint. Then test signup/login, device pairing, API key creation, queueing and job status with a test device before production use.

## Important
The repository is a reusable starter template. No Firebase project is pre-connected. Each deployer must create and configure their own Firebase project and verify the SMS device workflow with their own Android device and SIM. Do not treat the example environment values as working credentials.
