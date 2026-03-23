import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vanashree.org"),
  title: {
    default: "Vanashree Gramvikas Pratishthan | Rooted in Nature",
    template: "%s | Vanashree",
  },
  description:
    "Grassroots NGO from Gatewadi, Maharashtra. Afforestation, education infrastructure, and environmental cleanup drives since 2010.",
  keywords: [
    "NGO Maharashtra",
    "tree plantation",
    "afforestation",
    "rural development",
    "Ahilyanagar",
    "Parner",
    "Gatewadi",
    "वनश्री",
    "ग्रामविकास",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vanashree.org",
    siteName: "Vanashree Gramvikas Pratishthan",
    images: [
      {
        url: "/images/logo/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Vanashree Gramvikas Pratishthan Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo/icon-192.png",
  },
};

// JSON-LD structured data for Organization
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Vanashree Gramvikas Pratishthan",
  description:
    "Grassroots NGO focused on environmental conservation and rural development in Maharashtra",
  url: "https://vanashree.org",
  foundingDate: "2010",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gatewadi",
    addressLocality: "Parner",
    addressRegion: "Ahilyanagar, Maharashtra",
    addressCountry: "IN",
  },
  sameAs: ["https://www.instagram.com/vanashree_ngo/"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <NextIntlClientProvider messages={messages}>
          <AppShell>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
