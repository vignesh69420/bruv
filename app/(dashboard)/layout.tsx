import type { ReactNode } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/server/session";
import { listThreadsForUser } from "@/lib/server/threads";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Prefetch the thread list on the server so the sidebar paints with data on
  // first render instead of fetching it after hydration.
  const queryClient = new QueryClient();
  const session = await getServerSession();
  if (session?.user) {
    await queryClient.prefetchQuery({
      queryKey: ["threads"],
      queryFn: () => listThreadsForUser(session.user.id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-semibold lowercase">bruv</span>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  );
}
