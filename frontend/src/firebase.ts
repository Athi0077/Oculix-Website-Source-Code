// Firebase web configuration is public. Payment secrets remain server-only.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBeONJWwFmyluYCj4PKi3Ilj1U70yRg5nM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'oculix-website.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'oculix-website',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'oculix-website.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '252932408792',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:252932408792:web:ff986fd113b10bf5e09ead',
};
