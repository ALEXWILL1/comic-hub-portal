import type { Metadata } from "next";
import "./globals.css";
import { SmartNavbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "NeoComic - Modern Webtoon Platform",
  description: "Platform baca webtoon dan komik online dengan update otomatis dan pengalaman baca mulus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-black text-zinc-100 min-h-screen antialiased selection:bg-violet-500/30 selection:text-violet-200">
        <SmartNavbar />
        {children}
      </body>
    </html>
  );
}
