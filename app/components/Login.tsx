// Login.tsx - Login page for Aiflo, styled after PostHog Cloud. Features a two-column layout: left side with Aiflo logo, right side with login card. Responsive for mobile.
"use client";
import Image from "next/image";
import { Button } from "@heroui/button";
import { title, subtitle } from "../components/primitives";
import { authService } from "@/services/authService";
import Link from "next/link";

export default function Login() {
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
          <div className="md:hidden flex flex-col items-center mb-2">
            <Image
              src="/icon.svg"
              alt="Aiflo Logo"
              width={56}
              height={56}
              className="mb-2"
              priority
            />
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400 tracking-tight select-none">
              Aiflo
            </span>
          </div>
          <h1 className={title({ class: "text-center" })}>Sign in to Aiflo</h1>
          <p
            className={subtitle({
              class: "text-center text-gray-500 dark:text-gray-400",
            })}
          >
            Welcome back! Sign in to continue.
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
        </div>
      </div>
    </div>
  );
}
