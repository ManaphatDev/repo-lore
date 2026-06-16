'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/i18n/language-toggle';
import { useT } from '@/components/i18n/language-provider';
import { Logo, Wordmark } from '@/components/logo';

export function SiteHeader() {
  const t = useT();

  const nav = [
    { href: '/#features', label: t.nav.features },
    { href: '/#how', label: t.nav.how },
    { href: '/#examples', label: t.nav.stories },
    { href: '/#faq', label: t.nav.faq },
    { href: '/#status', label: t.nav.status },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-foreground"
        >
          <Logo />
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a
            href="https://github.com/ManaphatDev/repo-lore"
            target="_blank"
            rel="noreferrer"
            aria-label={t.a11y.sourceCode}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/70 transition-colors hover:text-gold sm:inline-flex"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <ThemeToggle />
          <Link
            href="/#try"
            className={buttonVariants({ variant: 'foil', size: 'sm' })}
          >
            {t.nav.readRepo}
          </Link>
        </div>
      </div>
    </header>
  );
}
