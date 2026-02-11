'use client';
import React, { ReactNode, useEffect, useState } from "react";
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from "firebase/storage";
import { FirebaseContext } from "./context";

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [app, setApp] = useState<FirebaseApp | undefined>(undefined);
    const [auth, setAuth] = useState<Auth | undefined>(undefined);
    const [firestore, setFirestore] = useState<Firestore | undefined>(undefined);
    const [storage, setStorage] = useState<FirebaseStorage | undefined>(undefined);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        
        if (firebaseConfig.apiKey) {
            const appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            setApp(appInstance);
            setAuth(getAuth(appInstance));
            setFirestore(getFirestore(appInstance));
            setStorage(getStorage(appInstance));
        }
    }, []);

    return (
        <FirebaseContext.Provider value={{ app, auth, firestore, storage }}>
        {children}
        </FirebaseContext.Provider>
    );
}
