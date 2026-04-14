"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { store } from "@/store";

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>{children}</Provider>
    </GoogleOAuthProvider>
  );
}