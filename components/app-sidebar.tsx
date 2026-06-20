"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useThreads } from "@/hooks/use-threads";
import type { ThreadSummary } from "@/shared/types/thread";
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
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const GROUP_ORDER = ["today", "yesterday", "previous 7 days", "earlier"] as const;
type GroupKey = (typeof GROUP_ORDER)[number];

function bucket(updatedAt: number): GroupKey {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  if (updatedAt >= startOfToday) return "today";
  if (updatedAt >= startOfToday - 86_400_000) return "yesterday";
  if (updatedAt >= startOfToday - 6 * 86_400_000) return "previous 7 days";
  return "earlier";
}

export function AppSidebar() {
  const { threads, createThread, deleteThread } = useThreads();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { isMobile, setOpenMobile } = useSidebar();
  const [query, setQuery] = useState("");

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  async function newChat() {
    const thread = await createThread({});
    closeOnMobile();
    router.push(`/chat/${thread.id}`);
  }

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? threads.filter((t) => t.title.toLowerCase().includes(q))
      : threads;
    const map = new Map<GroupKey, ThreadSummary[]>();
    for (const thread of filtered) {
      const key = bucket(thread.updatedAt);
      const existing = map.get(key) ?? [];
      existing.push(thread);
      map.set(key, existing);
    }
    return map;
  }, [threads, query]);

  const hasResults = Array.from(groups.values()).some((g) => g.length > 0);

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
          <PlusIcon data-icon="inline-start" />
          new chat
        </Button>
        {threads.length > 0 && (
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <SidebarInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search chats…"
              className="pl-8"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {GROUP_ORDER.map((key) => {
          const items = groups.get(key);
          if (!items || items.length === 0) return null;
          return (
            <SidebarGroup key={key}>
              <SidebarGroupLabel>{key}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      isActive={params?.id === thread.id}
                      render={
                        <Link
                          href={`/chat/${thread.id}`}
                          onClick={closeOnMobile}
                        />
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
                      <TrashIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
        {threads.length > 0 && !hasResults && (
          <p className="text-muted-foreground px-3 py-2 text-xs">
            no chats match “{query}”
          </p>
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
