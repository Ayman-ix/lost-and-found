import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Lost & Found Network — Campus Management System",
  description: "Report lost and found items, track matches, and submit ownership claims securely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lato.variable} h-full antialiased`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-[#231F20] font-sans selection:bg-[#D3632D]/20 selection:text-[#231F20]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

