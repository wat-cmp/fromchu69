import { initializeApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-critical transport reconnect stream warnings from developer overlay
setLogLevel('error');

const app = initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long polling to prevent WebChannel RPC Listen transport drops in proxy/iframe
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
