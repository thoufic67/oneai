import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { Inter } from "next/font/google";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/app/components/navbar";
import { Providers } from "./components/providers";
import { BackgroundGradient } from "@/app/components/background-gradient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    // { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} font-sans antialiased `}>
        <Providers>
          <BackgroundGradient />
          <div className="relative flex flex-col w-dvw h-dvh">
            <Navbar />
            <main className="container w-full h-full max-h-full max-w-full overflow-hidden">
              {children}
            </main>
            <footer className="w-full flex items-center justify-between p-8">
              <p className="text-sm text-default-800">
                &copy; {new Date().getFullYear()} Aiflo. All rights reserved.
              </p>
              <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <Link
                  href="/privacy"
                  className="text-sm hover:underline focus:underline"
                >
                  Privacy Policy
                </Link>
                <span aria-hidden="true">|</span>
                <Link
                  href="/terms"
                  className="text-sm hover:underline focus:underline"
                >
                  Terms of Service
                </Link>
                <span aria-hidden="true">|</span>
                <Link
                  href="/contact"
                  className="text-sm hover:underline focus:underline"
                >
                  Contact
                </Link>
              </nav>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
