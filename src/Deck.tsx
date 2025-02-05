export type Card = {
  english: string;
  hiragana: string;
  katakana: string;
  altHiragana: string | null;
  altKatakana: string | null;
};

export type Deck = Array<Card>;

export function parseDeck(deck: string): Deck {
  const cards: Deck = [];

  const rows = deck.trim().split("\n");
  for (const row of rows) {
    if (row.startsWith("#")) {
      continue;
    }

    const [
      english,
      hiragana,
      katakana,
      altHiragana,
      altKatakana
    ] = row.split(",");
    const card: Card = {
      english: english,
      hiragana: hiragana,
      katakana: katakana,
      altHiragana: altHiragana,
      altKatakana: altKatakana,
    } as Card;

    cards.push(card);
  }

  return cards;
}
