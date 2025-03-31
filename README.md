# Notorium AI

Transform your lectures into comprehensive notes with AI-powered transcription.

## Firebase Setup Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add a Web App to your project:
   - Click on the web icon (`</>`)
   - Register your app with a name
   - Firebase will show you configuration values

4. Enable Authentication:
   - Go to Authentication in Firebase Console
   - Click "Get Started"
   - Enable Email/Password and Google sign-in methods

5. Copy Configuration Values:
   Find these values in your Firebase project settings:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=            (from firebaseConfig.apiKey)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=        (from firebaseConfig.authDomain)
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=         (from firebaseConfig.projectId)
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=     (from firebaseConfig.storageBucket)
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=(from firebaseConfig.messagingSenderId)
   NEXT_PUBLIC_FIREBASE_APP_ID=             (from firebaseConfig.appId)
   ```

6. Create a `.env.local` file in your project root and paste these values

7. Restart the development server after adding the environment variables

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
