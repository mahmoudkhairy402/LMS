"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { store } from "@/store";
import { fetchMe } from "@/store/thunks/authThunks";

interface StoreProviderProps {
  children: ReactNode;
}

function AuthBootstrap() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let isActive = true;

    const bootstrapAuth = async () => {
      try {
        // We no longer manually refresh the token here.
        // We just fetch the user. If the token is expired, the backend returns 401,
        // and our new Axios Interceptor will automatically pause this request,
        // refresh the token, and retry it seamlessly!
        await store.dispatch(fetchMe()).unwrap();
      } catch {
        // No valid session on startup or refresh failed.
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