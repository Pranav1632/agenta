"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import type { ChatStatus, UIMessage } from "ai";

import { MessageBubble } from "@/components/chat/message-bubble";
import { Button } from "@/components/ui/button";

type MessageListProps = {
  messages: UIMessage[];
  status: ChatStatus;
  error?: Error;
  onRegenerate: () => void;
  scrollTargetRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({
  messages,
  status,
  error,
  onRegenerate,
  scrollTargetRef,
}: MessageListProps) {
  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status, scrollTargetRef]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 md:px-6 xl:max-w-7xl">
        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              AI
            </div>
            <h2 className="text-2xl font-semibold tracking-normal md:text-3xl">
              How can I help today?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Ask for explanations, code, debugging help, writing, planning, or anything else that
              benefits from a fast streaming assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLastAssistant={
                  message.role === "assistant" &&
                  index === messages.findLastIndex((item) => item.role === "assistant")
                }
                onRegenerate={onRegenerate}
              />
            ))}
          </div>
        )}

        {status === "submitted" ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="size-2 animate-pulse rounded-full bg-foreground" />
            Gemini is thinking
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">The chat request failed.</p>
            <p className="mt-1 text-destructive/90">{error.message}</p>
            <Button className="mt-3" variant="destructive" size="sm" onClick={onRegenerate}>
              Try again
            </Button>
          </div>
        ) : null}

        <div ref={scrollTargetRef} className="h-1" />
      </div>
    </div>
  );
}
