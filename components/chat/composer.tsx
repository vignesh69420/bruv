"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Composer({
  onSend,
  onStop,
  isBusy,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  isBusy: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const text = value.trim();
    if (!text || isBusy) return;
    onSend(text);
    setValue("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-input bg-background focus-within:border-ring flex items-end gap-2 rounded-2xl border p-2 shadow-sm">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="message bruv…"
        rows={1}
        className="max-h-40 min-h-9 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      {isBusy ? (
        <Button size="icon" variant="secondary" onClick={onStop} aria-label="Stop">
          <Square />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Send"
        >
          <ArrowUp />
        </Button>
      )}
    </div>
  );
}
