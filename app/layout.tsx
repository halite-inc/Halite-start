import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Halite Start",
  description: "Halite Start dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <Script id="theme-bg-init" strategy="beforeInteractive">
          {`(function(){
            try {
              var theme = localStorage.getItem('theme');
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              var isDark = theme ? (theme === 'dark') : prefersDark;
              if (isDark) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');

              var bg = localStorage.getItem('backgroundImage');
              if (bg) {
                document.documentElement.style.setProperty('--app-bg-image', 'url(' + bg.replace(/'/g, "\\'") + ')');
                document.documentElement.classList.add('has-app-bg');
              } else {
                document.documentElement.style.setProperty('--app-bg-image', 'none');
                document.documentElement.classList.remove('has-app-bg');
              }
            } catch (e) { /* noop */ }
          })();`}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
