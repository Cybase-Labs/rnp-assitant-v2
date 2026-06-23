import "./globals.css";
import { Outfit, Sora } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});
export const metadata = {
  title: "Road Traffic Law Assistant",
  description: "Rwanda Law Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${sora.variable}`}>{children}</body>
    </html>
  );
}
