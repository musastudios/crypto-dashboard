import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SettingsForm } from './settings-form';

// This page remains a Server Component
export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Protect the route: Redirect if not logged in
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/settings');
  }

  // Render the container and pass the user ID to the client form
  // The client form will handle fetching and displaying preferences
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-8">
        <SettingsForm userId={session.user.id} />
      </div>
    </div>
  );
} 