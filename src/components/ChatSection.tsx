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

// 系统提示词
const SYSTEM_PROMPT = `你是张明峰本人。你是一个软件工程专业大四应届毕业生，正在准备私企和央国企的春招，同时在做毕业设计。你的兴趣方向是AI开发，关心AI的最新发展以及如何用AI做出有用的产品。你有一个比较有记忆点的特点是会吹笛子。请以第一人称"我"来回答访客的问题，语气自然、简洁、友好。`;

// 生成对话标题
const generateConversationTitle = (firstUserMessage: string): string => {
  const maxLength = 20;
  if (firstUserMessage.length <= maxLength) {
    return firstUserMessage;
  }
  return firstUserMessage.slice(0, maxLength) + '...';
};

// 创建新对话
const createNewConversation = (): Conversation => {
  return {
    id: Date.now().toString(),
    title: '新对话',
    messages: [
      {
        role: 'assistant',
        content: '你好！我是张明峰，有什么想了解的可以随时问我 😊',
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export function ChatSection() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('chat-conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // 保存对话到 localStorage
  useEffect(() => {
    localStorage.setItem('chat-conversations', JSON.stringify(conversations));
  }, [conversations]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingContent]);

  // 新建对话
  const handleNewConversation = () => {
    const newConversation = createNewConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  // 切换对话
  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  // 删除对话
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

  // 更新当前对话
  const updateCurrentConversation = (updater: (conv: Conversation) => Conversation) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId ? updater(conv) : conv
      )
    );
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    // 验证输入
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

    // 添加用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };

    // 更新对话标题（如果是第一条用户消息）
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

    // 创建中断控制器
    abortControllerRef.current = new AbortController();

    try {
      // 准备消息历史
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
          // 添加助手消息
          if (accumulatedContent) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: accumulatedContent,
              timestamp: Date.now(),
            };
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
    <section id="chat" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            和我的数字分身聊聊
          </h2>
          <p className="text-muted-foreground">
            有什么想了解的，尽管问我
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[450px]">
          {/* 桌面端对话历史 */}
          <div className="hidden lg:block">
            <Card className="h-full overflow-hidden border-border bg-card">
              <ConversationHistory
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </Card>
          </div>

          {/* 聊天区域 */}
          <Card className="overflow-hidden border-border bg-card flex flex-col">
            {/* 移动端对话历史按钮 */}
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
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* 消息列表 */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessageComponent key={index} message={message} />
                ))}
                
                {/* 流式输出中的消息 */}
                {streamingContent && (
                  <ChatMessageComponent
                    message={{
                      role: 'assistant',
                      content: streamingContent,
                      timestamp: Date.now(),
                    }}
                  />
                )}

                {/* 加载状态 */}
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

            {/* 输入区域 */}
            <div className="border-t border-border p-4 bg-background">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
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
