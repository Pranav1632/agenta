"use client";

import { Check, Copy, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { UIMessage } from "ai";

import { MarkdownMessage } from "@/components/chat/markdown-message";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: UIMessage;
  isLastAssistant: boolean;
  onRegenerate: () => void;
};

export function MessageBubble({ message, isLastAssistant, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => getMessageText(message), [message]);
  const isUser = message.role === "user";

  async function copyMessage() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article className={cn("flex w-full gap-3", isUser && "justify-end")}>
      {!isUser ? (
        <Avatar className="mt-1 size-8 border border-border">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">AI</AvatarFallback>
        </Avatar>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          isUser ? "order-first max-w-[88%] md:max-w-[52rem]" : "flex-1"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-4 py-3 md:px-5",
            isUser
              ? "bg-primary text-primary-foreground"
              : "w-full border border-border bg-card/70 shadow-sm"
          )}
        >
          {text ? (
            isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
            ) : (
              <MarkdownMessage content={text} />
            )
          ) : (
            <p className="text-sm text-muted-foreground">...</p>
          )}
        </div>

        {text ? (
          <div className={cn("mt-2 flex gap-1", isUser && "justify-end")}>
            <ActionButton label={copied ? "Copied" : "Copy"} onClick={copyMessage}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </ActionButton>
            {!isUser && isLastAssistant ? (
              <ActionButton label="Regenerate" onClick={onRegenerate}>
                <RefreshCcw className="size-3.5" />
              </ActionButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ActionButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
