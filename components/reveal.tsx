'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reveals its children with a fade-rise-and-settle once they scroll into view.
 * Fires once, then disconnects. Honours `prefers-reduced-motion` (shows
 * immediately) and degrades to visible if IntersectionObserver is missing.
 *
 * Pass `stagger` (ms between items) to cascade the *direct children* one-by-one
 * instead of animating the wrapper as one block. The children stay direct DOM
 * children (cloned, not wrapped), so seamless layouts like the bordered feature
 * grid keep working. Staggered children animate via the `reveal` keyframe so it
 * never clashes with their own `transition-*` hover styles.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (stagger != null) {
    return (
      <div ref={ref} className={className}>
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          const el = child as React.ReactElement<{
            className?: string;
            style?: React.CSSProperties;
          }>;
          return React.cloneElement(el, {
            className: cn(
              'motion-reduce:!animate-none motion-reduce:!opacity-100',
              shown ? 'animate-reveal' : 'opacity-0',
              el.props.className,
            ),
            style: {
              ...el.props.style,
              animationDelay: shown ? `${delay + i * stagger}ms` : undefined,
            },
          });
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none',
        shown
          ? 'translate-y-0 scale-100 opacity-100'
          : 'translate-y-5 scale-[0.98] opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
