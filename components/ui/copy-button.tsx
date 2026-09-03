"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy",
  ...props
}: { value: string; label?: string } & Omit<ButtonProps, "onClick">) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently,
      // the value is still visible and selectable on screen.
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      {...props}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-signal" /> Disalin
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> {label}
        </>
      )}
    </Button>
  );
}
