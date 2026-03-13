"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppShell } from "@/components/app-shell";
import { cn, randomUUID } from "@/lib/utils";
import { isLoggedIn, getUser, getChatMessages, addChatMessage } from "@/lib/storage";
import { CHAT_CHANNELS, DEMO_CHAT_MESSAGES } from "@/lib/data";
import type { ChatChannel, ChatMessage, User } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChatChannel>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize demo messages for a channel
  const initializeDemoMessages = (channel: ChatChannel) => {
    const stored = getChatMessages(channel);
    if (stored.length === 0) {
      const demoMessages = DEMO_CHAT_MESSAGES[channel];
      const now = new Date();
      demoMessages.forEach((msg, index) => {
        const message: ChatMessage = {
          id: randomUUID(),
          channel,
          userId: msg.fanId,
          userName: msg.userName,
          fanId: msg.fanId,
          text: msg.text,
          timestamp: new Date(now.getTime() - (demoMessages.length - index) * 60000).toISOString(),
          isOfficial: msg.isOfficial,
        };
        addChatMessage(channel, message);
      });
    }
    return getChatMessages(channel);
  };

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    setUser(getUser());
    
    // Initialize messages for default channel
    const msgs = initializeDemoMessages(activeChannel);
    setMessages(msgs);

    const handleChatMessage = () => {
      setMessages(getChatMessages(activeChannel));
    };
    
    window.addEventListener("chat-message", handleChatMessage);
    return () => window.removeEventListener("chat-message", handleChatMessage);
  }, [router, activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!mounted || !user) return null;

  const handleChannelChange = (channel: ChatChannel) => {
    setActiveChannel(channel);
    const msgs = initializeDemoMessages(channel);
    setMessages(msgs);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: randomUUID(),
      channel: activeChannel,
      userId: user.fanId,
      userName: user.name,
      fanId: user.fanId,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    addChatMessage(activeChannel, message);
    setMessages(getChatMessages(activeChannel));
    setNewMessage("");
  };

  const activeChannelInfo = CHAT_CHANNELS.find(c => c.id === activeChannel);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Chat del Estadio</h1>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Foro regulado
              </Badge>
            </div>
            
            {/* Channel Pills */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {CHAT_CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.id)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    activeChannel === channel.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span>{channel.emoji}</span>
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
            
            {/* Channel Description */}
            <p className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              {activeChannelInfo?.description}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="mx-auto max-w-2xl py-4 space-y-4">
            {messages.map(message => {
              const isOwn = message.userId === user.fanId;
              const isOfficial = message.isOfficial;
              
              if (isOfficial) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="flex items-center gap-2 px-4 py-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm">{message.text}</span>
                      </CardContent>
                    </Card>
                  </div>
                );
              }
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border rounded-bl-sm"
                    )}
                  >
                    {!isOwn && (
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium">{message.userName}</span>
                        <span className="text-xs opacity-60">
                          {message.fanId.slice(0, 6)}...
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className={cn(
                      "mt-1 text-right text-xs",
                      isOwn ? "opacity-70" : "text-muted-foreground"
                    )}>
                      {formatDistanceToNow(new Date(message.timestamp), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="flex-shrink-0 border-t bg-background px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Comparte info del estadio..."
                className="flex-1"
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Solo usuarios con FanID pueden publicar</span>
              <Badge variant="outline" className="text-xs">+2 pts/10 msgs</Badge>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
