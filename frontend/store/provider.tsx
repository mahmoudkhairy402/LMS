"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { store } from "@/store";
import { fetchMe, refreshAccessToken } from "@/store/thunks/authThunks";

interface StoreProviderProps {
  children: ReactNode;
}

function AuthBootstrap() {
  useEffect(() => {
    let isActive = true;

    const bootstrapAuth = async () => {
      try {
        const token = await store.dispatch(refreshAccessToken()).unwrap();
        if (!isActive) {
          return;
        }

        await store.dispatch(fetchMe(token)).unwrap();
      } catch {
        // No valid refresh session on startup.
      }
    };

    bootstrapAuth();

    return () => {
      isActive = false;
    };
  }, []);

  return null;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <Provider store={store}>
        <AuthBootstrap />
        {children}
      </Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <AuthBootstrap />
        {children}
      </Provider>
    </GoogleOAuthProvider>
  );
}