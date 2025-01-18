import React from "react";

export enum CardSide {
  RANDOM = "random",
  ENGLISH = "english",
  KANA = "kana",
};

export type Settings = {
  frontSide: CardSide;
  blockedGroups: Array<number>;
};

export function SettingsPage(
  { settings },
  { settings: Settings }
) {
  return <>{settings.frontSide}</>;
}
