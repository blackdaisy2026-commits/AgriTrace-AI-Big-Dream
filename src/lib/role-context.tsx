"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export type Role = "farmer" | "processor" | "retailer" | "consumer" | "regulator" | "tahsildar" | null;

export interface UserProfile {
    id: string;
    role: Role;
    name: string;
    email: string;
    mobileNo?: string;
    walletAddress?: string;
    location?: string;
    district?: string;
    taluk?: string;
    village?: string;
    aadhaarNumber?: string;
    uzhavarCardNumber?: string;
    landDetails?: string;
    cropDetails?: string;
}

interface RoleContextType {
    user: UserProfile | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    apiBaseUrl: string;
    refreshProfile: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType>({
    user: null,
    token: null,
    login: async () => false,
    logout: () => { },
    isAuthenticated: false,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    refreshProfile: async () => { },
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        const storedUser = localStorage.getItem("agri-user");
        const storedToken = localStorage.getItem("agri-token");
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch {
                localStorage.removeItem("agri-user");
                localStorage.removeItem("agri-token");
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.status === 'success') {
                const userData = {
                    id: data.data.user.id,
                    name: data.data.user.name,
                    email: data.data.user.email,
                    role: data.data.user.role,
                    district: data.data.user.district,
                    taluk: data.data.user.taluk
                };
                setUser(userData);
                setToken(data.token);
                localStorage.setItem("agri-user", JSON.stringify(userData));
                localStorage.setItem("agri-token", data.token);
                toast.success(`Welcome back, ${userData.name}!`);
                return true;
            } else {
                toast.error(data.message || "Login failed");
                return false;
            }
        } catch (err) {
            toast.error("Could not connect to backend server");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("agri-user");
        localStorage.removeItem("agri-token");
        toast.success("Logged out successfully");
        router.push("/");
    };

    const refreshProfile = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${apiBaseUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                const fullUser = {
                    ...data.data.user,
                    id: data.data.user._id // Map MongoDB _id to id
                };
                setUser(fullUser);
                localStorage.setItem("agri-user", JSON.stringify(fullUser));
            }
        } catch (err) {
            console.error("Failed to refresh profile:", err);
        }
    };

    return (
        <RoleContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, apiBaseUrl, refreshProfile }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
