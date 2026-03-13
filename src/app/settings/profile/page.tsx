"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Save, User as UserIcon, Globe, FileText, Camera } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { liberteGetProfile, liberteUpdateProfile, LiberteProfile } from "@/lib/liberte/profile";

export default function EditProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<LiberteProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [website, setWebsite] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    async function loadProfile() {
        try {
            const data = await liberteGetProfile(user!.id);
            setProfile(data);
            setFullName(data.full_name || "");
            setUsername(data.username || "");
            setBio(data.bio || "");
            setWebsite(data.website || "");
            setAvatarUrl(data.avatar_url || "");
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            await liberteUpdateProfile(user!.id, {
                full_name: fullName,
                username: username,
                bio: bio,
                website: website,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            } as any);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error updating profile' });
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
                <header className="glass sticky top-0 z-50 px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="font-serif text-2xl font-bold tracking-tighter">Edit Profile</h1>
                    </div>
                </header>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-foreground/5 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={40} className="text-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="w-full max-w-xs">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Avatar URL</label>
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-foreground/5 border border-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-foreground/5 border border-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Bio</label>
                                <div className="relative">
                                    <FileText size={18} className="absolute left-4 top-4 text-muted-foreground/50" />
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-foreground/5 border border-border rounded-2xl pl-12 pr-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Website</label>
                                <div className="relative">
                                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full bg-foreground/5 border border-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-foreground text-background font-bold py-4 rounded-2xl hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
