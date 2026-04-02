import { useState } from 'react';
import { Briefcase, Sparkles, Music, ChevronRight } from 'lucide-react';
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
      content: '私企和央国企的春招准备',
      color: 'text-primary',
      details: {
        subtitle: '求职准备中',
        description: '目前正在积极准备2026年春季校园招聘，目标是进入优秀的私企或央国企，开启职业生涯。',
        highlights: [
          '准备私企技术岗位面试，重点关注互联网大厂和创新型企业',
          '准备央国企笔试和面试，了解国企文化和工作模式',
          '同时进行毕业设计，确保顺利毕业',
          '持续学习和提升技术能力，保持竞争力',
        ],
      },
    },
    {
      icon: Sparkles,
      title: '兴趣方向',
      content: 'AI 开发',
      color: 'text-primary',
      details: {
        subtitle: '人工智能开发',
        description: '对人工智能技术充满热情，关注AI领域的最新发展，希望能够用AI技术开发出真正有用的产品。',
        highlights: [
          '关注大语言模型（LLM）的最新进展和应用',
          '学习机器学习和深度学习相关技术',
          '探索AI在实际场景中的应用可能性',
          '思考如何用AI解决真实问题，创造价值',
        ],
      },
    },
    {
      icon: Music,
      title: '有记忆点的特点',
      content: '会吹笛子',
      color: 'text-primary',
      details: {
        subtitle: '笛子演奏爱好者',
        description: '从小学习笛子演奏，这是我的一个特别爱好。音乐让我在紧张的学习和工作之余找到放松和平衡。',
        highlights: [
          '多年笛子演奏经验，掌握多种曲目',
          '参加过学校文艺演出和社团活动',
          '音乐培养了我的耐心和专注力',
          '通过音乐结识了很多志同道合的朋友',
        ],
      },
    },
  ];

  return (
    <>
      <section id="about" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              关于我
            </h2>
            <p className="text-muted-foreground">
              了解更多关于我的信息
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border-border bg-card cursor-pointer"
                  onClick={() => setSelectedInfo(item)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-secondary">
                        <Icon className={`h-8 w-8 ${item.color}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
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

      {/* 详情对话框 */}
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
