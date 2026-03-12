"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LiberteMomentView } from "./liberte/MomentView";
import { liberteGetMoments } from "@/lib/liberte/moments";

export function MomentsBar() {
    const [moments, setMoments] = useState<any[]>([]);
    const [selectedMomentIdx, setSelectedMomentIdx] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadMoments() {
            try {
                const data = await liberteGetMoments();
                setMoments(data || []);
            } catch (error) {
                console.error("Error loading moments:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadMoments();
    }, []);

    const selectedMoment = selectedMomentIdx !== null ? {
        id: moments[selectedMomentIdx].id,
        username: moments[selectedMomentIdx].profiles?.username || "anonymous",
        avatar: moments[selectedMomentIdx].profiles?.avatar_url || "https://i.pravatar.cc/150",
        media: moments[selectedMomentIdx].media_url,
        views: 0
    } : null;

    if (isLoading) return <div className="h-28" />; // Loading placeholder

    return (
        <div className="w-full py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 px-4 min-w-max">
                {moments.map((moment, idx) => (
                    <motion.div
                        key={moment.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMomentIdx(idx)}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                        <div
                            className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 to-rose-600"
                        >
                            <div className="p-[2px] bg-black rounded-full">
                                <img
                                    src={moment.profiles?.avatar_url || "https://i.pravatar.cc/150"}
                                    alt={moment.profiles?.username}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium truncate w-16 text-center">
                            {moment.profiles?.username || "anonymous"}
                        </span>
                    </motion.div>
                ))}
            </div>

            <LiberteMomentView
                moment={selectedMoment}
                onClose={() => setSelectedMomentIdx(null)}
                onNext={() => {
                    if (selectedMomentIdx !== null && selectedMomentIdx < moments.length - 1) {
                        setSelectedMomentIdx(selectedMomentIdx + 1);
                    } else {
                        setSelectedMomentIdx(null);
                    }
                }}
                onPrev={() => {
                    if (selectedMomentIdx !== null && selectedMomentIdx > 0) {
                        setSelectedMomentIdx(selectedMomentIdx - 1);
                    }
                }}
            />
        </div>
    );
}
