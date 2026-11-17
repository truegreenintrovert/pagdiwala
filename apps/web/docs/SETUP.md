# Setup Guide

## Web Development Setup

### Prerequisites
1. Node.js 20 or higher
2. npm or yarn
3. Git
4. GitHub account
5. Supabase account

### Local Development
1. Clone the repository:
```bash
git clone https://github.com/truegreenintrovert/pagdiwala.git
cd pagdiwala
```

2. Install dependencies:
```bash
npm install
```

3. Copy the repository-root `.env.example` to `.env` and set the values from
   **Supabase Dashboard → Project Settings → API**:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

These `VITE_` values are included in the browser build, so use only the
Supabase URL and public anon/publishable key. Never put the service-role key
in this file or in frontend code. Keep `.env` out of Git; it is ignored by
the repository.

4. Start development server:
```bash
npm run dev
```

### Supabase Edge Functions

The registration flow uses the `auth` Edge Function so the service-role key
never reaches the browser. Deploy it to the same Supabase project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy auth --no-verify-jwt
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by
Supabase to the deployed function. Never add the service-role key to `.env` or
frontend code.

### Order email notifications

Order confirmations and status updates are sent by the `send-email` Edge
Function. This keeps customer data and email credentials off the browser.
Create a Resend account, verify the `pagdiwala.com` sending domain, then set
the function secrets in the linked Supabase project:

```bash
npx supabase secrets set RESEND_API_KEY=re_your_key EMAIL_FROM="Pagdiwala <noreply@pagdiwala.com>"
npx supabase functions deploy send-email
```

The `EMAIL_FROM` address must use a domain verified in Resend. If these secrets
are not set, orders still save successfully, but the notification email will
not be sent.

## Mobile Development Setup

### Android Prerequisites
1. Android Studio
2. Android SDK
3. Java Development Kit (JDK)

### iOS Prerequisites (Mac only)
1. Xcode
2. CocoaPods
3. iOS Developer Account

### Building Mobile Apps

1. Build web app:
```bash
npm run build
```

2. Add platforms:
```bash
npx cap add android
npx cap add ios  # Mac only
```

3. Open in IDE:
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

## Deployment

### Web Deployment
The production build needs `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` available in the build environment. Configure them
as build-time environment variables or GitHub Actions secrets for your host.
The build publishes to `dist/apps/web`; upload that folder's contents to the
host's web root.

### Mobile Deployment

#### Android
1. Open in Android Studio
2. Configure signing
3. Build APK/Bundle
4. Submit to Play Store

#### iOS
1. Open in Xcode
2. Configure signing
3. Build archive
4. Submit to App Store

## Environment Setup

### Supabase Setup
1. Create new project
2. Get API credentials
3. Run database migrations
4. Configure authentication

### Admin Setup
1. Create admin user
2. Configure permissions
3. Set up dashboard access
