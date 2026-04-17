import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Mail, Send } from 'lucide-react';

export function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('1127232045@qq.com');
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      // Keep the current UI unchanged if clipboard access fails.
    }
  };

  return (
    <section
      id="contact"
      className="flex min-h-screen items-center bg-background px-4 py-24 md:py-28"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
            联系方式
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            如果你想聊实习机会、项目想法或者进一步认识我，可以从这里联系我。
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground">
                <Send className="h-4 w-4 text-primary" />
                更直接的方式：邮件或 GitHub 都可以
              </div>

              <div className="flex w-full flex-col justify-center gap-3 pt-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleCopyEmail}
                  size="lg"
                  className="h-12 px-6"
                >
                  <Mail className="h-4 w-4" />
                  {emailCopied ? '邮箱已复制' : '复制邮箱'}
                </Button>

                <Button asChild variant="outline" size="lg" className="h-12 px-6">
                  <a
                    href="https://github.com/Summery36"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="打开 GitHub 主页"
                  >
                    <Github className="h-4 w-4 text-primary" />
                    GitHub 主页
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
