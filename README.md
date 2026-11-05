# HWX Gateway — Public Starter Project

This archive is a reusable starter copy of the HWX Gateway dashboard and backend.

## Important: Firebase is not pre-connected
The original owner's Firebase project identifiers and Web API keys have been removed. This project keeps Firebase integration code, but every person deploying it must connect their **own** Firebase project.

### Quick setup
1. Create a Firebase project at https://console.firebase.google.com/.
2. Enable Firebase Authentication and Firestore.
3. Register a Firebase Web App and copy its config values.
4. Download a Firebase Admin service-account JSON for server-side use.
5. Copy `.env.example` to `.env` locally, or add the same values in Vercel Project Settings → Environment Variables.
6. Replace every `YOUR_...` placeholder with values from your own Firebase project.
7. Add your Vercel domain to Firebase Authentication → Settings → Authorized domains.
8. Deploy and test with a test device before using the system.

## Firebase variables
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (if Firebase provides one)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (server-only; full JSON on one line)
- `FIREBASE_PROJECT_ID` (optional health display)

Never put the Firebase Admin service-account JSON in a `VITE_` variable or commit it to GitHub. Never share your private service-account JSON, device tokens, or API secrets in public.

## Other setup
- Update the Android build prompt in `ANDROID_GATEWAY_APP_PROMPT.md` with your own Android Firebase app configuration and deployed backend URL.
- Review `PRODUCTION_GUIDE.md` and `VERCEL_DEPLOYMENT_GUIDE.md`.
- Confirm the actual routes and Android device workflow work in your deployment. The included docs are setup guidance, not a guarantee that a live deployment has been tested.

## Project behavior
The project still contains Firebase Authentication, Firestore, Firebase Admin, and FCM integration points. They are not removed; only the previous owner's Firebase project configuration has been replaced with placeholders.
