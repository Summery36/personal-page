import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Github, MessageSquare, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('1127232045@qq.com');
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      // Ignore clipboard failures to avoid changing the current UI.
    }
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
      <div className="container mx-auto max-w-4xl">
        <div className="animate-fade-in text-center">
          <div className="mb-6 flex justify-center">
            <Avatar className="h-28 w-28 border-2 border-border md:h-36 md:w-36">
              <AvatarImage src="/placeholder-avatar.jpg" alt="张明峰" />
              <AvatarFallback className="text-4xl md:text-5xl bg-primary text-primary-foreground">
                张
              </AvatarFallback>
            </Avatar>
          </div>

          <h1 className="mb-3 text-5xl font-bold tracking-tight text-primary md:text-7xl">
            张明峰
          </h1>

          <p className="mx-auto mb-5 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            软件工程背景，正在准备 AI 应用开发实习，重点关注大厂机会，
            并将于 2026 年 9 月进入华东师范大学大数据专业读研。
          </p>

          <div className="mb-8 flex justify-center">
            <div className="inline-flex max-w-2xl items-center justify-center rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground md:px-5 md:text-base">
              目前重点：冲刺 AI 应用开发实习
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => scrollToSection('chat')}
              size="lg"
              className="h-12 w-full max-w-xs px-6 text-sm md:px-7 md:text-base"
            >
              <MessageSquare className="h-4 w-4" />
              和我的数字分身对话
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection('about')}
              className="h-12 w-full max-w-xs px-5 text-sm md:text-base"
            >
              查看个人信息
            </Button>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>中国</span>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex items-center gap-2 border-0 bg-transparent p-0 text-inherit"
              aria-label="复制邮箱 1127232045@qq.com"
            >
              <Mail className="h-4 w-4 text-primary" />
              <span>{emailCopied ? '已复制' : '联系邮箱'}</span>
            </button>
            <a
              href="https://github.com/Summery36"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-inherit no-underline"
              aria-label="打开 GitHub 主页"
            >
              <Github className="h-4 w-4 text-primary" />
              <span>GitHub</span>
            </a>
            <a
              href="https://space.bilibili.com/519215825?spm_id_from=333.1007.0.0"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-inherit no-underline"
              aria-label="打开 B 站主页"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 4 7 6" />
                <path d="m15 4 2 2" />
                <path d="M6.5 7h11A2.5 2.5 0 0 1 20 9.5v6A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-6A2.5 2.5 0 0 1 6.5 7Z" />
                <path d="M10 11v2" />
                <path d="M14 11v2" />
                <path d="M9 15c.8.5 1.9.8 3 .8s2.2-.3 3-.8" />
              </svg>
              <span>B站</span>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              软件工程
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              AI 应用
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              华东师大读研
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
