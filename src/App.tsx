import React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { parseDeck, Deck } from "./Deck";
import { loadSettings, PersistentSettings, SettingsEditor } from "./Settings";
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

function Flashcards({ deck }: { deck: Deck }) {
  const [settings, setSettings] = useState<PersistentSettings>(loadSettings);
  const [practiceInProgress, setPracticeInProgress] = useState<boolean>(false);

  const updateSettings = (settings: PersistentSettings): void =>
    setSettings(settings);
  const startPractice = () => setPracticeInProgress(true);
  const endPractice = () => setPracticeInProgress(false);

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
            <PracticeSession deck={deck} settings={settings} />

            <TopRightGlyph
              onClick={endPractice}
              imageUrl="cross-svgrepo-com.svg"
              size={100}
              show={true}
            />
          </>
        ) : (
          <>
            <div className="page-header">ひらがな</div>
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
      {scratchpadEnabled ? <Scratchpad /> : null}
    </>
  );
}

function AppRoot() {
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (deck === null) {
      fetch("hiragana.txt")
        .then((response) => response.text())
        .then((text) => {
          const deck = parseDeck(text);
          setDeck(deck);
        });
    }
  }, [deck, setDeck]);

  if (deck === null) {
    return null;
  }
  return <Flashcards deck={deck} />;
}

const domContainer = document.querySelector("#root")!;
const root = createRoot(domContainer);
root.render(<AppRoot />);
