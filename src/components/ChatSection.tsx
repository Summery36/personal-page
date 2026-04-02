import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageComponent } from '@/components/ChatMessage';
import { type ChatMessage } from '@/types/types';
import { sendStreamRequest } from '@/lib/stream';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 系统提示词
const SYSTEM_PROMPT = `你是张明峰本人。你是一个软件工程专业大四应届毕业生，正在准备私企和央国企的春招，同时在做毕业设计。你的兴趣方向是AI开发，关心AI的最新发展以及如何用AI做出有用的产品。你有一个比较有记忆点的特点是会吹笛子。请以第一人称"我"来回答访客的问题，语气自然、简洁、友好。`;

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '你好！我是张明峰的数字分身,你可以问我任何关于他的问题 :)',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    // 验证输入
    if (!trimmedInput) {
      // 输入框抖动提示
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

    setMessages((prev) => [...prev, userMessage]);
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
            setMessages((prev) => [...prev, assistantMessage]);
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
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            和我的数字分身聊聊
          </h2>
          <p className="text-muted-foreground">
            有什么想了解的，尽管问我
          </p>
        </div>

        <Card className="overflow-hidden border-border bg-card">
          {/* 消息列表 */}
          <ScrollArea ref={scrollAreaRef} className="h-[300px] md:h-[350px] p-4">
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
    </section>
  );
}
