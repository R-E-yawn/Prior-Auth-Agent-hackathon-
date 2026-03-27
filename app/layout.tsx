import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuthAI — Prior Authorization Assistant",
  description: "AI-powered prior authorization form generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">Rx</span>
              </div>
              <span className="font-semibold text-slate-900 text-sm">
                AuthAI
              </span>
              <span className="text-slate-300 text-sm">|</span>
              <span className="text-slate-500 text-sm">
                Prior Authorization Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
