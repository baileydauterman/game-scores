// Retrieve existing names from localStorage or start with an empty array
const params = new URLSearchParams(window.location.search);
const localStorageKey = "gamesDataV2"
let gameManager = GameManager.fromKey(localStorageKey);

// DOM Elements
const gameSelector = document.getElementById("gameSelection");
const playersList = document.getElementById("playersList");
const scoresTablesHeaders = document.getElementById("scoresTableHeaders");
const scoresTableBody = document.getElementById("scoresTableBody");
const leaderboardTable = document.getElementById("leaderboardTableBody");

if (params.size >= 3) {
  let g = Game.fromParameters(params);
  gameManager.addGame(g);
}

function writeGames() {
  localStorage.setItem(localStorageKey, JSON.stringify(gameManager));
}

function renderGamesInSelector() {
  gameSelector.innerHTML = "";
  let counter = 1;

  gameManager.games.forEach(g => {
    let option = document.createElement("option");
    if (counter - 1 === gameManager.selectedGame) {
      option.selected = true;
    }

    if (g.rounds.length > 0) {
      option.text = g.name + "\n" + g.rounds[g.rounds.length - 1].date;
    }
    else {
      option.text = g.name;
    }

    option.value = counter++;
    gameSelector.appendChild(option);
  });
}

function renderScores() {
  let game = gameManager.getSelectedGame();
  scoresTableBody.innerHTML = '';

  if (game) {
    scoresTablesHeaders.innerHTML = '<th scope="col">#</th>';

    game.players.forEach(p => {
      let playerHeader = document.createElement("th");
      playerHeader.scope = "col";
      let playerHeaderCell = document.createTextNode(p.name);
      playerHeader.appendChild(playerHeaderCell);
      scoresTablesHeaders.appendChild(playerHeader);
    });

    let counter = 1;

    game.rounds.forEach(round => {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      th.scope = "row";
      th.textContent = counter++;

      tr.appendChild(th);

      round.scores.forEach(r => {
        let td = document.createElement("td");
        td.textContent = r.score;
        tr.appendChild(td);
      })

      scoresTableBody.appendChild(tr);
    });
  }
}

function renderLeaderboard() {
  let game = gameManager.getSelectedGame();
  leaderboardTable.innerHTML = '';

  if (game) {
    let counter = 1;

    const entries = Object.entries(game.leaderboard);
    entries.sort((a, b) => b[1] - a[1]);
    const sortedScores = Object.fromEntries(entries);

    Object.keys(sortedScores).forEach(player => {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      th.scope = "row";
      th.textContent = counter++;

      tr.appendChild(th);

      let td = document.createElement("td");
      td.textContent = player;

      tr.appendChild(td);

      td = document.createElement("td");
      score = parseInt(sortedScores[player]);
      td.textContent = score;

      tr.appendChild(td);

      leaderboardTable.appendChild(tr);
    });
  }
}

function refreshPage() {
  writeGames();
  renderGamesInSelector();
  renderScores();
  renderLeaderboard();
}

refreshPage();

let newPlayers = [];
const newGameAddPlayerButton = document.getElementById("addPlayerToNewGameBtn");
const newGameAddPlayerInput = document.getElementById("newGameAddPlayerInput");

function addNewPlayerToNewGameList() {
  let playerNameInput = document.getElementById("newGameAddPlayerInput");
  let playerName = playerNameInput.value.trim();

  if (playerName !== "" && newPlayers.indexOf(playerName) === -1) {
    newPlayers.push(playerName);
    playerNameInput.textContent = "";
    let player = document.createElement("li");
    player.classList.add("list-group-item");
    player.textContent = playerName;
    playersList.appendChild(player);
    playerNameInput.value = "";
  }
}

newGameAddPlayerButton.addEventListener("click", addNewPlayerToNewGameList);
newGameAddPlayerInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addNewPlayerToNewGameList();
  }
});

const newGameNameInput = document.getElementById("newGameNameInput");
const createNewGameButton = document.getElementById("createNewGameInModal");
const closeNewGameModalButton = document.getElementById("closeNewGameModal");
createNewGameButton.addEventListener("click", function () {
  if (newGameNameInput.value === "" || newPlayers.length < 1) {
    return;
  }

  let name = newGameNameInput.value
  gameManager.addGameAndPlayers(name, newPlayers);

  playersList.innerHTML = "";
  newGameNameInput.value = "";
  newPlayers = []

  gameSelector.selectedIndex = gameManager.selectedGame;
  refreshPage();
  closeNewGameModalButton.click();
});

gameSelector.addEventListener("change", function () {
  gameManager.changeSelectedGame(gameSelector.selectedIndex)
  refreshPage();
});

const newRoundModal = document.getElementById("newRoundModal");
const newRoundModalButtonOpen = document.getElementById("addRoundToGame");
const newRoundModalBody = document.getElementById("newRoundModalBody");
const newRoundModalSubmitButton = document.getElementById("submitNewRoundModalButton");
const newRoundModalCloseButton = document.getElementById("closeNewRoundModalButton");

newRoundModalButtonOpen.addEventListener("click", function () {
  let game = gameManager.getSelectedGame();
  newRoundModalBody.innerHTML = "";

  if (game) {
    game.players.forEach(p => {
      let div = document.createElement("div");
      div.className = "input-group mb-3";

      let span = document.createElement("span");
      span.className = "input-group-text";
      span.textContent = p.name;

      let input = document.createElement("input");
      input.type = "number";
      input.inputmode = "numeric";
      input.pattern = "[0-9]*";
      input.classList = "form-control";
      input.placeholder = 0;

      div.appendChild(span);
      div.appendChild(input);

      newRoundModalBody.appendChild(div);
    });
  }
});

newRoundModalSubmitButton.addEventListener("click", function () {
  let nodes = document.querySelectorAll("#newRoundModalBody div");
  let game = gameManager.getSelectedGame();

  if (game) {
    let round = new Round();

    nodes.forEach(n => {
      let player = n.querySelector("span").textContent;
      let score = n.querySelector("input").value;

      if (score === "") {
        score = 0;
      }

      round.addScoreForPlayer(player, score);
    });

    game.addRound(round);
  }

  refreshPage();
  newRoundModalCloseButton.click();
});

const copyGameLinkButton = document.getElementById("copyGameLinkButton");
copyGameLinkButton.addEventListener(
  "click",
  () => gameManager.getGameAsUrlParameters(window.location.href)
);