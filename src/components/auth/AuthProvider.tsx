"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
});

import { supabase } from "@/lib/supabase";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            const authUser = session?.user ?? null;
            setUser(authUser);

            if (authUser) {
                // Ensure profile exists
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (profileError) {
                    console.error("Error checking profile:", profileError);
                }

                if (!profile) {
                    console.log("Profile missing, creating one for:", authUser.id);
                    const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 5)}`;
                    await supabase.from('profiles').insert({
                        id: authUser.id,
                        username: username,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        avatar_url: authUser.user_metadata?.avatar_url
                    });
                }
            }

            setIsLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            const authUser = session?.user ?? null;
            setUser(authUser);
            setIsLoading(false);

            if (authUser && _event === "SIGNED_IN") {
                // Re-check profile on sign in
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (!profile) {
                    const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 5)}`;
                    await supabase.from('profiles').insert({
                        id: authUser.id,
                        username: username,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        avatar_url: authUser.user_metadata?.avatar_url
                    });
                }
                router.refresh();
            }
            if (_event === "SIGNED_OUT") {
                router.push("/login");
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
