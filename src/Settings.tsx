import React from "react";

const SETTINGS_LOCAL_STORAGE_KEY = "FLASHCARDS.settings";

export enum CardSide {
  RANDOM = "random",
  ENGLISH = "english",
  KANA = "kana",
}

export type Settings = {
  frontSide: CardSide;
};

const DEFAULT_SETTINGS: Settings = {
  frontSide: CardSide.RANDOM,
} as Settings;

export function loadSettings(): Settings {
  let settings = JSON.parse(
    window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY) || "{}",
  );

  settings = { ...DEFAULT_SETTINGS, ...settings };

  // Not returning `settings as Settings` directly because I want to ensure wiping of the obsolete
  // keys when saving.
  const typedSettings: Settings = {
    frontSide: settings.frontSide!,
  } as Settings;
  return typedSettings;
}

export function saveSettings(settings: Settings): void {
  window.localStorage.setItem(
    SETTINGS_LOCAL_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function SettingsEditor({
  settings,
  updateSettingsHandler,
}: {
  settings: Settings;
  updateSettingsHandler: (settings: Settings) => void;
}): React.ReactNode {
  const updateFrontSide = (frontSide: CardSide) => {
    const newSettings: Settings = {
      ...settings,
      frontSide: frontSide,
    } as Settings;
    saveSettings(settings)
    updateSettingsHandler(newSettings);
  };

  const frontSideLabels: Array<[CardSide, React.ReactNode]> = [
    [CardSide.KANA, "かな"],
    [CardSide.ENGLISH, "english"],
    [
      CardSide.RANDOM,
      <img src="dice-svgrepo-com.svg" width="60" height="60" />,
    ],
  ];

  const frontSideOptions = frontSideLabels.map((item, index) => {
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
      <div className="settings-buttons-grid">
        {frontSideOptions}
      </div>
    </div>
  );
}
