import type { ReactNode } from 'react';
import { Newsreader } from 'next/font/google';

// Newsreader is the reading face for the narrative lore prose, which only
// renders on this route. Loading it here (instead of the root layout) keeps it
// off every other page — the landing ships three families, not four.
const prose = Newsreader({
  subsets: ['latin'],
  variable: '--font-prose',
  display: 'swap',
  style: ['normal', 'italic'],
});

export default function AnalyzeLayout({ children }: { children: ReactNode }) {
  return <div className={prose.variable}>{children}</div>;
}
