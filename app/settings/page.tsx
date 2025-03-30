import { AuthGuard } from "@/components/auth-guard";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Settings - Crypto Analytics",
  description: "Manage your user preferences",
};

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="container px-4 py-10 mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <SettingsForm />
      </div>
    </AuthGuard>
  );
} 