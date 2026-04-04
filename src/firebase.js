import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIU4taXr6pDM9fnBKw1vqTQ1abIvi83Do",
  authDomain: "el-andino-mate-app.firebaseapp.com",
  projectId: "el-andino-mate-app",
  storageBucket: "el-andino-mate-app.firebasestorage.app",
  messagingSenderId: "682141370061",
  appId: "1:682141370061:web:aa6add951a33c0516f8b84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// Set custom parameters if needed
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
