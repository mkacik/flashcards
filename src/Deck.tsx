export type CardID = number;

export type Card = {
  id: CardID;
  english: string;
  kana: string;
};

export type Deck = Map<CardID, Card>;

export function parseDeck(deck: string): Deck {
  let cards: Deck = new Map();
  var cardID: CardID = 0;

  let rows = deck.trim().split("\n");
  for (let row of rows) {
    if (row.startsWith("#")) {
      continue;
    }

    let sides = row.split(",");
    if (sides.length === 2) {
      let card: Card = {
        id: cardID,
        english: sides[0],
        kana: sides[1],
      } as Card;

      cards.set(cardID, card);
      cardID += 1;
    }
  }

  return cards;
}
