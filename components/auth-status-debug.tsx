"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AuthStatusDebug() {
  const { user, isLoading, refreshUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-md">
      <div className="flex justify-between items-center">
        <h3 className="font-bold mb-1">Auth Debug</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs py-0"
            onClick={() => refreshUser()}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs py-0"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Details"}
          </Button>
        </div>
      </div>
      
      <div className="mt-2 space-y-1">
        <div>
          <span className="font-semibold">Status:</span>{" "}
          {isLoading 
            ? "Loading..." 
            : user 
              ? <span className="text-green-400">Authenticated</span> 
              : <span className="text-red-400">Not authenticated</span>
          }
        </div>
        
        {user && (
          <div>
            <span className="font-semibold">User:</span>{" "}
            {user.email}
          </div>
        )}
        
        {showDetails && user && (
          <div className="mt-2 border-t border-gray-700 pt-2">
            <details className="cursor-pointer">
              <summary className="font-semibold">User Details</summary>
              <pre className="mt-1 overflow-auto max-h-40 text-green-300">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
} 