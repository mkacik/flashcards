import React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { parseDeck, Deck } from "./Deck";
import { loadSettings, saveSettings, Settings, SettingsEditor } from "./Settings";
import { TrainingSession, TrainingSessionView } from "./TrainingSession";
import { Scratchpad } from "./Scratchpad";
import { TopRightButton } from "./Common";

function getHorizontalMode(): boolean {
  const { innerWidth: width, innerHeight: height } = window;
  return width / height > 1;
}

function PageHeader() {
  return (
    <div className="page-header">
      <b>ひらがな</b>
    </div>
  );
}

function App() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(
    null,
  );

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


  const updateSettings = (settings: Settings): void => {
    saveSettings(settings);
    setSettings(settings);
  };


  const startTrainingSession = (): void => {
    if (deck === null) {
      console.log(
        "Something fucky happened with setting up deck and it's not set. Fix it.",
      );
      return;
    }
    const newTrainingSession = new TrainingSession(deck, settings);
    setTrainingSession(newTrainingSession);
  };

  const endTrainingSession = (): void => {
    setTrainingSession(null);
  };

  // Screen aspect ratio is used to determine wether the scratchpad toggle should be visible.
  // If scratchpad is then toggled on, it will only show in horizontal.
  const [horizontalMode, setHorizontalMode] = useState<boolean>(getHorizontalMode);
  const [scratchpadEnabled, setScratchpadEnabled] = useState<boolean>(false);
  const showScratchpad = scratchpadEnabled && horizontalMode;

  useEffect(() => {
    const updateHorizontalMode = () => setHorizontalMode(getHorizontalMode());

    window.addEventListener('resize', updateHorizontalMode);
    return () => window.removeEventListener('resize', updateHorizontalMode);
  }, []);

  const toggleScratchpad = () => {
    setScratchpadEnabled(!scratchpadEnabled);
  }

  const cardContents =
    trainingSession === null ? (
      <>
        <PageHeader />
        {horizontalMode ?
          <TopRightButton
            onClick={toggleScratchpad}
            imageUrl="note-svgrepo-com.svg"
            size={40} /> :
          null}
        <SettingsEditor
          settings={settings}
          updateSettingsHandler={updateSettings}
        />
        <div className="bottom-button-box">
          <div className="button" onClick={startTrainingSession}>
            start
          </div>
        </div>
      </>
    ) : (
      <TrainingSessionView
        trainingSession={trainingSession}
        endTrainingSessionHandler={endTrainingSession}
      />
    );

  return <>
    <div className={showScratchpad ? "card card-scratchpad" : "card"}>
      {cardContents}
    </div>
    {showScratchpad ? <Scratchpad /> : null}
  </>;
}

const domContainer = document.querySelector("#root")!;
const root = createRoot(domContainer);
root.render(<App />);
