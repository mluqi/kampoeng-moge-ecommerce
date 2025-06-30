"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Import useSession dan signOut
import api from "@/service/api";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user || null;
  const [profile, setProfile] = useState(null);
  const loading = status === "loading";

  useEffect(() => {
    if (user) {
      userProfile();
    }
  }, [user]);

  const userLogout = async () => {
    await signOut({ callbackUrl: "/account" });
  };

  const userProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data.user);
      return {
        success: true,
        message: "Profile fetched successfully",
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch user profile",
        data: null,
      };
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        userProfile,
        setUser: null,
        userLogout,
        loading,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
