// src/components/SignOut.js
import { auth } from "../config/firebase.config";
import { signOut } from 'firebase/auth'


export function SignOut() {
    return signOut(auth)
        .catch(err => {
            console.error('Error signing out:', err.message);
            throw err; 
        });
}