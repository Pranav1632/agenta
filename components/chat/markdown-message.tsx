"use client";

import { Check, Copy } from "lucide-react";
import { Children, isValidElement, type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";

type MarkdownMessageProps = {
  content: string;
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ children, ...props }) => (
            <a
              className="font-medium underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = extractText(children);
  const language = extractLanguage(children);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-white/10 bg-black shadow-sm">
      <div className="flex h-9 items-center justify-between border-b border-white/10 bg-zinc-950 px-3">
        <span className="text-xs font-medium text-zinc-400">{language || "code"}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Copy code"
          className="text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={copyCode}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto bg-black p-4 text-sm leading-6 text-slate-50 [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:text-slate-50">
        {children}
      </pre>
    </div>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function extractLanguage(node: ReactNode): string {
  const child = Children.toArray(node).find(isValidElement);

  if (!isValidElement<{ className?: string }>(child)) {
    return "";
  }

  const match = child.props.className?.match(/language-(\w+)/);

  return match?.[1] ?? "";
}
