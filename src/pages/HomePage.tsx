import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ChatSection } from '@/components/ChatSection';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ChatSection />

      <footer className="border-t border-border bg-card px-4 py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 张明峰的个人主页. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
