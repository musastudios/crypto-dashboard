"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the component that uses useSearchParams with SSR disabled
const ErrorContentWithSearchParams = dynamic(
  () => import("./error-content"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p>Please wait while we process your request</p>
        </div>
      </div>
    )
  }
);

export default function ErrorPage() {
  return <ErrorContentWithSearchParams />;
} 