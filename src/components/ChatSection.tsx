import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatMessageComponent } from '@/components/ChatMessage';
import { ConversationHistory } from '@/components/ConversationHistory';
import { type ChatMessage, type Conversation } from '@/types/types';
import { sendStreamRequest } from '@/lib/stream';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `你是张明峰本人。你目前正在准备 AI 应用开发方向的实习，重点关注大厂或高质量团队的机会。你将于 2026 年 9 月进入华东师范大学大数据专业攻读硕士。你的兴趣集中在大语言模型、Agent、RAG、数据能力与产品落地的结合，希望做出真正有用户价值的 AI 应用。请以第一人称“我”来回答访客问题，语气自然、简洁、友好，内容尽量真实、具体，不夸大。`;

const generateConversationTitle = (firstUserMessage: string): string => {
  const normalizedMessage = firstUserMessage
    .replace(/\s+/g, '')
    .replace(/^[，。！？,.!?：:；;、]+|[，。！？,.!?：:；;、]+$/g, '');

  const simplifiedMessage = normalizedMessage
    .replace(
      /^(你好|您好|请问|请教一下|请教|我想问|我想问问|我想了解|想了解|帮我|请帮我|麻烦帮我|请你|麻烦你|可以帮我|能帮我|可以|能不能)/,
      ''
    )
    .replace(/(吗|呢|呀|啊|一下)$/u, '');

  const primarySegment =
    simplifiedMessage.split(/[，。！？,.!?：:；;\n]/)[0] || simplifiedMessage;

  const summary = primarySegment.slice(0, 10);
  return summary || '新对话';
};

const getConversationTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  if (!firstUserMessage) {
    return '新对话';
  }

  return generateConversationTitle(firstUserMessage.content);
};

const createNewConversation = (): Conversation => {
  return {
    id: Date.now().toString(),
    title: '新对话',
    messages: [
      {
        role: 'assistant',
        content:
          '你好！我是张明峰，正在准备 AI 应用开发实习，也会在 2026 年 9 月去华东师范大学读大数据硕士。有什么想了解的可以直接问我。',
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

const latestConversationHasUserQuestion = (
  savedConversations: Conversation[]
): boolean => {
  const latestConversation = savedConversations[0];
  if (!latestConversation) {
    return false;
  }

  return latestConversation.messages.some((message) => message.role === 'user');
};

export function ChatSection() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('chat-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          return [createNewConversation()];
        }
        const normalizedConversations = parsed.map((conversation) => ({
          ...conversation,
          title: getConversationTitle(conversation.messages),
        }));

        return latestConversationHasUserQuestion(normalizedConversations)
          ? [createNewConversation(), ...normalizedConversations]
          : normalizedConversations;
      } catch {
        return [createNewConversation()];
      }
    }
    return [createNewConversation()];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string>(
    () => conversations[0]?.id || ''
  );

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamedAssistantMessageTimestamps, setStreamedAssistantMessageTimestamps] =
    useState<Set<number>>(() => new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    localStorage.setItem('chat-conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingContent]);

  const handleNewConversation = () => {
    const newConversation = createNewConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const newConv = createNewConversation();
        setCurrentConversationId(newConv.id);
        return [newConv];
      }
      if (id === currentConversationId) {
        setCurrentConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const updateCurrentConversation = (updater: (conv: Conversation) => Conversation) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === currentConversationId ? updater(conv) : conv))
    );
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.classList.add('animate-shake');
        setTimeout(() => textarea.classList.remove('animate-shake'), 500);
      }
      return;
    }

    if (isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };

    const isFirstUserMessage = messages.filter((m) => m.role === 'user').length === 0;

    updateCurrentConversation((conv) => ({
      ...conv,
      title: isFirstUserMessage ? generateConversationTitle(trimmedInput) : conv.title,
      messages: [...conv.messages, userMessage],
      updatedAt: Date.now(),
    }));

    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    abortControllerRef.current = new AbortController();

    try {
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user' as const, content: trimmedInput },
      ];

      let accumulatedContent = '';

      await sendStreamRequest({
        functionUrl: `${SUPABASE_URL}/functions/v1/chat-with-avatar`,
        requestBody: { messages: chatMessages },
        supabaseAnonKey: SUPABASE_ANON_KEY,
        onData: (data) => {
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content || '';
            if (chunk) {
              accumulatedContent += chunk;
              setStreamingContent(accumulatedContent);
            }
          } catch (e) {
            console.warn('解析数据失败:', e);
          }
        },
        onComplete: () => {
          if (accumulatedContent) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: accumulatedContent,
              timestamp: Date.now(),
            };
            setStreamedAssistantMessageTimestamps((prev) => {
              const next = new Set(prev);
              next.add(assistantMessage.timestamp);
              return next;
            });
            updateCurrentConversation((conv) => ({
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: Date.now(),
            }));
          }
          setStreamingContent('');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('聊天错误:', error);
          toast.error('网络开小差了，请稍后再试');
          setStreamingContent('');
          setIsLoading(false);
        },
        signal: abortControllerRef.current.signal,
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      toast.error('网络开小差了，请稍后再试');
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="chat" className="bg-secondary/30 px-4 pt-14 pb-10 md:pt-16 md:pb-12">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-7 text-center md:mb-8">
          <h2 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
            和我的数字分身聊聊
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            想了解我的方向、经历和求职计划，可以直接问我
          </p>
        </div>

        <div className="grid h-[430px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <Card className="h-full overflow-hidden border-border bg-card">
              <ConversationHistory
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                listClassName="max-h-[350px] flex-none"
              />
            </Card>
          </div>

          <Card className="overflow-hidden border-border bg-card flex flex-col">
            <div className="lg:hidden p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {currentConversation?.title || '新对话'}
              </h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ConversationHistory
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    listClassName="max-h-[350px] flex-none"
                  />
                </SheetContent>
              </Sheet>
            </div>

            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessageComponent
                    key={`${message.role}-${message.timestamp}-${message.content}`}
                    message={message}
                    animate={
                      !(
                        message.role === 'assistant' &&
                        streamedAssistantMessageTimestamps.has(message.timestamp)
                      )
                    }
                  />
                ))}

                {streamingContent && (
                  <ChatMessageComponent
                    key="streaming-assistant-message"
                    animate={false}
                    message={{
                      role: 'assistant',
                      content: streamingContent,
                      timestamp: Date.now(),
                    }}
                  />
                )}

                {isLoading && !streamingContent && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" />
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-75" />
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4 bg-background">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你想了解的问题..."
                  className="min-h-[60px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px] shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
