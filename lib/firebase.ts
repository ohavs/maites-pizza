import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC2xC9HNk4yL7LUErOjf9_PyVqAJxKnoZM",
  authDomain: "maites-pizza.firebaseapp.com",
  projectId: "maites-pizza",
  storageBucket: "maites-pizza.firebasestorage.app",
  messagingSenderId: "120844031915",
  appId: "1:120844031915:web:236fa92ad37c777de6e4ee",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
