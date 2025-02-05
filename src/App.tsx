import React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { parseDeck, Deck } from "./Deck";
import {
  loadSettings,
  PersistentSettings,
  SettingsEditor,
  DeckType,
} from "./Settings";
import { PracticeSession } from "./PracticeSession";
import { Scratchpad } from "./Scratchpad";

function TopRightGlyph({
  onClick,
  imageUrl,
  size,
  show,
}: {
  onClick: () => void;
  imageUrl: string;
  size: number;
  show: boolean;
}) {
  if (!show) {
    return null;
  }
  return (
    <div className="top-right-button-box" onClick={onClick}>
      <img alt="button" src={imageUrl} width={size} height={size} />
    </div>
  );
}

function BottomButton({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) {
  return (
    <div className="bottom-button-box">
      <div className="button" onClick={onClick}>
        {text}
      </div>
    </div>
  );
}

function getHorizontalMode(): boolean {
  const { innerWidth: width, innerHeight: height } = window;
  return width / height > 1;
}

function getDeckForPracticeSession(
  decks: Decks,
  settings: PersistentSettings,
): Deck {
  switch (settings.deckType) {
    case DeckType.BASIC:
      return decks.basic;
    case DeckType.MODIFIED:
      return decks.modified;
  }
  return decks.basic.concat(decks.modified);
}

function Flashcards({ decks }: { decks: Decks }) {
  const [settings, setSettings] = useState<PersistentSettings>(loadSettings);
  const [practiceInProgress, setPracticeInProgress] = useState<boolean>(false);
  const [cardCount, setCardCount] = useState<number>(0);

  const updateSettings = (settings: PersistentSettings): void =>
    setSettings(settings);
  const startPractice = () => setPracticeInProgress(true);
  const endPractice = () => setPracticeInProgress(false);
  const bumpCardCount = () => setCardCount(cardCount + 1);

  // Screen aspect ratio is used to determine wether the scratchpad toggle should be visible.
  // If scratchpad is then toggled on, it will only show in horizontal.
  const [horizontalMode, setHorizontalMode] =
    useState<boolean>(getHorizontalMode);
  const [scratchpadEnabled, setScratchpadEnabled] = useState<boolean>(false);
  const showScratchpad = scratchpadEnabled && horizontalMode;

  useEffect(() => {
    const updateHorizontalMode = () => setHorizontalMode(getHorizontalMode());

    window.addEventListener("resize", updateHorizontalMode);
    return () => window.removeEventListener("resize", updateHorizontalMode);
  }, []);

  const toggleScratchpad = () => setScratchpadEnabled(!scratchpadEnabled);

  return (
    <>
      <div className="card">
        {practiceInProgress ? (
          <>
            <PracticeSession
              deck={getDeckForPracticeSession(decks, settings)}
              settings={settings}
              bumpCardCount={bumpCardCount}
            />

            <TopRightGlyph
              onClick={endPractice}
              imageUrl="cross-svgrepo-com.svg"
              size={100}
              show={true}
            />
          </>
        ) : (
          <>
            <SettingsEditor
              settings={settings}
              updateSettingsHandler={updateSettings}
            />

            <BottomButton onClick={startPractice} text="start" />

            <TopRightGlyph
              onClick={toggleScratchpad}
              imageUrl="note-svgrepo-com.svg"
              size={40}
              show={horizontalMode}
            />
          </>
        )}
      </div>
      {showScratchpad ? <Scratchpad cardCount={cardCount} /> : null}
    </>
  );
}

type Decks = {
  basic: Deck;
  modified: Deck;
};

async function fetchDeck(url: string): Promise<Deck> {
  const request = fetch("decks/" + url);
  const response = await request;
  const text = await response.text();
  return parseDeck(text);
}

function AppRoot() {
  const [basicDeck, setBasicDeck] = useState<Deck | null>(null);
  const [modifiedDeck, setModifiedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (basicDeck === null) {
      fetchDeck("basic.txt").then((deck) => setBasicDeck(deck));
    }
  }, [basicDeck, setBasicDeck]);

  useEffect(() => {
    if (modifiedDeck === null) {
      fetchDeck("modified.txt").then((deck) => setModifiedDeck(deck));
    }
  }, [modifiedDeck, setModifiedDeck]);

  if (basicDeck === null || modifiedDeck === null) {
    return null;
  }

  const decks: Decks = {
    basic: basicDeck,
    modified: modifiedDeck,
  } as Decks;
  return <Flashcards decks={decks} />;
}

const domContainer = document.querySelector("#root")!;
const root = createRoot(domContainer);
root.render(<AppRoot />);
