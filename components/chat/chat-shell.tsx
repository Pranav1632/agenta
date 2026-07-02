"use client";

import { useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Eraser, ExternalLink, MessageSquarePlus, RefreshCcw, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { cn } from "@/lib/utils";

const starterPrompts = [
  "Explain React Server Components with a tiny example.",
  "Draft a production checklist for a Next.js chat app.",
  "Write a TypeScript function that debounces async calls.",
];

export function ChatShell() {
  const [input, setInput] = useState("");
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
      }),
    []
  );

  const { messages, sendMessage, regenerate, stop, status, error, setMessages, clearError } =
    useChat<UIMessage>({
      transport,
      experimental_throttle: 40,
    });

  const isGenerating = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  async function submitMessage(content = input) {
    const text = content.trim();

    if (!text || isGenerating) {
      return;
    }

    setInput("");
    clearError();
    await sendMessage({ text });
  }

  function clearChat() {
    stop();
    clearError();
    setMessages([]);
    setInput("");
  }

  return (
    <TooltipProvider>
      <main className="flex min-h-svh bg-background text-foreground">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-muted/30 px-3 py-4 lg:flex lg:flex-col">
          <div className="flex items-center gap-2 px-2 pb-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquarePlus className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Gemini Chat</p>
              <p className="truncate text-xs text-muted-foreground">Gemini 2.5 Flash</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mb-4 w-full justify-start"
            onClick={clearChat}
            disabled={!hasMessages && !input}
          >
            <MessageSquarePlus data-icon="inline-start" />
            New chat
          </Button>

          <div className="space-y-2">
            <p className="px-2 text-xs font-medium text-muted-foreground">Try asking</p>
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                className="w-full rounded-lg px-2 py-2 text-left text-sm leading-5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => submitMessage(prompt)}
                disabled={isGenerating}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
            Session-only history keeps this demo private to your current tab.
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur md:px-6">
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold md:text-base">Gemini Chat</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Streaming Markdown responses with session history
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {isGenerating ? (
                <IconButton label="Stop generation" onClick={stop}>
                  <Square className="size-4 fill-current" />
                </IconButton>
              ) : (
                <IconButton
                  label="Regenerate last response"
                  onClick={() => regenerate()}
                  disabled={!messages.some((message) => message.role === "assistant")}
                >
                  <RefreshCcw className="size-4" />
                </IconButton>
              )}
              <IconButton label="Clear chat" onClick={clearChat} disabled={!hasMessages && !input}>
                <Eraser className="size-4" />
              </IconButton>
              <IconButton
                label="Open Vercel AI SDK"
                onClick={() => window.open("https://github.com", "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="size-4" />
              </IconButton>
            </div>
          </header>

          <MessageList
            messages={messages}
            status={status}
            error={error}
            onRegenerate={() => regenerate()}
            scrollTargetRef={scrollTargetRef}
          />

          {!hasMessages ? (
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-2 px-4 pb-3 sm:grid-cols-3 md:px-6 xl:max-w-7xl">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-lg border border-border bg-background px-3 py-3 text-left text-sm leading-5 shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => submitMessage(prompt)}
                  disabled={isGenerating}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={() => submitMessage()}
            onStop={stop}
            disabled={status === "submitted"}
            isGenerating={isGenerating}
          />
        </section>
      </main>
    </TooltipProvider>
  );
}

function IconButton({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          variant="ghost"
          size="icon"
          className={cn("rounded-lg", className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
