import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-glow',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70',
        outline:
          'border border-gold/40 bg-transparent text-foreground hover:border-gold hover:text-gold',
        ghost: 'text-foreground/80 hover:bg-muted hover:text-foreground',
        link: 'text-gold underline-offset-4 hover:underline',
        foil: 'relative border border-gold/50 bg-gradient-to-b from-gold/15 to-transparent text-foreground shadow-sm hover:from-gold/25 hover:shadow-glow',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
