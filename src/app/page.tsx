"use client";

import { useEffect, useState } from "react";
import { MomentsBar } from "@/components/MomentsBar";
import { Feed } from "@/components/Feed";
import { SkeletonMoments, SkeletonPost } from "@/components/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";
import { LibertePostCompose } from "@/components/liberte/PostCompose";
import { Sidebar } from "@/components/Sidebar";
import { liberteGetPosts, liberteCreatePost } from "@/lib/liberte/posts";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await liberteGetPosts();
        setPosts(data || []);
      } catch (error) {
        console.error("Error loading posts:", JSON.stringify(error, null, 2));
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  const handleCreatePost = async (content: string, media: string[]) => {
    try {
      const userId = "00000000-0000-0000-0000-000000000000";
      const newPost = await liberteCreatePost(userId, content, media);
      if (newPost) {
        setPosts([newPost, ...posts]);
      }
      setIsComposeOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Limit is 250 characters.");
    }
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

        <header className="sm:hidden glass sticky top-0 z-50 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Liberté" className="w-8 h-8 object-contain" />
            <h1 className="font-serif text-2xl font-bold tracking-tighter text-zinc-100">
              Liberté
            </h1>
          </div>
          <Link href="/settings" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500" />
          </Link>
        </header>

        <div className="pb-24 sm:pb-0">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkeletonMoments />
                <div className="space-y-4">
                  <SkeletonPost />
                  <SkeletonPost />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MomentsBar />
                <Feed posts={posts} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full flex gap-12 items-center z-50 shadow-2xl">
          <motion.button whileTap={{ scale: 0.9 }} className="text-zinc-100">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsComposeOpen(true)}
            className="w-12 h-12 bg-zinc-100 text-black rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus size={28} />
          </motion.button>

          <Link href="/settings">
            <motion.button whileTap={{ scale: 0.9 }} className="text-zinc-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </motion.button>
          </Link>
        </nav>
      </main>

      <aside className="hidden xl:block w-[350px] sticky top-0 h-screen p-6 overflow-y-auto">
        <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800">
          <h2 className="font-serif text-xl font-bold mb-4">What's happening</h2>
          <div className="space-y-4">
            <div className="hover:bg-zinc-800/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
              <p className="font-bold">#liberte</p>
              <p className="text-zinc-500 text-sm">12.5k publications</p>
            </div>
            <div className="hover:bg-zinc-800/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
              <p className="font-bold">#webdesign</p>
              <p className="text-zinc-500 text-sm">8.2k publications</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
