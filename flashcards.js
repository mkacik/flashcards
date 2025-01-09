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

// transform deck string from CSV format to object storing indexed pairs of side A and B
// english pronunciation will always be first column
function parseDeck(deckString, lettercase) {
  let deck = new Map();
  let rows = deckString.trim().split("\n");

  var index = 0;
  for (row of rows) {
    sides = row.split(",");
    if (sides.length == 2) {
      let en = lettercase == "lowercase" ? sides[0].toLowerCase() : sides[0].toUpperCase();
      deck.set(index, [en, sides[1]]);
      // only increment index on valid rows
      index += 1;
    }
  }

  return deck;
}

function getContainer() {
  return document.getElementById("root");
}

function defaultSettings() {
  return {
    "lettercase": "lowercase",
  }
}

function setUp() {
  let settings = JSON.parse(window.localStorage.getItem("FLASHCARDS.settings")) ?? defaultSettings();

  let deck =  parseDeck(DECK, settings.lettercase);

  window.FLASHCARDS = {}
  FLASHCARDS.deck = deck;

  let container = getContainer();
  container.innerHTML = '<img src="play.svg" alt="START" width="240" height="240">';
  container.onclick = newCard;

  window.onkeydown = function(event){
    if(event.keyCode === 32) {
        event.preventDefault();
        container.click();
    }
};
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomCard() {
  let randomIndex = getRandomInt(FLASHCARDS.deck.size);
  return FLASHCARDS.deck.get(randomIndex);
}

function newCard() {
  let container = getContainer();
  let [sideA, sideB] = getRandomCard();

  // pick side to show first
  container.innerHTML = (getRandomInt(2) == 0) ? sideA : sideB;
  container.onclick = function() { flipCard(sideA, sideB); };
}

function flipCard(sideA, sideB) {
  let container = getContainer();
  container.innerHTML = sideB + "<br \>" + sideA;
  container.onclick = newCard;
}

document.addEventListener("DOMContentLoaded", setUp);
