"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { LibertePostCompose } from "@/components/liberte/PostCompose";
import {
    Heart,
    MessageCircle,
    Repeat2,
    UserPlus,
    Bell,
    Check
} from "lucide-react";
import {
    liberteGetNotifications,
    liberteMarkNotificationAsRead
} from "@/lib/liberte/notifications";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<"all" | "mentions">("all");

    useEffect(() => {
        if (!user) return;

        async function loadNotifications() {
            setIsLoading(true);
            try {
                const data = await liberteGetNotifications(user!.id);
                setNotifications(data || []);
            } catch (error) {
                console.error("Error loading notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadNotifications();
    }, [user]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await liberteMarkNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={18} className="text-rose-500 fill-rose-500" />;
            case 'comment': return <MessageCircle size={18} className="text-sky-500" />;
            case 'repost': return <Repeat2 size={18} className="text-emerald-500" />;
            case 'follow': return <UserPlus size={18} className="text-zinc-100" />;
            default: return <Bell size={18} className="text-zinc-500" />;
        }
    };

    const getMessage = (type: string, actorName: string) => {
        switch (type) {
            case 'like': return "liked your post";
            case 'comment': return "replied to your post";
            case 'repost': return "reposted your post";
            case 'follow': return "followed you";
            default: return "interacted with you";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center">
            <Sidebar onCompose={() => setIsComposeOpen(true)} />

            <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen relative">
                <LibertePostCompose
                    isOpen={isComposeOpen}
                    onClose={() => setIsComposeOpen(false)}
                    onSubmit={async () => { }}
                />

                <header className="glass sticky top-0 z-50 px-4 py-4 backdrop-blur-xl">
                    <h1 className="font-serif text-2xl font-bold text-zinc-100 mb-4">Notifications</h1>
                    <div className="flex gap-8 px-2">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`pb-2 font-bold transition-colors relative ${activeFilter === "all" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            All
                            {activeFilter === "all" && (
                                <motion.div layoutId="notifTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveFilter("mentions")}
                            className={`pb-2 font-bold transition-colors relative ${activeFilter === "mentions" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Mentions
                            {activeFilter === "mentions" && (
                                <motion.div layoutId="notifTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                            )}
                        </button>
                    </div>
                </header>

                <div className="pb-24 sm:pb-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="divide-y divide-zinc-900"
                            >
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 flex gap-4 animate-pulse">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex-shrink-0" />
                                        <div className="flex-grow space-y-2 py-1">
                                            <div className="h-4 bg-zinc-900 rounded w-3/4" />
                                            <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="divide-y divide-zinc-900"
                            >
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 flex gap-4 transition-colors cursor-pointer group hover:bg-zinc-900/30 ${!notif.is_read ? 'bg-zinc-900/10' : ''}`}
                                            onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="mt-1">{getIcon(notif.type)}</div>
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <img
                                                        src={notif.actor?.avatar_url || "/logo.png"}
                                                        alt={notif.actor?.username}
                                                        className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                                                    />
                                                    <div className="flex-grow min-w-0">
                                                        <span className="font-bold text-zinc-100 truncate inline-block max-w-[150px]">
                                                            {notif.actor?.full_name}
                                                        </span>
                                                        <span className="text-zinc-500 ml-1">
                                                            {getMessage(notif.type, notif.actor?.full_name)}
                                                        </span>
                                                        <span className="text-zinc-600 text-sm ml-2">
                                                            · {formatDistanceToNow(new Date(notif.created_at))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {notif.post && (
                                                    <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
                                                        {notif.post.content}
                                                    </p>
                                                )}

                                                {!notif.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notif.id);
                                                        }}
                                                        className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Check size={12} />
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <Bell size={48} className="mx-auto text-zinc-800 mb-4" />
                                        <p className="text-zinc-500 font-medium">No notifications yet!</p>
                                        <p className="text-zinc-600 text-sm">When people interact with you, you'll see it here.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <aside className="hidden xl:block w-[350px] sticky top-0 h-screen p-6 overflow-y-auto">
                <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800">
                    <h2 className="font-serif text-xl font-bold mb-4">Notification Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-zinc-300 text-sm">Push Notifications</span>
                            <div className="w-10 h-5 bg-zinc-100 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <span className="text-zinc-300 text-sm">Email Digest</span>
                            <div className="w-10 h-5 bg-zinc-800 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
