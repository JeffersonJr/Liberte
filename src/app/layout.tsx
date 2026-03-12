import type { Metadata } from "next";
import { playfair, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liberté",
  description: "A free and immersive social experience",
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
        {children}
      </body>
    </html>
  );
}
