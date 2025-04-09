"use client";

import { useState, ReactNode, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Lock } from "lucide-react";

interface PasswordFormProps {
  children: ReactNode;
}

export function PasswordForm({ children }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const authData = sessionStorage.getItem("authData");

    if (authData) {
      try {
        const { expires, authenticated } = JSON.parse(authData);

        if (authenticated && new Date(expires) > new Date()) {
          setIsAuthenticated(true);
        } else {
          // Clear expired auth data
          sessionStorage.removeItem("authData");
        }
      } catch (e) {
        // Handle potential JSON parse error
        sessionStorage.removeItem("authData");
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify against environment variable
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      // Set auth state with expiration (1 day from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const authData = {
        authenticated: true,
        expires: expiresAt.toISOString(),
      };

      sessionStorage.setItem("authData", JSON.stringify(authData));
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  } else {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="flex justify-center pb-2">
            <Lock className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold text-center mt-2">
              Password Protected
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  errorMessage={error ? "Incorrect password" : ""}
                  isInvalid={error}
                  autoFocus
                />
              </div>
              <Button type="submit" color="primary" fullWidth>
                Unlock
              </Button>
            </form>
          </CardBody>
          <CardFooter className="justify-center text-sm text-gray-500">
            Enter the correct password to access the content
          </CardFooter>
        </Card>
      </div>
    );
  }
}
