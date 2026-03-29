import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { isGatewayAvailable } from '@/lib/api';
import { PanelWrapper } from './PanelWrapper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_OPENCLAW_API_URL || '';
const TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

async function sendToGateway(message: string): Promise<string> {
  if (!API_URL) throw new Error('Gateway not configured');

  const res = await fetch(`${API_URL}/chat?token=${TOKEN}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      channel: 'webchat',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gateway error ${res.status}: ${text}`);
  }

  // Try streaming (SSE) or JSON response
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream')) {
    // Parse SSE stream
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            result += parsed.content || parsed.text || parsed.delta || '';
          } catch {
            result += data;
          }
        }
      }
    }
    return result || 'No response';
  }

  const json = await res.json();
  return json.response || json.content || json.message || json.text || JSON.stringify(json);
}

export function DispatchPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: gwOnline } = useQuery({
    queryKey: ['gw-available'],
    queryFn: isGatewayAvailable,
    refetchInterval: 15000,
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await sendToGateway(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `💋 Couldn't reach Adrian right now — ${err.message || 'gateway offline'}. Try again in a moment, queen.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PanelWrapper
      title="The Kissin' Booth 💋"
      icon={<MessageCircle className="h-5 w-5 text-primary" />}
      tint="pink"
    >
      {/* Status bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b border-border/50">
        {gwOnline ? (
          <>
            <Wifi className="h-3 w-3 text-success" />
            <span>Adrian is online</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success status-pulse" />
              Connected
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-destructive" />
            <span>Adrian is offline</span>
            <span className="ml-auto text-destructive/70">Gateway unreachable</span>
          </>
        )}
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="h-[50vh] sm:h-[55vh] overflow-y-auto space-y-3 py-3 px-1"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
            <div className="text-4xl">💋</div>
            <p className="font-serif text-lg text-foreground/70">Hey queen, what are we working on today?</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              This is your direct line to Adrian — full read & write access to the gateway. Plan, build, and execute.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'card-pink text-foreground rounded-br-md'
                  : 'card-lavender text-foreground rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>pre]:bg-background/50 [&>pre]:rounded-xl [&>pre]:p-3 [&>code]:text-primary [&>code]:bg-primary/10 [&>code]:rounded [&>code]:px-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1.5 opacity-60">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="card-lavender rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 pt-2 border-t border-border/50">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={gwOnline ? "Tell Adrian what to do..." : "Gateway offline — messages will fail"}
          disabled={sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50 min-h-[40px] max-h-[120px]"
          style={{ height: 'auto', overflow: 'hidden' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="rounded-xl h-10 w-10 shrink-0"
        >
          {sending ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </PanelWrapper>
  );
}
