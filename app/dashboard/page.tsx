"use client";

import withAuth from "@/app/components/withAuth";
import { Button } from "@heroui/button";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}

function Dashboard({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user.name || user.email}!
          </p>
        </div>
        <Button onClick={handleLogout} variant="faded" size="sm">
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-3">
            {user.picture_url && (
              <img
                src={user.picture_url}
                alt={user.name || "User"}
                className="h-20 w-20 rounded-full object-cover mx-auto mb-4"
              />
            )}
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">ID:</span> {user.id}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">
            No recent activity to display.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/conversations"
                className="text-primary-600 hover:underline"
              >
                Your Conversations
              </a>
            </li>
            <li>
              <a href="/settings" className="text-primary-600 hover:underline">
                Account Settings
              </a>
            </li>
            <li>
              <a href="/help" className="text-primary-600 hover:underline">
                Help & Support
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
