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
import Link from "next/link";
import { Spinner } from "@heroui/spinner";

export default function UserProfile() {
  const { user, loading, error, logout } = useAuth();

  // Add debugging to understand auth state
  useEffect(() => {
    if (error) {
      console.error("Auth error in UserProfile:", error);
    }
  }, [error]);

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
        <button className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80">
          <Avatar
            src={user.user_metadata.avatar_url || undefined}
            name={user.user_metadata.name || user.email}
            size="sm"
            className="cursor-pointer"
          />
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem key="profile" className="font-medium">
          <div className="flex flex-col">
            <span>{user.user_metadata.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </DropdownItem>
        <DropdownItem key="dashboard">
          <Link href="/dashboard" className="w-full">
            Dashboard
          </Link>
        </DropdownItem>
        <DropdownItem key="settings">
          <Link href="/settings" className="w-full">
            Settings
          </Link>
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onClick={logout}>
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
