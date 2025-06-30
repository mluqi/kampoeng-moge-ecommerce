"use client";

import { SessionProvider } from "next-auth/react";
import { AppContextProvider } from "../contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UserAuthProvider>
          <AppContextProvider>
            <ProductProvider>
              <CategoryProvider>{children}</CategoryProvider>
            </ProductProvider>
          </AppContextProvider>
        </UserAuthProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
