"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Trash2, Flag, UserMinus, Pin } from "lucide-react";
import { useState } from "react";

interface ContextMenuProps {
    isOwn: boolean;
    onDelete?: () => void;
    onReport?: () => void;
}

export function LiberteContextMenu({ isOwn, onDelete, onReport }: ContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-zinc-600 hover:text-zinc-400 p-2 rounded-full transition-colors"
            >
                <MoreHorizontal size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 glass border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-2 flex flex-col gap-1">
                                {isOwn ? (
                                    <>
                                        <button className="flex items-center gap-3 w-full p-3 text-sm font-medium hover:bg-zinc-800/50 rounded-xl transition-colors">
                                            <Pin size={18} /> Pin to profile
                                        </button>
                                        <button
                                            onClick={onDelete}
                                            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={18} /> Delete post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="flex items-center gap-3 w-full p-3 text-sm font-medium hover:bg-zinc-800/50 rounded-xl transition-colors">
                                            <UserMinus size={18} /> Unfollow
                                        </button>
                                        <button
                                            onClick={onReport}
                                            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                        >
                                            <Flag size={18} /> Report post
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
