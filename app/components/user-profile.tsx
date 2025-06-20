"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/app/components/auth-provider";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Spinner } from "@heroui/spinner";
import { Tooltip, Link } from "@heroui/react";
import { Crown } from "lucide-react";

export default function UserProfile() {
  const { user, loading, error, logout, quotaData } = useAuth();

  // Add debugging to understand auth state
  useEffect(() => {
    console.log("quotaData", quotaData);
    if (error) {
      console.error("Auth error in UserProfile:", error);
    }
  }, [error, quotaData]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner size="sm" color="primary" />
      </div>
    );
  }

  // Not authenticated - show sign in button
  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" variant="bordered">
          Sign In
        </Button>
      </Link>
    );
  }

  // User is authenticated - show profile dropdown
  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          src={user.user_metadata.avatar_url || undefined}
          name={user.user_metadata.name || user.email}
          size="sm"
          className="cursor-pointer"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem key="profile" className="font-medium">
          {quotaData?.subscription?.tier === "free" ? (
            <Link href="/pricing" className="w-full text-md">
              Upgrade to Pro
              <span>
                <Crown className="w-4 h-4 text-orange-500" />
              </span>
            </Link>
          ) : (
            <div className="flex flex-col">
              <span>{user.user_metadata.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          )}
        </DropdownItem>

        {/* <DropdownItem key="dashboard" className="w-full">
          <Link href="/dashboard" className="w-full">
            Dashboard
          </Link>
        </DropdownItem> */}
        <DropdownItem key="settings" className="w-full">
          <Link href="/settings" className="w-full text-md">
            Settings
          </Link>
        </DropdownItem>
        <DropdownItem key="contact" className="w-full">
          <Link href="/contact" className="w-full text-md text-default-800">
            Contact us
          </Link>
        </DropdownItem>

        <DropdownItem key="logout" color="danger" onClick={logout}>
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
