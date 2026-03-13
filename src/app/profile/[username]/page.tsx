"use client";

import { useEffect, useState, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Feed } from "@/components/Feed";
import { SkeletonPost } from "@/components/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Link as LinkIcon,
    MapPin,
    ArrowLeft,
    MoreHorizontal,
    MessageCircle
} from "lucide-react";
import {
    liberteGetProfileByUsername,
    liberteGetUserPosts,
    liberteIsFollowing,
    liberteFollowUser,
    liberteUnfollowUser
} from "@/lib/liberte/profile";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            setIsLoading(true);
            try {
                const profileData = await liberteGetProfileByUsername(username);
                setProfile(profileData);

                if (profileData && currentUser) {
                    const [userPosts, followingStatus] = await Promise.all([
                        liberteGetUserPosts(profileData.id),
                        liberteIsFollowing(currentUser.id, profileData.id)
                    ]);
                    setPosts(userPosts || []);
                    setIsFollowing(followingStatus);
                } else if (profileData) {
                    const userPosts = await liberteGetUserPosts(profileData.id);
                    setPosts(userPosts || []);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [username, currentUser]);

    const handleFollowToggle = async () => {
        if (!profile || !currentUser) return;
        try {
            if (isFollowing) {
                await liberteUnfollowUser(currentUser.id, profile.id);
            } else {
                await liberteFollowUser(currentUser.id, profile.id);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center">
                <Sidebar onCompose={() => { }} />
                <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen py-12 flex justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-24 h-24 bg-zinc-900 rounded-full mb-4" />
                        <div className="h-6 bg-zinc-900 rounded w-32 mb-2" />
                        <div className="h-4 bg-zinc-900 rounded w-24" />
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center">
                <Sidebar onCompose={() => { }} />
                <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen flex items-center justify-center p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-zinc-100 mb-2">User not found</h2>
                        <p className="text-zinc-500 mb-6">The account you're looking for doesn't exist.</p>
                        <button
                            onClick={() => router.push("/explore")}
                            className="text-zinc-100 border border-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-900 transition-colors"
                        >
                            Back to Explore
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const isOwner = currentUser?.id === profile.id;

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center">
            <Sidebar onCompose={() => setIsComposeOpen(true)} />

            <main className="flex-grow max-w-2xl border-x border-zinc-900 min-h-screen relative">
                <header className="glass sticky top-0 z-50 px-4 py-2 backdrop-blur-xl flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-zinc-100">
                            {profile?.full_name || username}
                        </h1>
                        <p className="text-zinc-500 text-xs">
                            {`${posts.length} publications`}
                        </p>
                    </div>
                </header>

                <div className="pb-24 sm:pb-0">
                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className="h-48 bg-zinc-900" />
                            <div className="px-4 -mt-12 mb-4">
                                <div className="w-24 h-24 bg-zinc-800 rounded-full border-4 border-zinc-950" />
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="h-6 bg-zinc-900 rounded w-1/3" />
                                <div className="h-4 bg-zinc-900 rounded w-1/4" />
                                <div className="h-20 bg-zinc-900 rounded" />
                                <SkeletonPost />
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Banner */}
                            <div className="h-48 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Profile Info */}
                            <div className="px-4 relative mb-6">
                                <div className="flex justify-between items-end -mt-12 mb-4">
                                    <img
                                        src={profile.avatar_url || "/logo.png"}
                                        alt={profile.username}
                                        className="w-32 h-32 rounded-full border-4 border-zinc-950 bg-zinc-900 object-cover"
                                    />
                                    <div className="flex gap-2 mb-2">
                                        {isOwner ? (
                                            <button className="px-6 py-2 rounded-full font-bold text-sm border border-zinc-800 text-zinc-100 hover:bg-zinc-900 transition-all">
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/messages?user=${profile.id}`)}
                                                    className="p-2 rounded-full border border-zinc-800 text-zinc-100 hover:bg-zinc-900 transition-colors"
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={handleFollowToggle}
                                                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${isFollowing
                                                        ? 'border border-zinc-800 text-zinc-100 hover:bg-zinc-900'
                                                        : 'bg-zinc-100 text-black hover:bg-white'
                                                        }`}
                                                >
                                                    {isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                            </>
                                        )}
                                        <button className="p-2 rounded-full border border-zinc-800 text-zinc-100 hover:bg-zinc-900 transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-100">{profile.full_name}</h2>
                                    <p className="text-zinc-500">@{profile.username}</p>
                                </div>

                                {profile.bio && <p className="text-zinc-200 mb-4 whitespace-pre-wrap">{profile.bio}</p>}

                                <div className="flex flex-wrap gap-4 text-zinc-500 text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        <span>London, UK</span>
                                    </div>
                                    {profile.website && (
                                        <div className="flex items-center gap-1">
                                            <LinkIcon size={16} />
                                            <a href={profile.website} target="_blank" className="text-sky-500 hover:underline">
                                                {profile.website.replace("https://", "").replace("http://", "")}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>Joined March 2024</span>
                                    </div>
                                </div>

                                <div className="flex gap-6 text-sm">
                                    <button className="hover:underline">
                                        <span className="font-bold text-zinc-100">{profile.following_count}</span>
                                        <span className="text-zinc-500 ml-1">Following</span>
                                    </button>
                                    <button className="hover:underline">
                                        <span className="font-bold text-zinc-100">{profile.followers_count}</span>
                                        <span className="text-zinc-500 ml-1">Followers</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-zinc-900 mb-2">
                                <button className="flex-1 py-4 text-zinc-100 font-bold border-b-2 border-zinc-100">Publications</button>
                                <button className="flex-1 py-4 text-zinc-500 font-medium hover:bg-zinc-900/50 transition-colors">Replies</button>
                                <button className="flex-1 py-4 text-zinc-500 font-medium hover:bg-zinc-900/50 transition-colors">Highlights</button>
                                <button className="flex-1 py-4 text-zinc-500 font-medium hover:bg-zinc-900/50 transition-colors">Media</button>
                            </div>

                            <Feed posts={posts} />
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
