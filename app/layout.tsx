import type { Metadata } from "next";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import "./globals.css";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "AuthAI — Prior Authorization Assistant",
  description: "AI-powered prior authorization form generation",
};

const AUTH0_ENABLED = process.env.AUTH0_ISSUER_BASE_URL && process.env.AUTH0_CLIENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <>
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
          <div className="flex items-center gap-3">
            {AUTH0_ENABLED ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                🔐 HIPAA Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </span>
            )}
            <AuthButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </>
  );

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {AUTH0_ENABLED ? (
          <Auth0Provider>{content}</Auth0Provider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
