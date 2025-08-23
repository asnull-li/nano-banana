export interface ShowcaseEffect {
  id: string;
  name: string;
  image: string;
  prompt: string;
  description: string;
}

export interface ShowcaseItem {
  id: string;
  category: string;
  title: string;
  description: string;
  original: string;
  effects: ShowcaseEffect[];
}