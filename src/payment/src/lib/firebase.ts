import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAx5s8ESxTyOXHKqy3RAro1KKha-PtyoN0",
  authDomain: "ment-test-e0823.firebaseapp.com",
  projectId: "ment-test-e0823",
  storageBucket: "ment-test-e0823.firebasestorage.app",
  messagingSenderId: "1082441578310",
  appId: "1:1082441578310:web:b048456a9bc80f34965747",
  measurementId: "G-2QYV6R12EG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };