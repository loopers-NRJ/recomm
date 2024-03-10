"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

function LogoutButton() {
  return (
    <Button
      onClick={() => void signOut({ callbackUrl: "/" })}
      size="sm"
      variant="outline"
    >
      Log Out
    </Button>
  );
}

export default LogoutButton;
