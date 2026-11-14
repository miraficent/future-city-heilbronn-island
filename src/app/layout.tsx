import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./spiel.css";
import "./pixel.css";
import "./abenteuer.css";
import "./spielwelt.css";
import "./karte.css";
import "./einblicke.css";
import "./lernreise.css";
import "./fotos.css";
import "./figur.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASIS_URL ?? "http://localhost:3000"),
  title: { default: "COSMOS-Entdecker – Lernen & Freizeit in Heilbronn", template: "%s · COSMOS-Entdecker" },
  description:
    "Alle Kurse und Workshops zu KI, Coding und Gaming von aim, experimenta, Haus der Familie und IPAI an einem Ort – für Kinder, Teens und Eltern in Heilbronn. Ohne Anmeldung, ohne Tracking.",
  openGraph: { locale: "de_DE", type: "website", siteName: "COSMOS-Entdecker" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
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
