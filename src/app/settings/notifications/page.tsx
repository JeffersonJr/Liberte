"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, MessageSquare, Heart, UserPlus, Zap } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { liberteGetProfile, liberteUpdateProfile } from "@/lib/liberte/profile";

export default function NotificationsSettingsPage() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        mentions: true,
        replies: true,
        likes: true,
        follows: true,
        messages: true,
        marketing: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadPreferences();
        }
    }, [user]);

    async function loadPreferences() {
        try {
            const profile = await liberteGetProfile(user!.id);
            if (profile.preferences) {
                setPreferences({ ...preferences, ...profile.preferences });
            }
        } catch (error) {
            console.error("Error loading preferences:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function togglePreference(key: string) {
        const newPrefs = { ...preferences, [key]: !preferences[key as keyof typeof preferences] };
        setPreferences(newPrefs);

        setIsSaving(true);
        try {
            await liberteUpdateProfile(user!.id, { preferences: newPrefs } as any);
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex justify-center">
            <Sidebar onCompose={() => { }} />

            <main className="flex-grow max-w-2xl border-x border-border min-h-screen">
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
                    <Link href="/settings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-serif text-2xl font-bold tracking-tighter">Notifications</h1>
                </header>

                <div className="p-6 space-y-8">
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans leading-none">Activity</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border border border-border">
                            <NotificationToggle
                                icon={<Zap size={20} />}
                                label="Mentions"
                                description="When someone mentions you in a post"
                                active={preferences.mentions}
                                onToggle={() => togglePreference('mentions')}
                            />
                            <NotificationToggle
                                icon={<MessageSquare size={20} />}
                                label="Replies"
                                description="When someone replies to your posts"
                                active={preferences.replies}
                                onToggle={() => togglePreference('replies')}
                            />
                            <NotificationToggle
                                icon={<Heart size={20} />}
                                label="Likes"
                                description="When someone likes your content"
                                active={preferences.likes}
                                onToggle={() => togglePreference('likes')}
                            />
                            <NotificationToggle
                                icon={<UserPlus size={20} />}
                                label="Follows"
                                description="When someone starts following you"
                                active={preferences.follows}
                                onToggle={() => togglePreference('follows')}
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans leading-none">Messages</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border border border-border">
                            <NotificationToggle
                                icon={<Bell size={20} />}
                                label="Direct Messages"
                                description="New private messages from other users"
                                active={preferences.messages}
                                onToggle={() => togglePreference('messages')}
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans leading-none">Other</h2>
                        <div className="glass rounded-3xl overflow-hidden divide-y divide-border border border-border">
                            <NotificationToggle
                                icon={<Zap size={20} />}
                                label="Marketing"
                                description="News, updates, and featured content"
                                active={preferences.marketing}
                                onToggle={() => togglePreference('marketing')}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function NotificationToggle({ icon, label, description, active, onToggle }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    active: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 transition-colors">
            <div className="flex items-center gap-4">
                <div className="text-muted-foreground">{icon}</div>
                <div>
                    <h3 className="font-bold leading-none mb-1">{label}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
            >
                <motion.div
                    animate={{ x: active ? 26 : 2 }}
                    className={`absolute top-1 w-4 h-4 rounded-full ${active ? 'bg-background' : 'bg-muted-foreground'}`}
                />
            </button>
        </div>
    );
}
