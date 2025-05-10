"use client";

import Login from "@/app/components/Login";
import { useAuth } from "../components/auth-provider";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { user } = useAuth();

  if (user) {
    redirect("/new");
  }
  return <Login />;
}
