"use client"; // Keep this page client-side for dynamic import

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamically import the content component
const SignInContent = dynamic(() => import('./signin-content'), {
  ssr: false, // Ensure it only renders on the client
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 