"use client";

import dynamic from "next/dynamic";

// Dynamically import the component that uses useSearchParams with SSR disabled
const SignInContentWithSearchParams = dynamic(
  () => import("./signin-content"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p>Please wait while we prepare sign-in options</p>
        </div>
      </div>
    )
  }
);

export default function SignInPage() {
  return <SignInContentWithSearchParams />;
} 