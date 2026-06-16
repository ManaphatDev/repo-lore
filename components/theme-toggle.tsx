'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useT } from '@/components/i18n/language-provider';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={t.a11y.toggleTheme}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/70 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {mounted ? (
        <span className="relative block h-[18px] w-[18px]">
          <Sun
            className={cn(
              'absolute inset-0 h-[18px] w-[18px] transition-all duration-500',
              isDark
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100',
            )}
          />
          <Moon
            className={cn(
              'absolute inset-0 h-[18px] w-[18px] transition-all duration-500',
              isDark
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0',
            )}
          />
        </span>
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
