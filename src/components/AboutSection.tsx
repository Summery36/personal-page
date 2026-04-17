import { useState } from 'react';
import { Briefcase, Sparkles, GraduationCap, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InfoDetail {
  icon: typeof Briefcase;
  title: string;
  content: string;
  color: string;
  details: {
    subtitle: string;
    description: string;
    highlights: string[];
  };
}

export function AboutSection() {
  const [selectedInfo, setSelectedInfo] = useState<InfoDetail | null>(null);

  const infoItems: InfoDetail[] = [
    {
      icon: Briefcase,
      title: '现在主要在做',
      content: '冲刺 AI 应用开发实习',
      color: 'text-primary',
      details: {
        subtitle: '以大厂实习机会为重点',
        description:
          '目前正在系统准备 AI 应用开发相关实习，优先关注大厂或高质量团队，希望在正式读研前进入真实业务场景，持续打磨工程与产品能力。',
        highlights: [
          '重点投递 AI 应用开发、Agent、LLM 应用和相关工程岗位',
          '系统准备前端、全栈工程能力，以及模型应用落地相关面试内容',
          '通过个人项目持续展示从想法到可运行产品的实现能力',
          '希望进入节奏快、要求高的团队积累真实业务经验',
        ],
      },
    },
    {
      icon: Sparkles,
      title: '兴趣方向',
      content: 'AI 应用开发',
      color: 'text-primary',
      details: {
        subtitle: '把模型能力做成真实产品',
        description:
          '我关注的不是停留在模型概念层面，而是如何把 LLM、Agent 和数据能力组合成真正可用、可交付、能解决问题的 AI 产品。',
        highlights: [
          '持续关注大语言模型、Agent、RAG 和工作流编排的实际应用',
          '重视提示工程、效果评估和用户体验之间的平衡',
          '希望把前端交互、后端服务和模型能力串成完整产品闭环',
          '更在意 AI 是否真正解决真实问题，而不是只做概念展示',
        ],
      },
    },
    {
      icon: GraduationCap,
      title: '下一阶段',
      content: '2026 年 9 月入学华东师大大数据硕士',
      color: 'text-primary',
      details: {
        subtitle: '研究生阶段规划',
        description:
          '我将在 2026 年 9 月进入华东师范大学大数据专业攻读硕士，希望继续强化数据、算法与工程结合的能力，同时保持对 AI 应用方向的长期投入。',
        highlights: [
          '在读研阶段继续围绕 AI 应用、数据智能和系统能力积累',
          '希望把课程研究与真实产品问题结合起来，而不是停留在纸面',
          '持续完善项目作品集、技术表达和工程落地能力',
          '长期目标是做出真正有用户价值的 AI 产品',
        ],
      },
    },
  ];

  return (
    <>
      <section id="about" className="flex min-h-screen items-center bg-background px-4 py-24 md:py-28">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center md:mb-20">
            <h2 className="mb-5 text-3xl font-bold text-primary md:text-4xl">
              关于我
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              了解更多关于我的背景、方向和下一阶段计划
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
            {infoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group h-full cursor-pointer border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
                  onClick={() => setSelectedInfo(item)}
                >
                  <CardContent className="flex h-full min-h-[260px] flex-col items-center justify-center p-8 text-center md:min-h-[300px] md:p-9">
                    <div className="mb-6 flex justify-center">
                      <div className="rounded-full bg-secondary p-3.5">
                        <Icon className={`h-8 w-8 ${item.color}`} />
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-5 text-sm leading-7 text-muted-foreground md:text-base">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-sm text-primary font-medium">
                      <span>查看详情</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedInfo} onOpenChange={() => setSelectedInfo(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedInfo && (
                <>
                  <div className="p-2 rounded-full bg-secondary">
                    <selectedInfo.icon className={`h-6 w-6 ${selectedInfo.color}`} />
                  </div>
                  <span>{selectedInfo.title}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedInfo && (
            <div className="space-y-6 pt-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {selectedInfo.details.subtitle}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedInfo.details.description}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-foreground">
                  详细信息
                </h4>
                <ul className="space-y-3">
                  {selectedInfo.details.highlights.map((highlight, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
