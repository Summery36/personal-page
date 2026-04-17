import { Bot, Code2, LayoutPanelTop, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkItem {
  icon: typeof Bot;
  title: string;
  description: string;
  tags: string[];
}

export function WorksSection() {
  const workItems: WorkItem[] = [
    {
      icon: Bot,
      title: 'AI 个人主页与数字分身',
      description:
        '把个人介绍、联系方式和 AI 对话入口整合到同一个主页里，让访客能更快了解我和我正在做的方向。',
      tags: ['React', 'Vite', 'Tailwind'],
    },
    {
      icon: Code2,
      title: '对话式个人信息展示',
      description:
        '把传统静态介绍改成可提问的对话体验，支持流式回复和历史对话，让信息获取更自然。',
      tags: ['LLM 应用', 'Streaming', '交互设计'],
    },
    {
      icon: LayoutPanelTop,
      title: '主页前端体验优化',
      description:
        '持续优化首屏层级、内容组织和移动端可读性，让页面在表达自己时更直接、更清晰。',
      tags: ['响应式', '信息层级', '体验优化'],
    },
  ];

  return (
    <section
      id="works"
      className="flex min-h-screen items-center bg-secondary/20 px-4 py-24 md:py-28"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
            作品展示
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            这里是我最近在做和持续打磨的作品方向。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {workItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
              >
                <CardContent className="flex h-full min-h-[280px] flex-col p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mb-6 flex-1 leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <span>想了解更多可直接问数字分身</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
