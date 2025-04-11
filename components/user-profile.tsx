"use client";

import React from "react";
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

export default function UserProfile() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" variant="bordered">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <button className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80">
          <Avatar
            src={user.picture_url || undefined}
            name={user.name || user.email}
            size="sm"
            className="cursor-pointer"
          />
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem key="profile" className="font-medium">
          <div className="flex flex-col">
            <span>{user.name}</span>
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
