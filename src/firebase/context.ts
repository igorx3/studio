"use client";
import { createContext } from "react";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

export const FirebaseContext = createContext<{
  app?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
  storage?: FirebaseStorage;
  isInitializing: boolean;
}>({
  isInitializing: true,
});
