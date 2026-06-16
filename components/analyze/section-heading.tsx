import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div id={id} className={cn('max-w-2xl scroll-mt-24', className)}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
