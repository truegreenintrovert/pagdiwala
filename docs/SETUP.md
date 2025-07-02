
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

3. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

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
The web app is automatically deployed to GitHub Pages when pushing to the `gh-pages` branch.

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
