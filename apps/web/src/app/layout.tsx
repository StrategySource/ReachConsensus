import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reach Consensus",
  description: "Cisco proposal microsites with a One Cisco platform story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
