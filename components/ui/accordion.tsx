'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AccordionContextValue {
  open: string | null;
  toggle: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function Accordion({
  className,
  defaultValue = null,
  children,
}: {
  className?: string;
  defaultValue?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState<string | null>(defaultValue);
  const toggle = React.useCallback(
    (value: string) => setOpen((cur) => (cur === value ? null : value)),
    [],
  );
  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div className={cn('divide-y divide-border', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  value,
  question,
  children,
}: {
  value: string;
  question: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used within <Accordion>');
  const isOpen = ctx.open === value;

  return (
    <div className="group">
      <button
        type="button"
        onClick={() => ctx.toggle(value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-gold"
      >
        <span className="font-display text-lg font-medium tracking-tight">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300',
            isOpen && 'rotate-180 text-gold',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          isOpen
            ? 'grid-rows-[1fr] pb-6 opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Accordion, AccordionItem };
