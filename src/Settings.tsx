import React from "react";

const SETTINGS_LOCAL_STORAGE_KEY = "FLASHCARDS.settings";

export enum CardSide {
  RANDOM = "random",
  ENGLISH = "english",
  KANA = "kana",
}

export type PersistentSettings = {
  frontSide: CardSide;
};

const DEFAULT_SETTINGS: PersistentSettings = {
  frontSide: CardSide.RANDOM,
} as PersistentSettings;

export function loadSettings(): PersistentSettings {
  let settings = JSON.parse(
    window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY) || "{}",
  );

  settings = { ...DEFAULT_SETTINGS, ...settings };

  // Not returning `settings as PersistentSettings` directly because I want to ensure wiping of the obsolete
  // keys when saving.
  const typedSettings: PersistentSettings = {
    frontSide: settings.frontSide!,
  } as PersistentSettings;
  return typedSettings;
}

export function saveSettings(settings: PersistentSettings): void {
  window.localStorage.setItem(
    SETTINGS_LOCAL_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function SettingsEditor({
  settings,
  updateSettingsHandler,
}: {
  settings: PersistentSettings;
  updateSettingsHandler: (settings: PersistentSettings) => void;
}): React.ReactNode {
  const updateFrontSide = (frontSide: CardSide) => {
    const newSettings: PersistentSettings = {
      ...settings,
      frontSide: frontSide,
    } as PersistentSettings;
    saveSettings(newSettings);
    updateSettingsHandler(newSettings);
  };

  const labels: Array<[CardSide, React.ReactNode]> = [
    [CardSide.KANA, "かな"],
    [CardSide.ENGLISH, "english"],
    [
      CardSide.RANDOM,
      <img src="dice-svgrepo-com.svg" width="60" height="60" />,
    ],
  ];

  const options = labels.map((item, index) => {
    const [option, label] = item;
    const cssClass =
      option === settings.frontSide ? "button button-selected" : "button";
    return (
      <div
        key={index}
        className={cssClass}
        onClick={() => updateFrontSide(option)}
      >
        {label}
      </div>
    );
  });

  return (
    <div className="settings">
      <div className="settings-buttons-grid">{options}</div>
    </div>
  );
}
