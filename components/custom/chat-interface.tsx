"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GlowEffect,
  JarvisLogo,
  MessageBubble,
  StatusDot,
  TypingIndicator,
} from "@/components/custom";
import type { ChatMessage } from "@/types";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Good evening, sir. JARVIS systems online. How may I assist you today?",
  },
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date(),
  };
}

async function fetchJarvisResponse(userMessage: string): Promise<string> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const responses = [
    `Understood, sir. I've analyzed your request regarding "${userMessage}". All parameters are within acceptable range.`,
    `Processing complete. Regarding "${userMessage}" — I recommend proceeding with caution. Shall I elaborate?`,
    `Affirmative. I've cross-referenced "${userMessage}" against my databases. Ready for your next directive.`,
    `Noted, sir. "${userMessage}" has been logged. Is there anything else you require?`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetchJarvisResponse(trimmed);
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", response),
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <GlowEffect className="w-full max-w-3xl">
          <Card className="flex h-[calc(100dvh-2rem)] max-h-[800px] flex-col py-0">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <JarvisLogo size={36} animated={!isTyping} />
                  <div>
                    <CardTitle className="text-gradient-primary font-heading text-lg uppercase tracking-wider">
                      JARVIS
                    </CardTitle>
                    <p className="text-xs tracking-wide uppercase text-muted-foreground">
                      Just A Rather Very Intelligent System
                    </p>
                  </div>
                </div>
                <StatusDot status={isTyping ? "typing" : "online"} />
              </div>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-hidden px-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}

                  {isTyping && (
                    <div className="mr-auto animate-slide-up">
                      <div className="rounded-xl border border-border bg-card px-4 py-3">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} aria-hidden="true" />
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="border-t border-border p-4">
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter command, sir..."
                  disabled={isTyping}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                >
                  <SendIcon />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </GlowEffect>
      </main>
    </div>
  );
}
