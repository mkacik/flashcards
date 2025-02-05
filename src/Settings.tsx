import React from "react";

const SETTINGS_LOCAL_STORAGE_KEY = "FLASHCARDS.settings";

export enum FrontSide {
  RANDOM = "random",
  ENGLISH = "english",
  KANA = "kana",
}

export enum Kana {
  HIRAGANA = "hiragana",
  KATAKANA = "katakana",
}

export enum DeckType {
  BASE = "basic",
  FULL = "full",
}

export type PersistentSettings = {
  kana: Kana,
  deckType: DeckType,
  frontSide: FrontSide;
};

const DEFAULT_SETTINGS: PersistentSettings = {
  kana: Kana.HIRAGANA,
  deckType: DeckType.FULL,
  frontSide: FrontSide.RANDOM,
} as PersistentSettings;

export function loadSettings(): PersistentSettings {
  let settings = JSON.parse(
    window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY) || "{}",
  );

  settings = { ...DEFAULT_SETTINGS, ...settings };

  // Not returning `settings as PersistentSettings` directly because I want to ensure wiping of
  // the obsolete keys when saving.
  const typedSettings: PersistentSettings = {
    kana: settings.kana!,
    deckType: settings.deckType!,
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

function SelectableButton({ label, selected, onClick }:
{ label: React.ReactNode, selected: boolean, onClick: () => void }) {
  const cssClass = selected ? "button button-selected" : "button";
  return (
    <div className={cssClass} onClick={onClick}>
      {label}
    </div>
  );
}

function getFrontSideSelector(
  selectedOption: FrontSide,
  selectedKana: Kana,
  updateSettingsItem: (SettingsItem) => void
) {
  const kanaLabel = selectedKana === Kana.HIRAGANA ? "かな" : "カナ";
  const randomLabel = <img key="dice" src="dice-svgrepo-com.svg" width="60" height="60" />;
  const labels: Array<[FrontSide, React.ReactNode]> = [
    [FrontSide.KANA, kanaLabel],
    [FrontSide.ENGLISH, "english"],
    [FrontSide.RANDOM, randomLabel],
  ];

  return labels.map((item, index) => {
    const [option, label] = item;
    return (
      <SelectableButton
        label={label}
        selected={option === selectedOption}
        onClick={() => updateSettingsItem({frontSide: option})}
        key={index} />
    );
  });
}

function getKanaSelector(
  selectedOption: Kana,
  updateSettingsItem: (SettingsItem) => void
) {
  const labels: Array<[Kana, React.ReactNode]> = [
    [Kana.HIRAGANA, "ひらがな"],
    [Kana.KATAKANA, "カタカナ"],
  ];

  const options = labels.map((item, index) => {
    const [option, label] = item;
    return (
      <SelectableButton
        label={label}
        selected={option === selectedOption}
        onClick={() => updateSettingsItem({kana: option})}
        key={index} />
    );
  });

  options.push(<div className="spacer" key={labels.length} ></div>);
  return options;
}


type SettingsItem = { kana: Kana } | { deckType: DeckType} | { frontSide: FrontSide };

export function SettingsEditor({
  settings,
  updateSettingsHandler,
}: {
  settings: PersistentSettings;
  updateSettingsHandler: (settings: PersistentSettings) => void;
}): React.ReactNode {
  const updateSettingsItem = (update: SettingsItem) => {
    const newSettings: PersistentSettings = {
      ...settings,
      ...update
    } as PersistentSettings;
    saveSettings(newSettings);
    updateSettingsHandler(newSettings);
  };

  return (
    <div className="settings">
      <div className="settings-buttons-grid">
        {getKanaSelector(settings.kana, updateSettingsItem)}
      </div>
      <div className="settings-buttons-grid">
        {getFrontSideSelector(settings.frontSide, settings.kana, updateSettingsItem)}
      </div>
    </div>
  );
}
