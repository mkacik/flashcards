const SETTINGS_FORM = "settings-form";
const SETTINGS_LETTERCASE = "settings-lettercase";

const SETTINGS_LOCAL_STORAGE_KEY = "FLASHCARDS.settings"

function prefix(string) {
  return `FLASHCARDS.${string}`
}

function setUp() {
  let form = document.getElementById("settings-form");
  form.addEventListener("submit", (e) => {
    saveSettings(e);
  });

  let settings = JSON.parse(window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY));

  let lettercase = settings.lettercase;
  if (lettercase != null) {
    document.getElementById(SETTINGS_LETTERCASE).value = lettercase;
  }
}

function saveSettings(event) {
  event.preventDefault();
  let form = event.target;

  let settings = {
    "lettercase": form[SETTINGS_LETTERCASE].value
  };
  window.localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

document.addEventListener("DOMContentLoaded", setUp);
