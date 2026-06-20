"use client";

import type {
  EveDynamicToolPart,
  EveMessage,
  EveMessageInputRequest,
  EveMessagePart,
} from "eve/react";
import type { InputResponse } from "eve/client";
import { Brain, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Message({
  message,
  onRespond,
  canRespond,
}: {
  message: EveMessage;
  onRespond: (responses: InputResponse[]) => void;
  canRespond: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser && "justify-end")}>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {message.parts.map((part, index) => (
          <Part
            key={index}
            part={part}
            onRespond={onRespond}
            canRespond={canRespond}
          />
        ))}
      </div>
    </div>
  );
}

function Part({
  part,
  onRespond,
  canRespond,
}: {
  part: EveMessagePart;
  onRespond: (responses: InputResponse[]) => void;
  canRespond: boolean;
}) {
  if (part.type === "text") {
    return part.text ? <Markdown>{part.text}</Markdown> : null;
  }
  if (part.type === "reasoning") {
    return part.text ? <Reasoning text={part.text} /> : null;
  }
  if (part.type === "dynamic-tool") {
    return <ToolPart part={part} onRespond={onRespond} canRespond={canRespond} />;
  }
  return null;
}

function Reasoning({ text }: { text: string }) {
  return (
    <Collapsible className="text-muted-foreground">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs">
        <Brain className="size-3" />
        <span>thinking</span>
        <ChevronRight className="size-3" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 text-xs whitespace-pre-wrap opacity-80">
        {text}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ToolPart({
  part,
  onRespond,
  canRespond,
}: {
  part: EveDynamicToolPart;
  onRespond: (responses: InputResponse[]) => void;
  canRespond: boolean;
}) {
  const name = part.toolMetadata?.eve?.name ?? part.toolName;
  const request = part.toolMetadata?.eve?.inputRequest;

  if (part.state === "approval-requested" && request) {
    return (
      <ApprovalRequest
        request={request}
        onRespond={onRespond}
        canRespond={canRespond}
      />
    );
  }

  const label =
    part.state === "output-error"
      ? `${name} failed`
      : part.state === "output-denied"
        ? `${name} skipped`
        : part.state === "output-available"
          ? `used ${name}`
          : `${name}…`;

  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Wrench className="size-3" />
      <span>{label}</span>
    </div>
  );
}

function ApprovalRequest({
  request,
  onRespond,
  canRespond,
}: {
  request: EveMessageInputRequest;
  onRespond: (responses: InputResponse[]) => void;
  canRespond: boolean;
}) {
  const options =
    request.options && request.options.length > 0
      ? request.options
      : [
          { id: "approve", label: "Approve", style: "primary" as const },
          { id: "deny", label: "Deny", style: "default" as const },
        ];

  return (
    <div className="bg-background text-foreground flex flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm">{request.prompt}</p>
      {canRespond && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={
                option.style === "danger"
                  ? "destructive"
                  : option.style === "primary"
                    ? "default"
                    : "secondary"
              }
              onClick={() =>
                onRespond([{ requestId: request.requestId, optionId: option.id }])
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
