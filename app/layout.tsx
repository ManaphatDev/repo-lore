import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { DEFAULT_LANG, isLang, LANG_STORAGE_KEY } from '@/lib/i18n/config';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/i18n/language-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://repo-lore.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Repository Lore — Turn GitHub Repositories Into Stories',
    template: '%s · Repository Lore',
  },
  description:
    'Discover the evolution of any open-source project through narrative analysis. Paste a GitHub URL and read its history as a story.',
  keywords: [
    'github',
    'repository',
    'lore',
    'open source',
    'commit history',
    'storytelling',
    'developer tools',
  ],
  authors: [{ name: 'Repository Lore' }],
  openGraph: {
    title: 'Repository Lore — Turn GitHub Repositories Into Stories',
    description:
      'Discover the evolution of any open-source project through narrative analysis.',
    url: siteUrl,
    siteName: 'Repository Lore',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repository Lore',
    description: 'Turn GitHub repositories into stories.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f1ec' },
    { media: '(prefers-color-scheme: dark)', color: '#15110c' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LANG_STORAGE_KEY)?.value;
  const initialLang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body
        className={cn(
          display.variable,
          sans.variable,
          mono.variable,
          'min-h-dvh font-sans',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLang={initialLang}>
            <div className="relative flex min-h-dvh flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
