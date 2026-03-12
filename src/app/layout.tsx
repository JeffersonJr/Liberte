import type { Metadata } from "next";
import { playfair, inter } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <FaviconProvider />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
