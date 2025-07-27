"use client";

import { SessionProvider } from "next-auth/react";
import { AppContextProvider } from "../contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { CartProvider } from "@/contexts/CartContext";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UserAuthProvider>
          <ChatProvider>
            <CartProvider>
              <AppContextProvider>
                <ProductProvider>
                  <CategoryProvider>{children}</CategoryProvider>
                </ProductProvider>
              </AppContextProvider>
            </CartProvider>
          </ChatProvider>
        </UserAuthProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
