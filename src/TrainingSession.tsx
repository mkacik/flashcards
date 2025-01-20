import React from "react";
import { useState } from "react";
import { CardSide, Settings } from "./Settings";
import { Deck, Card, CardID } from "./Deck";

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
};

type PickFrontSideFunction = (card: Card) => string;

function getPickFrontSideFunction(
  frontSideFromSettings: CardSide,
): PickFrontSideFunction {
  switch (frontSideFromSettings) {
    case CardSide.ENGLISH:
      return (card: Card) => card.english;
    case CardSide.KANA:
      return (card: Card) => card.kana;
    case CardSide.RANDOM:
      return (card: Card) => (getRandomInt(2) == 0 ? card.english : card.kana);
  }
}

export class TrainingSession {
  deck: Deck;
  selectedCards: Array<CardID>;
  pickFrontSide: PickFrontSideFunction;

  constructor(deck: Deck, settings: Settings) {
    this.deck = deck;
    this.selectedCards = Array.from(deck.keys());
    this.pickFrontSide = getPickFrontSideFunction(settings.frontSide);
  }

  nextCard(): Card {
    const randomIndex = getRandomInt(this.selectedCards.length);
    const cardID = this.selectedCards[randomIndex];
    return this.deck.get(cardID)!;
  }
}

export function TrainingSessionView(
  { trainingSession, endTrainingSessionHandler }:
  { trainingSession: TrainingSession,
    endTrainingSessionHandler: () => void }
): React.ReactNode {
  const [card, setCard] = useState<Card>(trainingSession.nextCard());
  const [flipped, setFlipped] = useState<boolean>(false);
  const [text, setText] = useState<React.ReactNode>(trainingSession.pickFrontSide(card));

  const flipCard = (card: Card) => {
    let cardText = <>{card.kana}<br />{card.english}</>;
    setText(cardText);
    setFlipped(true);
  };

  const pickNewCard = () => {
    const newCard = trainingSession.nextCard();
    setCard(newCard);
    setText(trainingSession.pickFrontSide(newCard));
    setFlipped(false);
  }

  return <>
    <button onClick={endTrainingSessionHandler}>END</button>
    <div onClick={() => flipped ? pickNewCard() : flipCard(card)}>{text}</div>
  </>;
}
