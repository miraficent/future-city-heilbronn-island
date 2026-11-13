import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Martian_Mono, Unbounded } from "next/font/google";
import "./globals.css";

// next/font liefert die Schriften selbst aus – zur Laufzeit gehen keine Anfragen an Google.
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin", "latin-ext"], variable: "--font-atkinson", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--font-unbounded", display: "swap" });
const martian = Martian_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASIS_URL ?? "http://localhost:3000"),
  title: { default: "COSMOS-Entdecker – Lernen & Freizeit in Heilbronn", template: "%s · COSMOS-Entdecker" },
  description:
    "Alle Kurse und Workshops zu KI, Coding und Gaming von aim, experimenta, Haus der Familie und IPAI an einem Ort – für Kinder, Teens und Eltern in Heilbronn. Ohne Anmeldung, ohne Tracking.",
  openGraph: { locale: "de_DE", type: "website", siteName: "COSMOS-Entdecker" },
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${atkinson.variable} ${unbounded.variable} ${martian.variable}`}>
      <body className="korn min-h-dvh antialiased">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-tinte focus:px-4 focus:py-2 focus:text-papier"
        >
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
