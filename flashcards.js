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
    this.load();
  }

  load() {
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
    this.load();
    setMode(Mode.Cards);
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
    submitButton.innerHTML = "save and start";

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

  getContentContainer().innerHTML = "ひらがな";
  getContainer().onclick = () => {
    newCard();
  };

  window.onkeydown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault();
      container.click();
    }
  };
}

const Mode = Object.freeze({
  Cards: "mode-cards",
  Settings: "mode-settings",
});
function setMode(mode) {
  const classes = document.body.classList;
  classes.toggle(Mode.Cards, mode === Mode.Cards);
  classes.toggle(Mode.Settings, mode === Mode.Settings);
}

function getContentContainer() {
  return document.getElementById('card-content');
}

function newCard() {
  let [sideA, sideB] = FLASHCARDS.deck.getRandomCard();

  getContentContainer().innerHTML = sideA;
  getContainer().onclick = () => {
    flipCard(sideB);
  };
  if (document.getElementById('scratchpad-autoclear').checked) {
    clearCanvas();
  }
}

function flipCard(sideB) {
  getContentContainer().innerHTML = sideB;
  let container = getContainer();
  container.onclick = () => {
    newCard();
  };
}

const stroke = [];

function drawOnCanvas() {
  const i = stroke.length - 1;
  const canvas = document.getElementById('scratchpad');
  const ctx = canvas.getContext('2d', { desynchronized: true});
  ctx.strokeStyle = '#000000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.length < 3) {
    const it = stroke.at(i);
    ctx.lineWidth = it.pressure * 2;
    ctx.beginPath();
    ctx.moveTo(it.x, it.y);
    ctx.stroke();
    return;
  }

  const cpx = (stroke[i].x + stroke[i - 1].x) / 2;
  const cpy = (stroke[i].y + stroke[i - 1].y) / 2;
  ctx.lineWidth = stroke[i - 1].pressure * 10;
  ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, cpx, cpy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cpx, cpy);
}

function onCanvasPointerMove(e) {
  e.stopPropagation()
  if (e.pressure === 0) {
    stroke.length = 0;
    return;
  }
  let canvas = document.getElementById('scratchpad');
  let w = canvas.parentElement.offsetWidth;
  let h = canvas.parentElement.offsetHeight;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  stroke.push({ x: e.offsetX, y: e.offsetY, pressure: e.pressure});
  drawOnCanvas();
}

function clearCanvas() {
  const canvas = document.getElementById('scratchpad');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function setUpSettingsPage(settings, deck) {
  let form = settings.generateForm(deck);
  let container = document.getElementById('settings-root');
  container.appendChild(form);
}

function requestedSettingsPage() {
  return window.location.search.endsWith("settings");
}

function openSettingsPage(e) {
  setMode(Mode.Settings);
  e.preventDefault();
  window.location.search = 'settings';
}

async function setUp() {
  document.getElementById('settings-button').addEventListener('click', openSettingsPage);
  document.getElementById('scratchpad').addEventListener('pointermove', onCanvasPointerMove);
  document.getElementById('scratchpad').addEventListener('pointerleave', () => { stroke.length = 0; });
  document.getElementById('scratchpad-clear').addEventListener('click', clearCanvas);

  let settings = new Settings();

  const response = await fetch("hiragana");
  const text = await response.text();
  let deck = new Deck(text, settings);
  setUpSettingsPage(settings, deck);
  setUpFlashcardsPage(settings, deck)
  if (requestedSettingsPage()) {
    setMode(Mode.Settings);
  } else {
    setMode(Mode.Cards);
  }

}

document.addEventListener("DOMContentLoaded", setUp);