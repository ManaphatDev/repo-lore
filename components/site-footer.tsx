'use client';

import Link from 'next/link';

import { useT } from '@/components/i18n/language-provider';
import { Logo, Wordmark } from '@/components/logo';

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  const explore = [
    { label: t.nav.features, href: '/#features' },
    { label: t.nav.how, href: '/#how' },
    { label: t.nav.stories, href: '/#examples' },
    { label: t.nav.faq, href: '/#faq' },
  ];

  const builtOn = [
    { label: 'GitHub REST API', href: 'https://docs.github.com/en/rest' },
    { label: 'Next.js', href: 'https://nextjs.org' },
    { label: 'Recharts', href: 'https://recharts.org' },
    { label: 'Vercel', href: 'https://vercel.com' },
  ];

  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-foreground">
              <Logo className="text-gold" />
              <Wordmark />
            </div>
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-4">{t.footer.explore}</h4>
            <ul className="space-y-2.5">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-4">{t.footer.builtOn}</h4>
            <ul className="space-y-2.5">
              {builtOn.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p className="font-mono">{t.footer.rights.replace('{year}', String(year))}</p>
          <p className="font-mono">{t.footer.realtime}</p>
        </div>
      </div>
    </footer>
  );
}
