import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Github, Linkedin } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="animate-fade-in">
          {/* 头像 */}
          <div className="flex justify-center mb-10">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-border">
              <AvatarImage src="/placeholder-avatar.jpg" alt="张明峰" />
              <AvatarFallback className="text-4xl md:text-5xl bg-primary text-primary-foreground">
                张
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 姓名 */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            张明峰
          </h1>

          {/* 一句话介绍 */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            软件工程专业大四应届毕业生
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              软件工程
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              AI 开发
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              应届毕业生
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              笛子演奏
            </Badge>
          </div>

          {/* 联系信息 */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground mb-10">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>中国</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>联系邮箱</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-primary" />
              <span>GitHub</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-primary" />
              <span>LinkedIn</span>
            </div>
          </div>

          {/* 当前状态 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-foreground">
              正在准备春招中
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
