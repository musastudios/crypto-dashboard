"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { UserPreferences } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SettingsFormProps {
  userId: string;
}

export function SettingsForm({ userId }: SettingsFormProps) {
  const { setTheme, theme: currentTheme } = useTheme();
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition(); // For theme setting
  const supabase = getSupabaseBrowserClient();

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore error if no row found yet
          console.error('Error fetching preferences:', error);
          toast.error('Failed to load your preferences.');
        } else if (data?.preferences) {
          setPreferences(data.preferences as UserPreferences);
          // Apply the fetched theme immediately if it exists
          if (data.preferences.theme) {
            startTransition(() => {
              setTheme(data.preferences.theme);
            });
          }
        } else {
          // No preferences saved yet, use current theme as default for form
          setPreferences({ theme: currentTheme as UserPreferences['theme'] });
        }
      } catch (err) {
        console.error('Exception fetching preferences:', err);
        toast.error('An error occurred while loading preferences.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, supabase, setTheme, currentTheme]); // Add currentTheme as dependency

  const handleThemeChange = (value: string) => {
    const newTheme = value as UserPreferences['theme'];
    // Update local form state
    setPreferences(prev => ({ ...prev, theme: newTheme }));
    // Apply theme using next-themes
    startTransition(() => {
      setTheme(newTheme || 'system');
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ preferences: preferences })
        .eq('id', userId);

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences.');
      } else {
        toast.success('Preferences saved successfully!');
      }
    } catch (err) {
      console.error('Exception saving preferences:', err);
      toast.error('An error occurred while saving preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24 self-end" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel of the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <RadioGroup
            id="theme"
            value={preferences.theme || 'system'} // Default to system if not set
            onValueChange={handleThemeChange}
            className="grid max-w-md grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
            disabled={isPending}
          >
            <Label className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="light" className="sr-only" />
              <span className="mb-2 text-sm font-medium">Light</span>
              ☀️
            </Label>
            <Label className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="dark" className="sr-only" />
              <span className="mb-2 text-sm font-medium">Dark</span>
              🌙
            </Label>
            <Label className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="system" className="sr-only" />
              <span className="mb-2 text-sm font-medium">System</span>
              💻
            </Label>
          </RadioGroup>
        </div>

        {/* Add Language preference section here later */}
        {/* <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <p className="text-sm text-muted-foreground">Language setting coming soon!</p>
        </div> */}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 