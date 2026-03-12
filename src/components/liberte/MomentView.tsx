"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface Moment {
    id: string;
    username: string;
    avatar: string;
    media: string;
    views: number;
}

interface MomentViewProps {
    moment: Moment | null;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function LiberteMomentView({ moment, onClose, onNext, onPrev }: MomentViewProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!moment) return;

        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    onNext?.();
                    return 0;
                }
                return prev + 1;
            });
        }, 50); // 5 seconds total

        return () => clearInterval(interval);
    }, [moment, onNext]);

    if (!moment) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full max-w-lg h-full max-h-[90vh] md:rounded-3xl overflow-hidden glass"
                >
                    {/* Progress Bars */}
                    <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
                        <div className="flex-grow h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={moment.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-lg" alt="" />
                            <span className="font-serif font-bold text-white drop-shadow-md">{moment.username}</span>
                        </div>
                        <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Media */}
                    <img src={moment.media} className="w-full h-full object-cover" alt="" />

                    {/* Controls */}
                    <div className="absolute inset-y-0 left-0 w-1/4" onClick={onPrev} />
                    <div className="absolute inset-y-0 right-0 w-1/4" onClick={onNext} />

                    {/* Footer - View Count */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <Eye size={16} className="text-zinc-400" />
                        <span className="text-sm font-medium text-white">{moment.views} people saw this</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
