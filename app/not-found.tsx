'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useT } from '@/components/i18n/language-provider';

export default function NotFound() {
  const t = useT();
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Logo className="h-10 w-10 text-gold/70" />
      <p className="mt-6 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {t.notFound.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {t.notFound.title}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        {t.notFound.body}
      </p>
      <Link href="/" className={buttonVariants({ variant: 'foil', className: 'mt-8' })}>
        {t.notFound.home}
      </Link>
    </div>
  );
}
