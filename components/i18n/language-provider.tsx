'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { DEFAULT_LANG, LANG_STORAGE_KEY, type Lang } from '@/lib/i18n/config';
import { dictionaries, type Dictionary } from '@/lib/i18n/dictionaries';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = DEFAULT_LANG,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = React.useState<Lang>(initialLang);
  const router = useRouter();

  const setLang = React.useCallback(
    (next: Lang) => {
      setLangState(next);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      document.cookie = `${LANG_STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next;
      // Re-run server components (e.g. the analyzed report) with the new
      // language so server-localized text updates too. Client state is kept.
      router.refresh();
    },
    [router],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: dictionaries[lang] }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <LanguageProvider>');
  return ctx;
}

/** Convenience hook returning just the active dictionary. */
export function useT(): Dictionary {
  return useI18n().t;
}
