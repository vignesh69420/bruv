"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/settings/profile", label: "profile" },
  { href: "/settings/integrations", label: "integrations" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "border-b-2 px-3 py-2 text-sm",
            pathname === item.href
              ? "border-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
