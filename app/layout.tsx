import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Providers } from "./components/providers";
import { BackgroundGradient } from "@/app/components/background-gradient";
import { Analytics } from "@vercel/analytics/next";

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
      <head>
        {/* SEO: Open Graph & Twitter Card */}
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiflo.space/" />
        <meta property="og:image" content="/favicon.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.name} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content="/favicon.svg" />
        <link rel="canonical" href="https://aiflo.space/" />
      </head>
      <body className={`${inter.className} font-sans antialiased `}>
        <Toaster />
        <Providers>
          <BackgroundGradient />
          <div className="relative flex flex-col w-dvw h-dvh">
            <main className="container w-full h-full max-h-full max-w-full overflow-x-hidden">
              <Navbar />
              {children}
              <Footer />
            </main>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
