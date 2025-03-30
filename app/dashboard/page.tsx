import { AuthGuard } from "@/components/auth-guard";
import Dashboard from "@/components/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Crypto Analytics",
  description: "View and analyze your crypto portfolio",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
} 