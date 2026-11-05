# HWX Gateway — Android APK Native Build Specification (Phase 2)

> **Instructions for Google AI Studio:** Copy and paste the entire prompt below into a new Google AI Studio Build prompt targeting **Android (Kotlin / Jetpack Compose)** to build the complete, production-ready HWX Gateway Android application APK.

---

```markdown
You are a senior Android native software architect, telecommunications engineer, and mobile security specialist.

Build the complete, production-grade Android native application named "HWX Gateway" in Kotlin with modern Jetpack Compose.

Target Package Name: com.example.hwxgateway
Minimum SDK: Android 8.0 (API 26)
Target SDK: Android 14 / 15 (API 34/35)

---

### 1. APPLICATION OBJECTIVE & ROLE
HWX Gateway is a dedicated cellular gateway application that turns this Android phone into a high-performance SMS dispatch node for the HWX Gateway web platform.

CRITICAL ARCHITECTURAL DIRECTIVES:
1. NO User Signup or Login screens (no email, no password, no Google sign-in UI).
2. The phone pairs EXCLUSIVELY with the user's web dashboard via:
   - Method A: Live Camera QR Code Scanner (CameraX + Google ML Kit Barcode Scanning).
   - Method B: Manual 6-Digit Pairing Code entry.
3. Once paired, the app runs as an uninterrupted Android Foreground Service with continuous background job processing via WorkManager and Firebase Cloud Messaging (FCM v1).
4. Multi-SIM Support: Detects both SIM slots (Carrier, SubId, Availability, Network status) and routes outgoing SMS to the exact SIM slot requested by the backend.

---

### 2. FIREBASE CONFIGURATION (google-services.json)
Place and configure the following google-services.json configuration in the app:

```json
{
  "project_info": {
    "project_number": "YOUR_FIREBASE_SENDER_ID",
    "project_id": "YOUR_PROJECT_ID",
    "storage_bucket": "YOUR_PROJECT_ID.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "YOUR_FIREBASE_ANDROID_APP_ID",
        "android_client_info": {
          "package_name": "com.example.hwxgateway"
        }
      },
      "oauth_client": [
        {
          "client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "YOUR_FIREBASE_ANDROID_API_KEY"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID",
              "client_type": 3
            }
          ]
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

---

### 3. BACKEND REST API CONTRACTS (EXACT SPECIFICATION)

The web dashboard and backend are already deployed and live. Use these exact endpoints:

Default Server URL: https://YOUR-DEPLOYMENT.vercel.app
(Allow the user to override this Server URL in app settings or via the QR code payload).

#### A. Device Pairing Verification
- Endpoint: POST /v1/devices/pairing/verify
- Headers: Content-Type: application/json
- Request Body:
```json
{
  "pairing_code": "173655",
  "pairing_token": "bb455315b84a00ee60cb5067a18f33ee968917edd2bce72b",
  "model": "Google Pixel 8 Pro",
  "android_version": "14.0",
  "app_version": "1.0.0",
  "sim_count": 2,
  "sims": [
    {
      "sim_slot": 1,
      "carrier_name": "Jio 5G",
      "phone_number": "+910000000000",
      "availability": "Available",
      "network_status": "5G SA",
      "sms_permission": true
    },
    {
      "sim_slot": 2,
      "carrier_name": "Airtel",
      "phone_number": "+910000000001",
      "availability": "Available",
      "network_status": "LTE",
      "sms_permission": true
    }
  ]
}
```
- Response (201 Created):
```json
{
  "success": true,
  "device_id": "YOUR_DEVICE_ID",
  "device_token": "YOUR_DEVICE_TOKEN",
  "account_id": "YOUR_ACCOUNT_ID",
  "device_name": "Office Samsung S23",
  "message": "Device successfully paired and registered."
}
```
*Action*: Store `device_id`, `device_token`, and `server_url` securely in Android `EncryptedSharedPreferences`.

#### B. Registering FCM Push Token
- Endpoint: POST /v1/devices/{device_id}/fcm-token
- Headers:
  - X-Device-Id: {device_id}
  - X-Device-Token: {device_token}
- Request Body:
```json
{
  "fcm_token": "fcm_token_string_from_firebase"
}
```

#### C. Periodic Device Heartbeat (Every 2 minutes)
- Endpoint: POST /v1/devices/{device_id}/heartbeat
- Headers:
  - X-Device-Id: {device_id}
  - X-Device-Token: {device_token}
- Request Body:
```json
{
  "battery_level": 88,
  "is_charging": true,
  "sims": [
    {
      "sim_slot": 1,
      "carrier_name": "Jio 5G",
      "phone_number": "+910000000000",
      "availability": "Available",
      "network_status": "5G SA",
      "sms_permission": true
    }
  ]
}
```

#### D. Claim Pending SMS Jobs (With Atomic 3-Minute Lease)
Triggered whenever an FCM push notification with data `{"type": "NEW_SMS_JOB"}` arrives OR every 30 seconds via background worker.
- Endpoint: GET /v1/devices/{device_id}/jobs/pending?limit=5
- Headers:
  - X-Device-Id: {device_id}
  - X-Device-Token: {device_token}
- Response (200 OK):
```json
{
  "success": true,
  "jobs": [
    {
      "job_id": "job_385dd21a70c7f3d6",
      "parent_bulk_job_id": null,
      "sim_slot": 1,
      "recipient": "+910000000000",
      "message": "Your OTP code is 482910.",
      "priority": "high",
      "lease_expires_at": "2026-11-02T08:20:40.951Z"
    }
  ]
}
```

#### E. Reporting Actual Hardware SMS Result
After `SmsManager` completes dispatch via `PendingIntent`:
- Endpoint: POST /v1/devices/{device_id}/jobs/{job_id}/result
- Headers:
  - X-Device-Id: {device_id}
  - X-Device-Token: {device_token}
- Request Body on Success:
```json
{
  "status": "sent"
}
```
- Request Body on Failure / Error:
```json
{
  "status": "failed",
  "error_code": "RESULT_ERROR_GENERIC_FAILURE",
  "error_message": "Radio interface reported failure"
}
```

---

### 4. MULTI-SIM CELLULAR TRANSMISSION LOGIC
In Android, send SMS using the modern `SubscriptionManager` API:
```kotlin
val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
val activeSubs = subscriptionManager.activeSubscriptionInfoList

// Find subscription matching target sim_slot (1 or 2)
val targetSubInfo = activeSubs.firstOrNull { it.simSlotIndex + 1 == job.simSlot }
val subId = targetSubInfo?.subscriptionId ?: SubscriptionManager.getDefaultSmsSubscriptionId()

val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    context.getSystemService(SmsManager::class.java).createForSubscriptionId(subId)
} else {
    @Suppress("DEPRECATION")
    SmsManager.getSmsManagerForSubscriptionId(subId)
}

val sentIntent = PendingIntent.getBroadcast(
    context,
    job.jobId.hashCode(),
    Intent(ACTION_SMS_SENT).putExtra("JOB_ID", job.jobId),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

smsManager.sendTextMessage(job.recipient, null, job.message, sentIntent, null)
```

Handle the `BroadcastReceiver` for `ACTION_SMS_SENT`:
- If `resultCode == Activity.RESULT_OK` -> Report `status: "sent"`
- Else -> Report `status: "failed"` with appropriate error code:
  - `RESULT_ERROR_GENERIC_FAILURE`
  - `RESULT_ERROR_NO_SERVICE`
  - `RESULT_ERROR_NULL_PDU`
  - `RESULT_ERROR_RADIO_OFF`
  - `RESULT_ERROR_LIMIT_EXCEEDED`

---

### 5. APPLICATION UI SCREENS (Jetpack Compose)
Design a sleek, modern dark-themed industrial UI (Deep Slate #0F172A and Indigo #6366F1):

1. **Onboarding / Pairing Screen (Unpaired State)**:
   - Fullscreen camera viewfinder with a clean scanning reticle for scanning the QR code from the website.
   - Tab / Toggle to "Enter 6-Digit Code" manually.
   - Server URL configuration toggle (defaults to live URL).
   - Instant pairing button that hits `/v1/devices/pairing/verify`.

2. **Main Gateway Console (Paired State)**:
   - Header with Device Name, Device ID, and "Online / Running" status badge.
   - Dual SIM Card Status Cards:
     - SIM 1: Carrier Name, Network Type (5G / LTE), Phone Number, SMS Permission.
     - SIM 2: Carrier Name, Network Type, Phone Number, SMS Permission.
   - Live Transmission Counters:
     - Total Dispatched, Pending in Queue, Failed, Today's Count.
   - Recent SMS Transmission Log list with timestamps and recipient numbers.
   - "Test Send" button to verify local cellular radio immediately.
   - Unpair / Reset Device confirmation dialog.

3. **Background Foreground Service**:
   - Persistent notification with channel ID `"hwx_gateway_service"`.
   - Title: "HWX Gateway Active"
   - Body: "Listening for inbound SMS dispatch jobs on SIM 1 & SIM 2".

---

### 6. ANDROID MANIFEST & REQUIRED PERMISSIONS
Include all mandatory permissions in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

### 7. GRADLE DEPENDENCIES (app/build.gradle.kts)
Use modern libraries:
- Jetpack Compose + Material 3
- CameraX + Google ML Kit Barcode Scanning (`com.google.mlkit:barcode-scanning:17.3.0`)
- Firebase BOM (`com.google.firebase:firebase-bom:33.7.0`)
- Firebase Messaging (`com.google.firebase:firebase-messaging-ktx`)
- Retrofit 2 + OkHttp 3 + Kotlinx Serialization / Gson
- AndroidX WorkManager (`androidx.work:work-runtime-ktx:2.9.1`)
- AndroidX Security Crypto (`androidx.security:security-crypto:1.1.0-alpha06`)

Build the complete codebase with all Kotlin files, services, receivers, and Compose screens ready to compile into an APK.
```
