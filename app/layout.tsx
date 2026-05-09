import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Playfair_Display, Raleway, Space_Grotesk, Bebas_Neue, Pacifico, Outfit } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-outfit",
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
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${playfair.variable} ${raleway.variable} ${spaceGrotesk.variable} ${bebasNeue.variable} ${pacifico.variable} ${outfit.variable} antialiased`}
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
