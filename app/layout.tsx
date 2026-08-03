import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "INFINIX'26 | 32-Hours National Level Underwater Hackathon",
  description:
    "Dive into innovation and build the future at INFINIX'26 - Premier 32-Hours National Level Hackathon featuring AI, Web3, Cloud, Robotics, and ₹1,90,000+ Prize Pool.",
  keywords: [
    "INFINIX26",
    "Hackathon",
    "National Hackathon",
    "Coding Competition",
    "Tech Event 2026",
  ],
  authors: [{ name: "INFINIX Team" }],
  openGraph: {
    title: "INFINIX'26 | 32-Hours National Level Hackathon",
    description: "Create • Innovate • Elevate. Join 500+ hackers in an immersive underwater arena.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#020817] text-slate-100 antialiased overflow-x-hidden selection:bg-[#00D9FF] selection:text-black">
        {children}
      </body>
    </html>
  );
}
