"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
    images: string[];
    aspectRatio?: "4/5" | "9/16";
}

export function LiberteCarousel({ images, aspectRatio = "4/5" }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images.length) return null;

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={`relative group w-full overflow-hidden rounded-2xl border border-zinc-900 ${aspectRatio === "9/16" ? "aspect-[9/16]" : "aspect-[4/5]"
            }`}>
            <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-full object-cover flex-shrink-0" />
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${currentIndex === i ? "w-3 bg-zinc-100" : "w-1.5 bg-zinc-500"}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
