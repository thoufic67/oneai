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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { History, Plus, Search, Share } from "lucide-react";

import { ThemeSwitch } from "@/app/components/theme-switch";
import UserProfile from "@/app/components/user-profile";
import { useShortcutKey } from "@/app/components/search/ShortcutKeyProvider";
import Image from "next/image";
import { Tooltip } from "@heroui/react";
import { useAuth } from "@/app/components/auth-provider";
import { ShareButton } from "@/components/chat/share-button";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { openCommandK } = useShortcutKey();
  const [showSimpleNavbar, setShowSimpleNavbar] = useState(true); // Default to true for server-side render
  const { user } = useAuth();
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const { id } = useParams();
  const PATHS_TO_HIDE_NAVBAR = useMemo(() => {
    return ["/", "/login", "/pricing", "/about", "/register", `/share/${id}`];
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      setIsNavbarVisible(true);
    }, 500);

    // Update navbar state based on current path
    setShowSimpleNavbar(PATHS_TO_HIDE_NAVBAR.includes(pathname));
  }, [pathname]);

  const handleNewChat = () => {
    router.push("/new");
  };

  return (
    <>
      <HeroUINavbar
        isBlurred
        maxWidth={showSimpleNavbar ? "xl" : "full"}
        className={`transition-all duration-300 ${
          showSimpleNavbar
            ? "w-fit mx-auto bg-gradient-to-r from-primary-50 to-primary-100 border border-gray-200 rounded-full top-8 transition-all duration-300"
            : "w-full"
        }
        ${isNavbarVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
        `}
        position="sticky"
      >
        {showSimpleNavbar ? (
          <NavbarContent className="w-fit text-sm -px-4" justify="start">
            <NavbarBrand>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/favicon.svg" alt="Aiflo" width={24} height={24} />
                <span className="font-bold text-lg text-primary-500">
                  Aiflo
                </span>
              </Link>
            </NavbarBrand>
            <NavbarItem>
              <Link
                className="text-sm text-default-800 font-medium"
                href="/pricing"
              >
                Pricing
              </Link>
            </NavbarItem>
            {/* <NavbarItem>
              <Link
                className="text-sm text-default-800 font-medium"
                href="/contact"
              >
                Contact
              </Link>
            </NavbarItem> */}
            <NavbarItem>
              <Button
                as={Link}
                variant="solid"
                color="primary"
                href={user ? "/new" : "/login"}
                size="sm"
                className="text-sm rounded-full"
              >
                {user ? "Launch App" : "Login"}
              </Button>
            </NavbarItem>
          </NavbarContent>
        ) : (
          <>
            <NavbarContent>
              <NavbarBrand>
                <Link href="/new" className="flex items-center gap-2">
                  <Image
                    src="/favicon.svg"
                    alt="Aiflo"
                    width={24}
                    height={24}
                  />
                  <span className="font-bold text-lg">Aiflo</span>
                </Link>
              </NavbarBrand>
            </NavbarContent>
            <NavbarContent
              className="flex basis-1/5 sm:basis-full items-center w-full"
              justify="end"
            >
              <NavbarItem className="flex gap-2">
                <>
                  <Tooltip content="History">
                    <Button
                      size="sm"
                      radius="full"
                      isIconOnly
                      variant="ghost"
                      aria-label="History"
                      onPress={openCommandK}
                    >
                      <History className="h-4 w-4" />
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
                  {id && (
                    <Tooltip content="Share">
                      <ShareButton conversationId={id as string} />
                    </Tooltip>
                  )}
                </>
                <ThemeSwitch />
              </NavbarItem>
              <NavbarItem>
                <UserProfile />
              </NavbarItem>
            </NavbarContent>
          </>
        )}
      </HeroUINavbar>
    </>
  );
};
