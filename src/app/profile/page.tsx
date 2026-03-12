"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRoot() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to a default profile for now
        router.push("/profile/liberte");
    }, [router]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-500 border-t-zinc-100 rounded-full animate-spin" />
        </div>
    );
}
