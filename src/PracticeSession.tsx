import React from "react";
import { useState } from "react";
import { CardSide, PersistentSettings } from "./Settings";
import { Deck, Card } from "./Deck";

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
};

type PickFrontSideFunction = (card: Card) => string;

function getPickFrontSideFunction(
  settings: PersistentSettings,
): PickFrontSideFunction {
  switch (settings.frontSide) {
    case CardSide.ENGLISH:
      return (card: Card) => card.english;
    case CardSide.KANA:
      return (card: Card) => card.kana;
    case CardSide.RANDOM:
      return (card: Card) => (getRandomInt(2) == 0 ? card.english : card.kana);
  }
}

function pickCard(deck: Deck): Card {
  const cardsArray = Array.from(deck.values());
  const randomIndex = getRandomInt(cardsArray.length);
  const card = cardsArray[randomIndex];
  return card;
}

export function PracticeSession(
  { deck, settings, bumpCardCount }:
  { deck: Deck, settings: PersistentSettings, bumpCardCount: () => void },
): React.ReactNode {
  const pickFrontSide = getPickFrontSideFunction(settings);

  const [card, setCard] = useState<Card>(pickCard(deck));
  const [text, setText] = useState<React.ReactNode>(pickFrontSide(card));
  const [flipped, setFlipped] = useState<boolean>(false);

  const flipCard = () => {
    const text = (
      <>
        <div>{card.kana}</div>
        <div>{card.english}</div>
      </>
    );
    setText(text);
    setFlipped(true);
  };

  const pickNewCard = () => {
    const card = pickCard(deck);
    const text = <div>{pickFrontSide(card)}</div>;
    setCard(card);
    setText(text);
    setFlipped(false);
    bumpCardCount();
  };

  return (
    <div
      className="card-content"
      onClick={() => (flipped ? pickNewCard() : flipCard())}
    >
      {text}
    </div>
  );
}
