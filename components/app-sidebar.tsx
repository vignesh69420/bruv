"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useThreads } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { threads, createThread, deleteThread } = useThreads();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  async function newChat() {
    const thread = await createThread({});
    closeOnMobile();
    router.push(`/chat/${thread.id}`);
  }

  return (
    <Sidebar>
      <SidebarHeader className="gap-2">
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            onClick={closeOnMobile}
            className="text-base font-semibold tracking-tight lowercase"
          >
            bruv
          </Link>
          <ThemeToggle />
        </div>
        <Button
          onClick={newChat}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-transparent font-normal"
        >
          <Plus data-icon="inline-start" />
          new chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {threads.length > 0 && <SidebarGroupLabel>chats</SidebarGroupLabel>}
          <SidebarMenu>
            {threads.map((thread) => (
              <SidebarMenuItem key={thread.id}>
                <SidebarMenuButton
                  isActive={params?.id === thread.id}
                  render={
                    <Link href={`/chat/${thread.id}`} onClick={closeOnMobile} />
                  }
                >
                  <span className="truncate">{thread.title}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  showOnHover
                  aria-label="Delete chat"
                  onClick={async () => {
                    await deleteThread(thread.id);
                    if (params?.id === thread.id) router.push("/");
                  }}
                >
                  <Trash2 />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
