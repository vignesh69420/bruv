import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
