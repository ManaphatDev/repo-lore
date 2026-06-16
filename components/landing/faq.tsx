'use client';

import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useT } from '@/components/i18n/language-provider';
import { Reveal } from '@/components/reveal';

export function Faq() {
  const t = useT();

  return (
    <section id="faq" className="py-24">
      <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <header>
            <span className="eyebrow">{t.faq.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.faq.title}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              {t.faq.subtitle}
            </p>
          </header>
        </Reveal>

        <Reveal delay={100}>
          <Accordion defaultValue="0">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={String(i)} question={item.q}>
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
