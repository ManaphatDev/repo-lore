'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reveals its children with a fade-rise-and-settle once they scroll into view.
 *
 * Visible by default. The content renders fully visible during SSR, before
 * hydration, with JS disabled, and under `prefers-reduced-motion` — so a
 * section never ships blank if the observer never runs. The entrance plays
 * only for content that loads *below* the fold: it is hidden (off-screen, so
 * invisible to the user) then animated in as it scrolls into view. Content
 * already in view on load stays put without an entrance.
 *
 * Pass `stagger` (ms between items) to cascade the *direct children* one-by-one
 * instead of animating the wrapper as one block. The children stay direct DOM
 * children (cloned, not wrapped), so seamless layouts like the bordered feature
 * grid keep working. Staggered children animate via the `reveal` keyframe so it
 * never clashes with their own `transition-*` hover styles.
 */
type Phase = 'idle' | 'armed' | 'reveal';

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
  // 'idle' = visible (the default everywhere JS can't confirm otherwise).
  const [phase, setPhase] = React.useState<Phase>('idle');

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return; // stay visible, no entrance
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Armed (was below the fold) -> play the entrance. Already visible
          // on load -> stay idle, no entrance, no flicker.
          setPhase((p) => (p === 'armed' ? 'reveal' : 'idle'));
          io.disconnect();
        } else {
          setPhase('armed');
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
          const childClass =
            phase === 'armed'
              ? 'opacity-0'
              : phase === 'reveal'
                ? 'animate-reveal'
                : 'opacity-100';
          return React.cloneElement(el, {
            className: cn(
              'motion-reduce:!animate-none motion-reduce:!opacity-100',
              childClass,
              el.props.className,
            ),
            style: {
              ...el.props.style,
              animationDelay:
                phase === 'reveal' ? `${delay + i * stagger}ms` : undefined,
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
        phase === 'armed'
          ? 'translate-y-5 scale-[0.98] opacity-0'
          : 'translate-y-0 scale-100 opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}
