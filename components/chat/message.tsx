"use client";

import type {
  EveDynamicToolPart,
  EveMessage,
  EveMessageInputRequest,
  EveMessagePart,
} from "eve/react";
import type { InputResponse } from "eve/client";
import { Brain, ChevronRight, Wrench } from "lucide-react";
import type { WeatherOutput } from "@/shared/tools/weather";
import { Markdown } from "./markdown";
import { WeatherCard } from "./tool/weather-card";
import { RepoListCard, type RepoListOutput } from "./tool/repo-list-card";
import { ToolResult } from "./tool/tool-result";
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
  if (message.role === "user") {
    const text = message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("")
      .trim();
    return (
      <div className="flex justify-end">
        <div className="bg-secondary text-secondary-foreground max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 text-sm">
      {message.parts.map((part, index) => (
        <Part
          key={index}
          part={part}
          onRespond={onRespond}
          canRespond={canRespond}
        />
      ))}
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
      <CollapsibleTrigger className="hover:text-foreground flex items-center gap-1.5 text-xs transition-colors">
        <Brain className="size-3.5" />
        <span>thinking</span>
        <ChevronRight className="size-3" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-border mt-1.5 ml-1.5 border-l pl-3 text-xs leading-relaxed whitespace-pre-wrap opacity-80">
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

  // Rich result cards for known tools; everything else gets a generic
  // collapsible result card.
  if (part.state === "output-available") {
    if (name === "weather") {
      return <WeatherCard output={part.output as WeatherOutput} />;
    }
    if (name === "list_repos") {
      return <RepoListCard output={part.output as RepoListOutput} />;
    }
    return <ToolResult name={name} output={part.output} />;
  }

  const label =
    part.state === "output-error"
      ? `${name} failed`
      : part.state === "output-denied"
        ? `${name} skipped`
        : `${name}…`;

  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Wrench className="size-3.5" />
      <span className="font-mono">{label}</span>
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
    <div className="bg-card flex max-w-md flex-col gap-3 rounded-xl border p-3.5">
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
                    : "outline"
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
