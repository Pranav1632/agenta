"use client";

import { CornerDownLeft, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  disabled?: boolean;
  isGenerating: boolean;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isGenerating,
}: ChatComposerProps) {
  const canSend = value.trim().length > 0 && !disabled && !isGenerating;

  return (
    <div className="sticky bottom-0 border-t border-border bg-background/95 px-3 py-3 backdrop-blur md:px-6">
      <form
        className="mx-auto flex max-w-6xl items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-sm xl:max-w-7xl"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Textarea
          aria-label="Message"
          value={value}
          placeholder="Message Gemini..."
          className="max-h-48 min-h-11 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          disabled={disabled}
        />
        {isGenerating ? (
          <Button type="button" size="icon-lg" aria-label="Stop generation" onClick={onStop}>
            <Square className="size-4 fill-current" />
          </Button>
        ) : (
          <Button type="submit" size="icon-lg" aria-label="Send message" disabled={!canSend}>
            <CornerDownLeft className="size-4" />
          </Button>
        )}
      </form>
      <p className="mx-auto mt-2 max-w-6xl text-center text-xs text-muted-foreground xl:max-w-7xl">
        Gemini can make mistakes. Review important code and facts before using them.
      </p>
    </div>
  );
}
