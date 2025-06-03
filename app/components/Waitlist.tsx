// Waitlist.tsx - Placeholder for waitlist shown to users from other countries in Login page.
import React from "react";
import { title, subtitle } from "../components/primitives";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function Waitlist() {
  return (
    <>
      <h1 className={title({ class: "text-center" })}>
        We're actively expanding to new regions.
      </h1>
      <p
        className={subtitle({
          class: "text-center text-gray-500 dark:text-gray-400",
        })}
      >
        Please join the waitlist to be notified when we launch in your region.
      </p>

      <Button
        as={Link}
        href="https://getwaitlist.com/waitlist/29016"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Join the waitlist
      </Button>
    </>
  );
}
