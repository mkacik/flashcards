const DECK = `
A,あ
I,い
U,う
E,え
O,お

KA,か
KI,き
KU,く
KE,け
KO,こ

SA,さ
SHI,し
SU,す
SE,せ
SO,そ

TA,た
CHI,ち
TSU,つ
TE,て
TO,と

NA,な
NI,に
NU,ぬ
NE,ね
NO,の

HA,は
HI,ひ
FU,ふ
HE,へ
HO,ほ
`;

class Settings {
  static get LOCAL_STORAGE_KEY() {
    return "FLASHCARDS.settings";
  }

  static get LetterCase() {
    return {
      LOWER: "lower",
      UPPER: "upper",
    };
  }

  static get StartingSide() {
    return {
      RANDOM: "random",
      ENGLISH: "english",
      KANA: "kana",
    };
  }

  constructor() {
    let settings = JSON.parse(
      window.localStorage.getItem(Settings.LOCAL_STORAGE_KEY),
    );
    this.settings = settings ?? {
      letterCase: Settings.LetterCase.LOWER,
      startingSide: Settings.StartingSide.RANDOM,
    };
  }

  get letterCase() {
    return this.settings.letterCase;
  }

  get startingSide() {
    return this.settings.startingSide;
  }

  save() {
    window.localStorage.setItem(
      Settings.LOCAL_STORAGE_KEY,
      JSON.stringify(this.settings),
    );
  }

  parseFormAndSave(form) {
    this.settings.letterCase = form.letterCase.value;
    this.settings.startingSide = form.startingSide.value;
    this.save();
    window.location.search = "";
  }

  generateSelect(
    name, labelText, options, selected
  ) {
    let label = document.createElement("label");
    label.setAttribute("for", name);
    label.innerHTML = labelText;

    let select = document.createElement("select");
    select.setAttribute("id", name);
    select.setAttribute("name", name);

    for (const value of Object.values(options)) {
      let option = document.createElement("option");
      option.setAttribute("value", value);
      option.innerHTML = value;
      if (selected == value) {
        option.setAttribute("selected", "true");
      }
      select.appendChild(option);
    }

    let span = document.createElement("span");
    span.setAttribute("class", "settings-item");
    span.appendChild(label);
    span.appendChild(select);

    return span;
  }

  generateForm() {
    let settings = this.settings;

    let form = document.createElement("form");
    form.setAttribute("class", "settings");

    let settingsHeader = document.createElement("span");
    settingsHeader.setAttribute("class", "settings-header");
    settingsHeader.innerHTML = "Settings"

    let letterCaseSelect = this.generateSelect(
      "letterCase", 
      "Letter case for english characters",
      Settings.LetterCase,
      settings.letterCase,
    );

    let startingSideSelect = this.generateSelect(
      "startingSide",
      "Card side to show first",
      Settings.StartingSide,
      settings.startingSide,
    );

    let settingsFooter = document.createElement("span");
    settingsFooter.setAttribute("class", "settings-footer");

    let submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerHTML = "save";

    settingsFooter.appendChild(submitButton);

    form.appendChild(settingsHeader);
    form.appendChild(letterCaseSelect);
    form.appendChild(startingSideSelect);
    form.appendChild(settingsFooter);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.parseFormAndSave(e.target);
    });

    return form;
  }
}

class Deck {
  constructor(deckString, settings) {
    let deck = new Map();
    let rows = deckString.trim().split("\n");

    var index = 0;
    // transform deck string from CSV format to object storing indexed pairs of side A and B
    // indexing prevents clashes caused by potential same pronunciation
    for (let row of rows) {
      let sides = row.split(",");
      if (sides.length == 2) {
        // english pronunciation is expected in first column
        let en =
          settings.letterCase == Settings.LetterCase.LOWER
            ? sides[0].toLowerCase()
            : sides[0].toUpperCase();
        deck.set(index, [en, sides[1]]);
        // only increment index on valid rows
        index += 1;
      }
    }

    const getCoinTossFunction = () => {
      switch (settings.startingSide) {
        case Settings.StartingSide.ENGLISH:
          return () => true;
        case Settings.StartingSide.KANA:
          return () => false;
        case Settings.StartingSide.RANDOM:
        default:
          return () => Math.floor(Math.random() * 2) == 0;
      }
    };

    this.cards = deck;
    this.coinTossForPickSide = getCoinTossFunction();
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  getRandomCard() {
    let randomIndex = this.getRandomInt(this.cards.size);
    let [english, kana] = this.cards.get(randomIndex);
    let sideA = this.coinTossForPickSide() ? english : kana;
    let sideB = `${kana}<br />${english}`;
    return [sideA, sideB];
  }
}

function getContainer() {
  return document.getElementById("root");
}

function setUpFlashcardsPage(settings, deck) {
  window.FLASHCARDS = {};
  FLASHCARDS.deck = deck;

  let container = getContainer();
  container.innerHTML = "ひらがな";
  container.onclick = () => {
    newCard();
  };

  window.onkeydown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault();
      container.click();
    }
  };
}

function newCard() {
  let [sideA, sideB] = FLASHCARDS.deck.getRandomCard();

  let container = getContainer();
  container.innerHTML = sideA;
  container.onclick = () => {
    flipCard(sideB);
  };
}

function flipCard(sideB) {
  let container = getContainer();
  container.innerHTML = sideB;
  container.onclick = () => {
    newCard();
  };
}

/* GLOBAL SETTINGS */

function setUpSettingsPage(settings) {
  let form = settings.generateForm();
  let container = getContainer();
  container.innerHTML = "";
  container.appendChild(form);
}

function requestedSettingsPage() {
  return window.location.search.endsWith("settings");
}

function setUp() {
  let settings = new Settings();
  let deck = new Deck(DECK, settings);

  if (requestedSettingsPage()) {
    setUpSettingsPage(settings);
  } else {
    setUpFlashcardsPage(settings, deck);
  }
}

document.addEventListener("DOMContentLoaded", setUp);
