'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useT } from '@/components/i18n/language-provider';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Repository Lore"
      width={50}
      height={50}
      className={cn('h-[50px] w-[50px]', className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      className={cn(
        'font-display text-lg font-semibold tracking-tight',
        className,
      )}
    >
      {t.brand.wordmarkBefore}&nbsp;<span className="text-gold">{t.brand.wordmarkHighlight}</span>
    </span>
  );
}
