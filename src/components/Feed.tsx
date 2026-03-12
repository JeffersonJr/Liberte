"use client";

import { PostCard } from "./PostCard";

interface FeedProps {
    posts: any[];
}

export function Feed({ posts }: FeedProps) {
    return (
        <div className="flex flex-col">
            {posts.map((post) => {
                const postData = {
                    id: post.id,
                    content: post.content,
                    media: post.media || [],
                    likes: post.likes_count || 0,
                    replies: post.replies_count || 0,
                    reposts: post.reposts_count || 0,
                    timestamp: new Date(post.created_at).toLocaleDateString(),
                    user: {
                        name: post.profiles?.full_name || "Anonymous",
                        handle: post.profiles?.username || "anonymous",
                        avatar: post.profiles?.avatar_url || "https://i.pravatar.cc/150"
                    },
                    isOwn: false // Explicitly set or handle based on auth
                };

                return (
                    <PostCard
                        key={post.id}
                        post={postData as any}
                    />
                );
            })}

            {posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <p className="text-xl font-serif">No publications yet.</p>
                    <p className="text-sm">Be the first to share something!</p>
                </div>
            )}
        </div>
    );
}
