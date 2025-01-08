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
function parseDeck(deckString) {
  let deck = new Map();
  let rows = deckString.trim().split("\n");

  var index = 0;
  for (row of rows) {
    sides = row.split(",");
    if (sides.length == 2) {
      deck.set(index, [sides[0], sides[1]]);
      // only increment index on valid rows
      index += 1;
    }
  }

  return deck;
}

function getContainer() {
  return document.getElementById("root");
}

function setUp() {
  let deck =  parseDeck(DECK);
  console.log(deck);
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
  let card = getRandomCard();

  // pick side to show first
  let [sideA, sideB] = (getRandomInt(2) == 0) ? [card[0], card[1]] : [card[1], card[0]];
  container.innerHTML = sideA;
  container.onclick = function() { flipCard(sideA, sideB); };
}

function flipCard(sideA, sideB) {
  let container = getContainer();
  container.innerHTML = sideA + "<br \>" + sideB;
  container.onclick = newCard;
}

document.addEventListener("DOMContentLoaded", setUp);
