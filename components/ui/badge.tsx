import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gold/30 bg-gold/10 text-gold',
        secondary: 'border-border bg-muted text-muted-foreground',
        outline: 'border-border text-foreground',
        oxblood: 'border-oxblood/30 bg-oxblood/10 text-oxblood',
        verdigris: 'border-verdigris/30 bg-verdigris/10 text-verdigris',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
