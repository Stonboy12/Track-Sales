import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getServerUser } from "@/lib/server-session";

export const metadata: Metadata = {
  title: "FMCG Sales OS",
  description:
    "Platform kerja terpadu untuk salesman FMCG: route, outlet, kompetitor, laporan, dan tim.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ambil user di Server Component sehingga sidebar/topbar bisa disesuaikan
  // ke role tanpa client-side flicker. Bila tidak login, value undefined dan
  // halaman publik (login/register) ditampilkan tanpa shell.
  const me = await getServerUser();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-svh font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell role={me?.role} userName={me?.name}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
