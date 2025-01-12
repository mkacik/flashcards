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

    const defaultSettings = {
      letterCase: Settings.LetterCase.LOWER,
      startingSide: Settings.StartingSide.RANDOM,
      blockedGroups: [],
    };
    this.settings = {...defaultSettings, ...settings};
  }

  get letterCase() {
    return this.settings.letterCase;
  }

  get startingSide() {
    return this.settings.startingSide;
  }

  get blockedGroups() {
    return this.settings.blockedGroups;
  }

  wipe() {
    window.localStorage.removeItem(Settings.LOCAL_STORAGE_KEY);
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
 
   // Blocked groups represent inverse of selection, so I need to filter selected values out
    let selectedGroups = Array.from(form.groups.selectedOptions).map((item) => item.value);
    let allGroups = Array.from(form.groups.options).map((item) => item.value)
    this.settings.blockedGroups = allGroups
      .filter((item) => !selectedGroups.includes(item))
      .map((item) => Number(item));

    this.save();
    window.location.search = "";
  }

  generateSelect(name, labelText, selectedValue, options) {
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
      if (selectedValue == value) {
        option.setAttribute("selected", true);
      }
      select.appendChild(option);
    }

    let span = document.createElement("span");
    span.setAttribute("class", "settings-item");
    span.appendChild(label);
    span.appendChild(select);

    return span;
  }

  generateDeckSelect(name, labelText, selectedValues, deckGroups) {
    let label = document.createElement("label");
    label.setAttribute("for", name);
    label.innerHTML = labelText;

    let select = document.createElement("select");
    select.setAttribute("id", name);
    select.setAttribute("name", name);
    select.setAttribute("multiple", true);

    for (let [value, label] of deckGroups) {
      let option = document.createElement("option");
      option.setAttribute("value", value);
      option.innerHTML = label;

      if (!selectedValues.includes(value)) {
        option.setAttribute("selected", true);
      }
      select.appendChild(option);
    }

    let labelSpan = document.createElement("span");
    labelSpan.setAttribute("class", "settings-item");
    labelSpan.appendChild(label);

    let selectSpan = document.createElement("span");
    selectSpan.setAttribute("class", "settings-item");
    selectSpan.appendChild(select);

    let div = document.createElement("div");
    div.appendChild(labelSpan);
    div.appendChild(selectSpan);

    return div;
  }

  generateForm(deck) {
    let settings = this.settings;

    let form = document.createElement("form");
    form.setAttribute("class", "settings");

    let settingsHeader = document.createElement("span");
    settingsHeader.setAttribute("class", "settings-header");
    settingsHeader.innerHTML = "Settings"

    let letterCaseSelect = this.generateSelect(
      "letterCase", 
      "Letter case for english characters",
      settings.letterCase,
      Settings.LetterCase,
    );

    let startingSideSelect = this.generateSelect(
      "startingSide",
      "Card side to show first",
      settings.startingSide,
      Settings.StartingSide,
    );

    let groupsSelect = this.generateDeckSelect(
      "groups",
      "Groups to include in session",
      settings.blockedGroups,
      deck.groups
    );

    let settingsFooter = document.createElement("span");
    settingsFooter.setAttribute("class", "settings-footer");

    let resetButton = document.createElement("button");
    resetButton.innerHTML = "reset to default";
    resetButton.addEventListener("click",
      (e) => {
        e.preventDefault();
        this.wipe();
        window.location.search = "";
      }
    );

    let submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerHTML = "save";

    settingsFooter.appendChild(resetButton);
    settingsFooter.appendChild(document.createTextNode(" "));
    settingsFooter.appendChild(submitButton);

    form.appendChild(settingsHeader);
    form.appendChild(letterCaseSelect);
    form.appendChild(startingSideSelect);
    form.appendChild(groupsSelect);
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
    let cards = new Map();
    let groups = new Map();

    var current_group = null;
    var current_group_members = [];
    var index = 0;

    // transform deck string from CSV format to object storing indexed pairs of side A and B
    // indexing prevents clashes caused by potential same pronunciation
    let rows = deckString.trim().split("\n");
    for (let row of rows) {
      if (row.startsWith("#")) {
        if (current_group == null) {
          current_group = 0;
        } else {
          groups.set(current_group, current_group_members);
          current_group += 1;
          current_group_members = [];
        }
        continue;
      }

      let sides = row.split(",");
      if (sides.length == 2) {
        current_group_members.push(row);
  
        // english pronunciation is expected in first column
        let en =
          settings.letterCase == Settings.LetterCase.LOWER
            ? sides[0].toLowerCase()
            : sides[0].toUpperCase();

        if (!settings.blockedGroups.includes(current_group)) {
          cards.set(index, [en, sides[1]]);
        }
        index += 1;
      }
    }
    groups.set(current_group, current_group_members);

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

    this.cards = cards;
    this.groups = groups;
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

function setUpSettingsPage(settings, deck) {
  let form = settings.generateForm(deck);
  let container = getContainer();
  container.innerHTML = "";
  container.appendChild(form);
}

function requestedSettingsPage() {
  return window.location.search.endsWith("settings");
}

async function setUp() {
  let settings = new Settings();

  fetch("hiragana")
    .then((response) => response.text())
    .then((text) => {
      let deck = new Deck(text, settings);
      if (requestedSettingsPage()) {
        setUpSettingsPage(settings, deck);
      } else {
        setUpFlashcardsPage(settings, deck)
      }
    });
}

document.addEventListener("DOMContentLoaded", setUp);
