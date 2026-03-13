"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Feed } from "@/components/Feed";
import { SkeletonPost } from "@/components/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";
import { LibertePostCompose } from "@/components/liberte/PostCompose";
import { Search, TrendingUp, Users, Hash } from "lucide-react";
import {
    liberteSearchPosts,
    liberteSearchUsers,
    liberteGetTrendingPosts,
    liberteGetDiscoveryFeed
} from "@/lib/liberte/explore";
import debounce from "lodash/debounce";

import { useAuth } from "@/components/auth/AuthProvider";
import { liberteFollowUser } from "@/lib/liberte/profile";
import { liberteCreatePost } from "@/lib/liberte/posts";

export default function ExplorePage() {
    const { user: currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"discovery" | "trending" | "users">("discovery");

    const handleFollowUser = async (targetId: string) => {
        if (!currentUser) return;
        try {
            await liberteFollowUser(currentUser.id, targetId);
            // Update UI state if needed
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    const handleCreatePost = async (content: string, media: string[]) => {
        if (!currentUser) return;
        try {
            await liberteCreatePost(currentUser.id, content, media);
            setIsComposeOpen(false);
            if (activeTab === "discovery") loadDiscovery();
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const loadDiscovery = async () => {
        setIsLoading(true);
        try {
            const data = await liberteGetDiscoveryFeed();
            setPosts(data || []);
        } catch (error) {
            console.error("Error loading discovery feed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrending = async () => {
        setIsLoading(true);
        try {
            const data = await liberteGetTrendingPosts();
            setPosts(data || []);
        } catch (error) {
            console.error("Error loading trending posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            if (activeTab === "discovery") loadDiscovery();
            else if (activeTab === "trending") loadTrending();
            return;
        }

        setIsLoading(true);
        try {
            const [postResults, userResults] = await Promise.all([
                liberteSearchPosts(query),
                liberteSearchUsers(query)
            ]);
            setPosts(postResults || []);
            setUsers(userResults || []);
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((query: string) => performSearch(query), 500),
        [activeTab]
    );

    useEffect(() => {
        if (!searchQuery) {
            if (activeTab === "discovery") loadDiscovery();
            else if (activeTab === "trending") loadTrending();
        }
    }, [activeTab, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center">
            <Sidebar onCompose={() => setIsComposeOpen(true)} />

            <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen relative">
                <LibertePostCompose
                    isOpen={isComposeOpen}
                    onClose={() => setIsComposeOpen(false)}
                    onSubmit={handleCreatePost}
                />

                <header className="glass sticky top-0 z-50 px-4 py-4 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search Liberté"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                        />
                    </div>

                    {!searchQuery && (
                        <div className="flex gap-8 px-2">
                            <button
                                onClick={() => setActiveTab("discovery")}
                                className={`pb-2 font-bold transition-colors relative ${activeTab === "discovery" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Discovery
                                {activeTab === "discovery" && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("trending")}
                                className={`pb-2 font-bold transition-colors relative ${activeTab === "trending" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Trending
                                {activeTab === "trending" && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                                )}
                            </button>
                        </div>
                    )}

                    {searchQuery && (
                        <div className="flex gap-8 px-2">
                            <button
                                onClick={() => setActiveTab("discovery")} // Use discovery as 'posts' tab
                                className={`pb-2 font-bold transition-colors relative ${activeTab === "discovery" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Posts
                                {activeTab === "discovery" && (
                                    <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`pb-2 font-bold transition-colors relative ${activeTab === "users" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                People
                                {activeTab === "users" && (
                                    <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-full" />
                                )}
                            </button>
                        </div>
                    )}
                </header>

                <div className="pb-24 sm:pb-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 space-y-4"
                            >
                                <SkeletonPost />
                                <SkeletonPost />
                                <SkeletonPost />
                            </motion.div>
                        ) : activeTab === "users" && searchQuery ? (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="divide-y divide-zinc-900"
                            >
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar_url || "/logo.png"} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-zinc-800" />
                                                <div>
                                                    <p className="font-bold text-zinc-100">{user.full_name}</p>
                                                    <p className="text-zinc-500">@{user.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleFollowUser(user.id)}
                                                className="bg-zinc-100 text-black px-4 py-1.5 rounded-full font-bold text-sm hover:bg-white transition-colors"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-zinc-500">
                                        No people found for "{searchQuery}"
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {posts.length > 0 ? (
                                    <Feed posts={posts} />
                                ) : (
                                    <div className="p-8 text-center text-zinc-500">
                                        No results found
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <aside className="hidden xl:block w-[350px] sticky top-0 h-screen p-6 overflow-y-auto">
                <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800">
                    <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-zinc-100" />
                        Trends for you
                    </h2>
                    <div className="space-y-6">
                        <div className="group cursor-pointer">
                            <p className="text-zinc-500 text-xs flex items-center justify-between">
                                Trending in Technology
                                <Hash size={12} />
                            </p>
                            <p className="font-bold text-zinc-100 group-hover:underline">#LiberteProject</p>
                            <p className="text-zinc-500 text-xs">24.5k posts</p>
                        </div>
                        <div className="group cursor-pointer">
                            <p className="text-zinc-500 text-xs flex items-center justify-between">
                                Trending in Design
                                <Hash size={12} />
                            </p>
                            <p className="font-bold text-zinc-100 group-hover:underline">#Glassmorphism</p>
                            <p className="text-zinc-500 text-xs">18.2k posts</p>
                        </div>
                        <div className="group cursor-pointer">
                            <p className="text-zinc-500 text-xs flex items-center justify-between">
                                Trending in Art
                                <Hash size={12} />
                            </p>
                            <p className="font-bold text-zinc-100 group-hover:underline">#Minimalism</p>
                            <p className="text-zinc-500 text-xs">12.1k posts</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
