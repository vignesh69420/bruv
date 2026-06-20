import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getThreadForUser } from "@/lib/server/threads";
import { Chat } from "@/components/chat/chat";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }

  const thread = await getThreadForUser(session.user.id, id);
  if (!thread) {
    notFound();
  }

  return <Chat threadId={id} initialState={thread.state} />;
}
