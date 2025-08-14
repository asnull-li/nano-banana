import HeroBg from "./bg";
import HeroContent from "./hero-content";
import { Hero as HeroType } from "@/types/blocks/hero";

export default function Hero({ hero }: { hero: HeroType }) {
  if (hero.disabled) {
    return null;
  }

  return (
    <>
      <HeroBg />
      <HeroContent hero={hero} />
    </>
  );
}