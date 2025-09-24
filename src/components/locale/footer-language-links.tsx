import { getLocale } from "next-intl/server";
import { locales, localeNames } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  ru: "🇷🇺",
  ar: "🇸🇦",
  pt: "🇵🇹",
};

export default async function FooterLanguageLinks() {
  const currentLocale = await getLocale();

  return (
    <div className="w-full mt-12 pt-6 border-t border-muted-foreground/10">
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {locales.map((locale) => {
          const isCurrent = locale === currentLocale;

          return (
            <Link
              key={locale}
              href="/"
              locale={locale}
              className={`
                flex items-center gap-1.5 text-sm transition-all duration-200
                ${
                  isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <span className="text-base">{languageFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
