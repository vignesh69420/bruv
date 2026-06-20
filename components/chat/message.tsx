"use client";

import type {
  EveDynamicToolPart,
  EveMessage,
  EveMessageInputRequest,
  EveMessagePart,
} from "eve/react";
import type { InputResponse } from "eve/client";
import { Wrench } from "lucide-react";
import type { WeatherOutput } from "@/shared/tools/weather";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Button } from "@/components/ui/button";
import { WeatherCard } from "./tool/weather-card";
import { RepoListCard, type RepoListOutput } from "./tool/repo-list-card";
import { PrListCard, type PrListOutput } from "./tool/pr-list-card";
import { ImageCard, type ImageOutput } from "./tool/image-card";
import { FortniteCard, type FortniteOutput } from "./tool/fortnite-card";
import { ToolResult } from "./tool/tool-result";

export function ChatMessage({
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
      <Message from="user">
        <MessageContent>
          <span className="whitespace-pre-wrap">{text}</span>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant">
      <MessageContent>
        {message.parts.map((part, index) => (
          <Part
            key={index}
            part={part}
            onRespond={onRespond}
            canRespond={canRespond}
          />
        ))}
      </MessageContent>
    </Message>
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
    return part.text ? <MessageResponse>{part.text}</MessageResponse> : null;
  }
  if (part.type === "reasoning") {
    return part.text ? (
      <Reasoning isStreaming={part.state === "streaming"}>
        <ReasoningTrigger />
        <ReasoningContent>{part.text}</ReasoningContent>
      </Reasoning>
    ) : null;
  }
  if (part.type === "dynamic-tool") {
    return <ToolPart part={part} onRespond={onRespond} canRespond={canRespond} />;
  }
  return null;
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

  if (part.state === "output-available") {
    if (name === "weather") {
      return <WeatherCard output={part.output as WeatherOutput} />;
    }
    if (name === "list_repos") {
      return <RepoListCard output={part.output as RepoListOutput} />;
    }
    if (name === "list_prs") {
      return <PrListCard output={part.output as PrListOutput} />;
    }
    if (name === "generate_image") {
      return <ImageCard output={part.output as ImageOutput} />;
    }
    if (name === "fortnite_stats") {
      const out = part.output as FortniteOutput & { error?: string };
      return out?.error ? null : <FortniteCard output={out} />;
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
