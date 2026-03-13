"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { useState } from "react";
import { LiberteCarousel } from "./liberte/Carousel";
import { LiberteContextMenu } from "./liberte/ContextMenu";

interface PostProps {
    post: {
        id: string;
        isOwn?: boolean;
        user: {
            name: string;
            handle: string;
            avatar: string;
        };
        content: string;
        media?: string[];
        aspectRatio?: "4/5" | "9/16" | "original";
        likes: number;
        replies: number;
        reposts: number;
        timestamp: string;
    };
}

export function PostCard({ post }: PostProps) {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-2xl mx-auto border-b border-border py-6 px-4 md:px-0 snap-start"
        >
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold leading-none text-foreground">{post.user.name}</span>
                            <span className="text-muted-foreground text-sm">@{post.user.handle}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-muted-foreground text-sm font-medium tracking-tight">
                                {post.timestamp}
                            </span>
                        </div>
                        <LiberteContextMenu isOwn={post.isOwn || false} />
                    </div>

                    <p className="text-foreground/90 text-[17px] leading-relaxed mb-4 whitespace-pre-wrap">
                        {post.content}
                    </p>

                    {post.media && post.media.length > 0 && (
                        <div className="mb-4">
                            <LiberteCarousel
                                images={post.media}
                                aspectRatio={post.aspectRatio === "9/16" ? "9/16" : "4/5"}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between max-w-md text-muted-foreground">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setIsLiked(!isLiked)}
                            className={`group flex items-center gap-2 transition-colors ${isLiked ? "text-rose-500" : "hover:text-rose-500"}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-rose-500/10">
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            </div>
                            <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            className="group flex items-center gap-2 hover:text-sky-500 transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-sky-500/10">
                                <MessageCircle size={20} />
                            </div>
                            <span className="text-sm font-medium">{post.replies}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            className="group flex items-center gap-2 hover:text-emerald-500 transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-emerald-500/10">
                                <Repeat2 size={20} />
                            </div>
                            <span className="text-sm font-medium">{post.reposts}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            className="group flex items-center gap-2 hover:text-foreground transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-foreground/10">
                                <Share2 size={20} />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
