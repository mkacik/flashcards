import React from "react";
import { useState } from "react";
import { CardSide, Settings } from "./Settings";
import { Deck, Card, CardID } from "./Deck";
import { TopRightButton } from "./Common";

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

export function TrainingSessionView({
  trainingSession,
  endTrainingSessionHandler,
}: {
  trainingSession: TrainingSession;
  endTrainingSessionHandler: () => void;
}): React.ReactNode {
  const [card, setCard] = useState<Card>(trainingSession.nextCard());
  const [text, setText] = useState<React.ReactNode>(
    trainingSession.pickFrontSide(card),
  );
  const [flipped, setFlipped] = useState<boolean>(false);

  const flipCard = () => {
    let newText = (
      <>
        <span>{card.kana}</span>
        <span>{card.english}</span>
      </>
    );
    setText(newText);
    setFlipped(true);
  };

  const pickNewCard = () => {
    const newCard = trainingSession.nextCard();
    const newText = <span>{trainingSession.pickFrontSide(newCard)}</span>;
    setCard(newCard);
    setText(newText);
    setFlipped(false);
  };

  // NOTE: remember to draw card-content first! It stretches across whole page, to make card flip
  // easy, and if it's rendered last, it will be painted ove navigation button, which in turn will
  // become unclickable.
  return (
    <>
      <div
        className="card-content"
        onClick={() => (flipped ? pickNewCard() : flipCard())}
      >
        {text}
      </div>
      <TopRightButton
        onClick={endTrainingSessionHandler}
        imageUrl="cross-svgrepo-com.svg"
        size={100} />
    </>
  );
}
