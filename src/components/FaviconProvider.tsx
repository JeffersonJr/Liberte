"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function FaviconProvider() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const updateFavicon = () => {
            const faviconHref = "/fav.svg";

            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");

            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            link.href = faviconHref;
            link.type = "image/svg+xml";
        };

        updateFavicon();
    }, [resolvedTheme]);

    return null;
}
