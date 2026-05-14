"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthProvider";
import Chatbot from "./Chatbot";

import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        {children}
        <Chatbot />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
