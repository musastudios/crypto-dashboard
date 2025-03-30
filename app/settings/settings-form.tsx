"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Define user preferences type
interface UserPreferences {
  theme?: "light" | "dark" | "system";
  // Add more preferences as needed
}

export function SettingsForm() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = getSupabaseBrowserClient();

  // Fetch user preferences
  useEffect(() => {
    async function fetchUserPreferences() {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("preferences")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // If preferences exist, set them in state
        if (data?.preferences) {
          setPreferences(data.preferences);
          
          // Apply theme from preferences if it exists
          if (data.preferences.theme) {
            setTheme(data.preferences.theme);
          }
        } else {
          // Default to current theme if no preference is stored
          setPreferences({ theme: theme as "light" | "dark" | "system" });
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        toast.error("Failed to load your preferences");
      } finally {
        setIsLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchUserPreferences();
    }
  }, [user, authLoading, supabase, theme, setTheme]);

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setPreferences({ ...preferences, theme: newTheme });
    setTheme(newTheme);
  };

  // Save preferences
  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("users")
        .update({ preferences })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Manage your application preferences and settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Theme</h3>
          <RadioGroup
            value={preferences.theme || "system"}
            onValueChange={(v) => handleThemeChange(v as "light" | "dark" | "system")}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 