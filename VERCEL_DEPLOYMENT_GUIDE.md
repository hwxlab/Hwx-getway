# HWX Gateway — Vercel Deployment Guide

The dashboard and backend are intended to run under one Vercel deployment.

## Main routes
- Dashboard: `https://YOUR-DEPLOYMENT.vercel.app/`
- Health: `https://YOUR-DEPLOYMENT.vercel.app/v1/health`
- Send SMS: `https://YOUR-DEPLOYMENT.vercel.app/v1/sms/send`
- Bulk SMS: `https://YOUR-DEPLOYMENT.vercel.app/v1/sms/bulk`
- Job status: `https://YOUR-DEPLOYMENT.vercel.app/v1/sms/status/JOB_ID`
- Device pairing: `https://YOUR-DEPLOYMENT.vercel.app/v1/devices/pairing/initiate`

## Deploy
1. Push this project to a GitHub repository you control.
2. Import it into Vercel.
3. Use the Vite framework preset.
4. Set the build command to `npm run build` and output directory to `dist`, checking the package scripts before deployment.
5. Create your own Firebase project and add its environment variables from `.env.example`.
6. Deploy.

## Required Firebase environment variables

| Variable | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `YOUR_PROJECT_ID.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase Web App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Firebase measurement ID, if provided |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full Firebase Admin service-account JSON; server-only |

Do not copy credentials from another person's project. Add your deployed Vercel hostname to Firebase Authentication → Settings → Authorized domains.

## Important
The source archive does not include a connected Firebase project, service-account file, API key, or deployed backend URL. Each user must configure their own services. Confirm all API routes and the Android device connection in a test environment before using real SMS traffic.
