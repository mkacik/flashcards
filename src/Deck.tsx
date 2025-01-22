export type CardID = number;

export type Card = {
  english: string;
  kana: string;
};

export type Deck = Map<CardID, Card>;

export function parseDeck(deck: string): Deck {
  const cards: Deck = new Map();

  let cardID: CardID = 0;
  const rows = deck.trim().split("\n");
  for (const row of rows) {
    if (row.startsWith("#")) {
      continue;
    }

    const sides = row.split(",");
    if (sides.length === 2) {
      const card: Card = {
        english: sides[0],
        kana: sides[1],
      } as Card;

      cards.set(cardID, card);
      cardID += 1;
    }
  }

  return cards;
}
