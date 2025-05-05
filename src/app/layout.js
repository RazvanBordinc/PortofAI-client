import Sidebar from "@/components/shared/Sidebar";
import "./globals.css";
import { ThemeProvider } from "@/lib/utils/context/ThemeContext";

export const metadata = {
  title: "PortofAI | Portfolio AI Assistant",
  description: "PortofAI, portfoli AI-powered with data about me in real time",
  keywords: ["portfolio", "AI assistant", "PortofAI"],
  authors: [{ name: "Bordinc Razvan" }],
  creator: "PortofAI",
  publisher: "PortofAI",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
      </head>
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <body>
          <main className="bg-white dark:bg-zinc-900 min-h-screen">
            <Sidebar>{children}</Sidebar>
          </main>
        </body>
      </ThemeProvider>
    </html>
  );
}
