'use client';
import React, { ReactNode, useEffect, useState } from "react";
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { FirebaseContext } from "./context";

interface FirebaseServices {
    app?: FirebaseApp;
    auth?: Auth;
    firestore?: Firestore;
    storage?: FirebaseStorage;
    isInitializing: boolean;
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [services, setServices] = useState<FirebaseServices>({ isInitializing: true });
    
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
            setServices({
                app: appInstance,
                auth: getAuth(appInstance),
                firestore: getFirestore(appInstance),
                storage: getStorage(appInstance),
                isInitializing: false,
            });
        } else {
            console.error("Firebase config is missing.");
            setServices({ isInitializing: false });
        }
    }, []);

    return (
        <FirebaseContext.Provider value={services}>
            {children}
        </FirebaseContext.Provider>
    );
}
