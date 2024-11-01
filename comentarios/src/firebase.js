// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFQSxjWQ5Pc98-6sKxR2sgMO43LSFfZWQ",
  authDomain: "comentarios-ad929.firebaseapp.com",
  projectId: "comentarios-ad929",
  storageBucket: "comentarios-ad929.firebasestorage.app",
  messagingSenderId: "637327172231",
  appId: "1:637327172231:web:059d6375b63e83fe3d4e22",
  measurementId: "G-HW7Z7N43L9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Autenticación
export const db = getFirestore(app); // Firestore

// Función para registrar un usuario con correo y contraseña
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Función para iniciar sesión con correo y contraseña
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Función para cerrar sesión
export const logOut = () => signOut(auth);
