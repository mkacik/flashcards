import React from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CardSide, Settings, SettingsPage } from "./Settings"

enum Page {
  Cards,
  Settings,
}

function App() {
  let [page, setPage] = useState<Page>(Page.Cards);

  let settings: Settings = {
    frontSide: CardSide.RANDOM,
    blockedGroups: [],
  } as Settings;

  return <SettingsPage settings={settings} />
}

const domContainer = document.querySelector("#root")!;
const root = createRoot(domContainer);
root.render(<App />);
