import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Crypto Analytics",
  description: "View and analyze your crypto portfolio",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 