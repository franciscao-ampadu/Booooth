import { Bricolage_Grotesque, Inter } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Shared shell for the app screens (map, login, onboarding…), which use the
// app design system rather than the landing page's sketchy look.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bricolage.variable} ${inter.variable} min-h-dvh bg-cream font-ui text-ink-warm`}
    >
      {children}
    </div>
  );
}
