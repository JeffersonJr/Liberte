"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function Logo({ className, width = 120, height = 40 }: LogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ width, height }} className={className} />;
    }

    const isDark = resolvedTheme === "dark";
    const src = isDark ? "/logo white.svg" : "/logo.svg";

    return (
        <Image
            src={src}
            alt="Liberté Logo"
            width={width}
            height={height}
            className={className}
            priority
        />
    );
}

export function Favicon() {
    // This part is handled by FaviconProvider
    return null;
}
