import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxwYrf6I3ShBqo68bEFXOJ3HIeM8RLW1Q",
  authDomain: "total-isomer-3fbwx.firebaseapp.com",
  projectId: "total-isomer-3fbwx",
  storageBucket: "total-isomer-3fbwx.firebasestorage.app",
  messagingSenderId: "296296231603",
  appId: "1:296296231603:web:e9f6ef788dc8ba0417f6c6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-ubuhhealthchecku-15391fba-9eb7-425f-89fd-38958b0c1086");
