import type { Metadata } from "next";
import { playfair, inter } from "./fonts";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { FaviconProvider } from "@/components/FaviconProvider";

export const metadata: Metadata = {
  title: "Liberté",
  description: "A free and immersive social experience",
  icons: {
    icon: "/fav.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <FaviconProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}

