"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/app/components/theme-switch";
import UserProfile from "@/app/components/user-profile";
import { useShortcutKey } from "@/app/components/search/ShortcutKeyProvider";
import Image from "next/image";
import { Tooltip } from "@heroui/react";

export const Navbar = () => {
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string | null;
  const { openCommandK } = useShortcutKey();

  const handleNewChat = () => {
    router.push("/new");
  };

  return (
    <>
      <HeroUINavbar
        position="sticky"
        isBlurred
        className="bg-transparent w-full"
      >
        <NavbarContent>
          <NavbarBrand>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/one-ai-favicon.svg"
                alt="OneAI"
                width={24}
                height={24}
              />
              <span className="font-bold text-lg"> OneAI</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-full items-center"
          justify="end"
        >
          <NavbarItem className="flex gap-2">
            <Tooltip content="Search">
              <Button
                size="sm"
                radius="full"
                isIconOnly
                variant="ghost"
                aria-label="Search"
                onPress={openCommandK}
              >
                <Search className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="New Chat">
              <Button
                size="sm"
                radius="full"
                isIconOnly
                variant="ghost"
                aria-label="New Chat"
                onPress={handleNewChat}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Tooltip>
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            <UserProfile />
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
          <Button
            size="sm"
            radius="full"
            isIconOnly
            variant="ghost"
            aria-label="Search"
            onPress={openCommandK}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            radius="full"
            isIconOnly
            variant="ghost"
            aria-label="New Chat"
            onPress={handleNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <ThemeSwitch />
          <UserProfile />
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 2
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href="#"
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </HeroUINavbar>
    </>
  );
};
