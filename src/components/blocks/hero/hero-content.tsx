import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HappyUsers from "./happy-users";
import { Hero as HeroType } from "@/types/blocks/hero";
import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import "./bg.css";

export default function HeroContent({ hero }: { hero: HeroType }) {
  const highlightText = hero.highlight_text;
  let texts = null;
  if (highlightText) {
    texts = hero.title?.split(highlightText, 2);
  }

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container relative z-10">
        {hero.show_badge && (
          <div className="flex items-center justify-center mb-8 animate-fade-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
              <img
                src="/imgs/badges/phdaily.svg"
                alt="phdaily"
                className="relative h-10 object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}
        <div className="text-center">
          {hero.announcement && (
            <Link
              href={hero.announcement.url as any}
              className="mx-auto mb-6 inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-sm backdrop-blur-sm transition-all duration-300 group border-green-500/30 bg-gradient-to-r from-green-500/5 to-cyan-500/5 hover:border-green-500/50 hover:from-green-500/10 hover:to-cyan-500/10 dark:border-green-500/20 dark:from-green-500/10 dark:to-cyan-500/10 dark:hover:border-green-500/40 dark:hover:from-green-500/15 dark:hover:to-cyan-500/15 animate-fade-in-delay-100"
            >
              {hero.announcement.label && (
                <Badge className="bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0 shadow-lg shadow-green-500/20">
                  <Sparkles className="w-3 h-3 mr-1 inline-block" />
                  {hero.announcement.label}
                </Badge>
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {hero.announcement.title}
              </span>
              <ChevronRight className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {texts && texts.length > 1 ? (
            <h1 className="mx-auto mb-6 mt-4 max-w-6xl text-balance text-4xl font-bold lg:mb-8 lg:text-7xl animate-fade-in-delay-200">
              <span className="bg-gradient-to-br bg-clip-text text-transparent from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                {texts[0]}
              </span>
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 blur-2xl opacity-30 animate-pulse" />
                <span className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent font-black">
                  {highlightText}
                </span>
              </span>
              <span className="bg-gradient-to-br bg-clip-text text-transparent from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                {texts[1]}
              </span>
            </h1>
          ) : (
            <h1 className="mx-auto mb-6 mt-4 max-w-6xl text-balance text-4xl font-bold lg:mb-8 lg:text-7xl bg-gradient-to-br bg-clip-text text-transparent from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 animate-fade-in-delay-200">
              {hero.title}
              <span className="animate-pulse">|</span>
            </h1>
          )}

          <p
            className="mx-auto max-w-3xl lg:text-xl leading-relaxed text-gray-600 dark:text-gray-400 animate-fade-in-delay-300"
            dangerouslySetInnerHTML={{ __html: hero.description || "" }}
          />
          {hero.buttons && (
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              {hero.buttons.map((item, i) => {
                const isPrimary = i === 0;
                const isWorkspaceLink = item.url === "/#nano-banana";

                if (isWorkspaceLink) {
                  return (
                    <a
                      key={i}
                      href="#nano-banana"
                      className="group animate-fade-in-delay-400"
                    >
                      <Button
                        className={`relative overflow-hidden transition-all duration-300 ${
                          isPrimary
                            ? "bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
                            : "border-green-500/30 hover:border-green-500/50 bg-transparent hover:bg-green-500/5 dark:border-green-500/20 dark:hover:border-green-500/40 dark:hover:bg-green-500/10"
                        }`}
                        size="lg"
                        variant={isPrimary ? "default" : "outline"}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {item.icon && (
                            <Icon name={item.icon} className="w-5 h-5" />
                          )}
                          {item.title}
                          {isPrimary && (
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          )}
                        </span>
                        {isPrimary && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        )}
                      </Button>
                    </a>
                  );
                }

                return (
                  <Link
                    key={i}
                    href={item.url as any}
                    target={item.target || ""}
                    className="group animate-fade-in-delay-500"
                  >
                    <Button
                      className={`relative overflow-hidden transition-all duration-300 ${
                        isPrimary
                          ? "bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
                          : "border-green-500/30 hover:border-green-500/50 bg-transparent hover:bg-green-500/5 dark:border-green-500/20 dark:hover:border-green-500/40 dark:hover:bg-green-500/10"
                      }`}
                      size="lg"
                      variant={isPrimary ? "default" : "outline"}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {item.icon && (
                          <Icon name={item.icon} className="w-5 h-5" />
                        )}
                        {item.title}
                        {isPrimary && (
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </span>
                      {isPrimary && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
          {hero.tip && (
            <div className="mt-8 animate-fade-in-delay-600">
              <p className="text-sm flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                {hero.tip}
                <span
                  className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </p>
            </div>
          )}
          {hero.show_happy_users && (
            <div className="animate-fade-in-delay-700">
              <HappyUsers />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
