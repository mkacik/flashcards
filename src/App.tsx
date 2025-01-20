import React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { parseDeck, Deck } from "./Deck";
import { loadSettings, saveSettings, Settings, SettingsView } from "./Settings";
import { TrainingSession, TrainingSessionView } from "./TrainingSession";


function App() {
  let [settings, setSettings] = useState<Settings>(loadSettings);
  let [deck, setDeck] = useState<Deck | null>(null);
  let [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null)

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

  const endTrainingSession = (): void => {
    setTrainingSession(null);
  };

  const startTrainingSession = (): void => {
    if (deck === null) {
      console.log("Something fucky happened with setting up deck and it's not set. Fix it.")
      return;
    }
    const newTrainingSession = new TrainingSession(deck, settings)
    setTrainingSession(newTrainingSession);
  };

  const contents = trainingSession === null ? (
      <>
        <SettingsView
          settings={settings}
          updateSettingsHandler={updateSettings}
        />
        {(deck !== null) ? <button onClick={startTrainingSession}>GO!</button> : null}
      </>
    ) : (
      <TrainingSessionView
        trainingSession={trainingSession}
        endTrainingSessionHandler={endTrainingSession}
      />
    );

  return <>{contents}</>;
}

const domContainer = document.querySelector("#root")!;
const root = createRoot(domContainer);
root.render(<App />);
