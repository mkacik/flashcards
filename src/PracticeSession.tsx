import React from "react";
import { useState, useEffect } from "react";
import { FrontSide, Kana, PersistentSettings } from "./Settings";
import { Deck } from "./Deck";

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
};

const coinToss = (): boolean => {
  return getRandomInt(2) == 0;
};

function getFrontSide(settings: PersistentSettings): FrontSide {
  const frontSide = settings.frontSide;

  if (frontSide === FrontSide.RANDOM) {
    return coinToss() ? FrontSide.ENGLISH : FrontSide.KANA;
  }
  return frontSide;
}

function wrap(...args: string[]) {
  return (
    <>
      {args.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </>
  );
}

// Deck card has 3 sides - en, hiragana & katakana. In practice session context, card should only
// have two sides, so I use following struct and function to pick new deck card and turn it to
// 2-sided flashcard.
type FlashCard = {
  front: React.ReactElement;
  back: React.ReactElement;
};

function pickCard(deck: Deck, settings: PersistentSettings): FlashCard {
  const randomIndex = getRandomInt(deck.length);
  const deckCard = deck[randomIndex];

  const english = deckCard.english;
  let kana =
    settings.kana == Kana.HIRAGANA ? deckCard.hiragana : deckCard.katakana;

  if (getFrontSide(settings) === FrontSide.KANA) {
    return {
      front: wrap(kana),
      back: wrap(kana, english),
    } as FlashCard;
  }

  const altKana = Kana.HIRAGANA ? deckCard.altHiragana : deckCard.altKatakana;
  const hasAltKana = (altKana !== null) && (altKana !== undefined);
  return {
    front: wrap(english),
    back: hasAltKana ? wrap(kana, altKana, english) : wrap(kana, english),
  } as FlashCard;
}

export function PracticeSession({
  deck,
  settings,
  bumpCardCount,
}: {
  deck: Deck;
  settings: PersistentSettings;
  bumpCardCount: () => void;
}): React.ReactNode {
  const [card, setCard] = useState<FlashCard>(pickCard(deck, settings));
  const [flipped, setFlipped] = useState<boolean>(false);

  const pickNewCard = () => {
    const card = pickCard(deck, settings);
    setCard(card);
    setFlipped(false);
    bumpCardCount();
  };

  const flipCard = () => flipped ? pickNewCard() : setFlipped(true);

  useEffect(() => {
    const flipCardOnSpacePressed = (e) => {
      if (e.key === " ") {
        flipCard();
      };
    }
    document.addEventListener("keydown", flipCardOnSpacePressed);

    return () => document.removeEventListener("keydown" , flipCardOnSpacePressed);
  });

  return (
    <div
      className="card-content"
      onClick={flipCard}
    >
      {flipped ? card.back : card.front}
    </div>
  );
}
