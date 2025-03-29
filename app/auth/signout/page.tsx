"use client";

import dynamic from "next/dynamic";

// Dynamically import the component that uses useSearchParams with SSR disabled
const SignOutContentWithSearchParams = dynamic(
  () => import("./signout-content"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p>Please wait while we prepare sign-out options</p>
        </div>
      </div>
    )
  }
);

export default function SignOutPage() {
  return <SignOutContentWithSearchParams />;
} 