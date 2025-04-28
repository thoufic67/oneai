"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export default function LandingPageButton() {
  const { user } = useAuth();
  return (
    <Link href={user ? "/new" : "/login"}>
      <Button
        size="lg"
        variant="solid"
        color="primary"
        className="hover:scale-125 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
      >
        Let&apos;s go
      </Button>
    </Link>
  );
}
