"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(className)}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
