"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Send } from "lucide-react";

interface PostComposeProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, media: string[]) => void;
}

export function LibertePostCompose({ isOpen, onClose, onSubmit }: PostComposeProps) {
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() && media.length === 0) return;
        setIsSubmitting(true);
        await onSubmit(content, media);
        setIsSubmitting(false);
        setContent("");
        setMedia([]);
        onClose();
    };

    const addMockImage = () => {
        if (media.length >= 4) return;
        const newMedia = [...media, `https://picsum.photos/800/1000?random=${Date.now()}`];
        setMedia(newMedia);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-xl glass rounded-3xl overflow-hidden relative"
                    >
                        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                            <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <h2 className="font-serif text-lg font-bold">New Publication</h2>
                            <div className="w-8" />
                        </div>

                        <div className="p-6">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value.slice(0, 250))}
                                placeholder="What's on your mind? (Free expression)"
                                className="w-full bg-transparent border-none focus:ring-0 text-xl text-zinc-100 placeholder-zinc-600 resize-none h-32"
                            />

                            {media.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                    {media.map((url, i) => (
                                        <div key={url} className="relative flex-shrink-0">
                                            <img src={url} className="w-24 h-32 object-cover rounded-xl border border-zinc-800" />
                                            <button
                                                onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                                                className="absolute -top-1 -right-1 bg-black/50 p-1 rounded-full border border-zinc-700"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {media.length < 4 && (
                                        <button onClick={addMockImage} className="w-24 h-32 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300">
                                            <ImageIcon size={24} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex gap-2">
                                    <button onClick={addMockImage} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                        <ImageIcon size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`text-sm ${content.length >= 240 ? "text-rose-500" : "text-zinc-600"}`}>
                                        {content.length}/250
                                    </span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isSubmitting || (!content.trim() && media.length === 0)}
                                        onClick={handleSubmit}
                                        className="bg-zinc-100 text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-500"
                                    >
                                        <span>Publish</span>
                                        <Send size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
