export type Card = {
  english: string;
  hiragana: string;
  katakana: string;
};

export type Deck = Array<Card>;

export function parseDeck(deck: string): Deck {
  const cards: Deck = [];

  const rows = deck.trim().split("\n");
  for (const row of rows) {
    if (row.startsWith("#")) {
      continue;
    }

    const sides = row.split(",");
    if (sides.length === 3) {
      const card: Card = {
        english: sides[0],
        hiragana: sides[1],
        katakana: sides[2],
      } as Card;

      cards.push(card);
    }
  }

  return cards;
}
