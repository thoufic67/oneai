// Login.tsx - Login page for Aiflo, styled after PostHog Cloud. Features a two-column layout: left side with Aiflo logo, right side with login card. Responsive for mobile.
"use client";
import Image from "next/image";
import { Button } from "@heroui/button";
import { title, subtitle } from "../components/primitives";
import { authService } from "@/services/authService";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import Waitlist from "./Waitlist";
import { Chip } from "@heroui/chip";

export default function Login() {
  const [region, setRegion] = useState<"india" | "other" | "">("");

  useEffect(() => {
    console.log("region", region);
  }, [region]);

  return (
    <div className="h-dvh flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950 m-0">
      {/* Left: Logo section */}
      <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 dark:from-primary-700 dark:to-indigo-900 p-8 md:min-h-screen">
        <div className="flex flex-col items-center justify-center w-full">
          <Image
            src="/icon.svg"
            alt="Aiflo Logo"
            width={160}
            height={160}
            className="mx-auto drop-shadow-2xl"
            priority
          />
          <span className="mt-8 text-3xl font-bold text-white tracking-tight hidden md:block select-none">
            Aiflo
          </span>
        </div>
      </div>
      {/* Right: Login card */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col items-center p-8 gap-6 border border-gray-200 dark:border-gray-800">
          {/* Region Selector */}
          <div className="w-full flex flex-col gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Choose your region
            </span>
            <div className="flex gap-2">
              <Chip
                color={region === "india" ? "primary" : "default"}
                variant={region === "india" ? "solid" : "flat"}
                startContent={
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                    alt="India Flag"
                    width={16}
                    height={16}
                  />
                }
                onClick={() => setRegion("india")}
                className="cursor-pointer p-2"
              >
                India
              </Chip>
              <Chip
                color={region === "other" ? "primary" : "default"}
                variant={region === "other" ? "solid" : "flat"}
                startContent={<Globe className="w-4 h-4" />}
                onClick={() => setRegion("other")}
                className="cursor-pointer p-2"
              >
                Other Countries
              </Chip>
            </div>
          </div>
          {region === "" && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please select your region to continue.
            </p>
          )}
          {/* Show Waitlist if region is 'other' */}
          {region === "other" && <Waitlist />}
          {region === "india" && (
            <>
              <h1 className={title({ class: "text-center" })}>
                Sign in to Aiflo
              </h1>
              <p
                className={subtitle({
                  class: "text-center text-gray-500 dark:text-gray-400",
                })}
              >
                Welcome! Sign in to continue.
              </p>
              <Button
                onClick={() => authService.initiateGoogleLogin()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_17_40)">
                    <path
                      d="M47.5 24.5C47.5 22.8 47.3 21.2 47 19.7H24V28.3H37.3C36.7 31.1 34.9 33.4 32.2 34.9V40.1H39.7C44.1 36.1 47.5 30.8 47.5 24.5Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M24 48C30.5 48 35.9 45.9 39.7 40.1L32.2 34.9C30.2 36.2 27.5 37.1 24 37.1C17.7 37.1 12.2 32.7 10.3 27H2.5V32.4C6.3 40.1 14.5 48 24 48Z"
                      fill="#34A853"
                    />
                    <path
                      d="M10.3 27C9.7 25.7 9.4 24.3 9.4 22.8C9.4 21.3 9.7 19.9 10.3 18.6V13.2H2.5C0.9 16.2 0 19.4 0 22.8C0 26.2 0.9 29.4 2.5 32.4L10.3 27Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M24 9.7C27.1 9.7 29.8 10.8 31.8 12.7L39.8 5.1C35.9 1.5 30.5 0 24 0C14.5 0 6.3 7.9 2.5 15.6L10.3 21.1C12.2 15.3 17.7 9.7 24 9.7Z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_17_40">
                      <rect width="48" height="48" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Sign in with Google
              </Button>
              <div className="flex-1" />
              <p className="text-xs text-gray-400 text-center w-full mt-4">
                By signing in, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  terms of service
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
