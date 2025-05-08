import { UptimeLayoutClient } from "./components/UptimeLayoutClient";
import type { ReactNode } from "react";
import { AnimatedGradientBackground } from '@/components/ui/AnimatedGradientBackground';

interface LayoutProps {
  children: ReactNode;
}

export default function UptimeLayout({ children }: LayoutProps) {
  return (
    <AnimatedGradientBackground>
      <UptimeLayoutClient>
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {children}
          </div>
        </div>
      </UptimeLayoutClient>
    </AnimatedGradientBackground>
  );
}