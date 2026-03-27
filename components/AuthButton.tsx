"use client";

import { useUser } from '@auth0/nextjs-auth0/client';

const AUTH0_ENABLED = process.env.NEXT_PUBLIC_AUTH0_ENABLED === 'true';

export function AuthButton() {
  // If Auth0 not configured, show nothing
  if (!AUTH0_ENABLED) {
    return null;
  }

  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md" />
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-600">Auth Error</div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="w-7 h-7 rounded-full border border-slate-200"
            />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-900">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-500">
              {user.email}
            </span>
          </div>
        </div>
        <a
          href="/api/auth/logout"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          Logout
        </a>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/login"
      className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md transition-colors"
    >
      Provider Login
    </a>
  );
}
