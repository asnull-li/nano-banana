"use client";

import { useParams, usePathname } from "next/navigation";
import { locales, localeNames } from "@/i18n/locale";

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
};

export default function FooterLanguageLinks() {
  const params = useParams();
  const currentLocale = params.locale as string;
  const pathname = usePathname();

  const getLocalizedPath = (targetLocale: string) => {
    if (targetLocale === currentLocale) return pathname;
    
    let newPathName = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
    if (!newPathName.startsWith(`/${targetLocale}`)) {
      newPathName = `/${targetLocale}${newPathName}`;
    }
    return newPathName;
  };

  return (
    <div className="w-full mt-12 pt-6 border-t border-muted-foreground/10">
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {locales.map((locale) => {
          const isCurrent = locale === currentLocale;
          
          return (
            <a
              key={locale}
              href={getLocalizedPath(locale)}
              className={`
                flex items-center gap-1.5 text-sm transition-all duration-200
                ${isCurrent 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <span className="text-base">{languageFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}