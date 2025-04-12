// Retrieve existing names from localStorage or start with an empty array
const params = new URLSearchParams(window.location.search);
let games = JSON.parse(localStorage.getItem("rummeyGamesData")) || [];


// DOM Elements
const gameSelector = document.getElementById("gameSelection");
const playersList = document.getElementById("playersList");
const scoresTablesHeaders = document.getElementById("scoresTableHeaders");
const scoresTableBody = document.getElementById("scoresTableBody");
const leaderboardTable = document.getElementById("leaderboardTableBody");
let leaderboard = {};

function writeGames() {
  localStorage.setItem("rummeyGamesData", JSON.stringify(games));
}

function renderGamesInSelector() {
  gameSelector.innerHTML = "";
  let counter = 1;
  let gameName = params.get("name")

  games.forEach(g => {
    let option = document.createElement("option");
    option.value = counter++;
    option.text = g.name;
    if (g.name === gameName) {
      option.selected = true;
    }
    gameSelector.appendChild(option);
  });
}

function renderPlayerScoreHeaders() {
  let game = getSelectedGame();

  if (game) {
    leaderboard = {};
    scoresTablesHeaders.innerHTML = '<th scope="col">#</th>';

    game.players.forEach(p => {
      let playerHeader = document.createElement("th");
      playerHeader.scope = "col";
      let playerHeaderCell = document.createTextNode(p);
      playerHeader.appendChild(playerHeaderCell);
      scoresTablesHeaders.appendChild(playerHeader);

      leaderboard[p] = 0;
    });
  }
}

function getSelectedGame() {
  let selectedValue = gameSelector.value;

  if (selectedValue === "" || selectedValue === "0") {
    return undefined;
  }

  return games[selectedValue - 1];
}

function renderScores() {
  let game = getSelectedGame();
  scoresTableBody.innerHTML = '';

  if (game) {
    let counter = 1;

    game.rounds.forEach(round => {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      th.scope = "row";
      th.textContent = counter++;

      tr.appendChild(th);

      game.players.forEach(player => {
        let td = document.createElement("td");
        let score = parseInt(round[player]);
        td.textContent = score;
        leaderboard[player] += score;

        tr.appendChild(td);
      })

      scoresTableBody.appendChild(tr);
    });
  }
}

function renderLeaderboard() {
  let game = getSelectedGame();
  leaderboardTable.innerHTML = '';

  if (game) {
    let counter = 1;

    const entries = Object.entries(leaderboard);
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


renderGamesInSelector();
renderPlayerScoreHeaders();
renderScores();
renderLeaderboard();

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

  let gameMetadata = {
    "name": newGameNameInput.value,
    "players": newPlayers,
    "rounds": []
  };

  newPlayers = [];
  playersList.innerHTML = "";
  newGameNameInput.value = "";


  games.push(gameMetadata);
  localStorage.setItem("rummeyGamesData", JSON.stringify(games));
  renderGamesInSelector();
  closeNewGameModalButton.click();
});

gameSelector.addEventListener("change", function () {
  renderPlayerScoreHeaders();
  renderScores();
  renderLeaderboard();
});

const newRoundModal = document.getElementById("newRoundModal");
const newRoundModalButtonOpen = document.getElementById("addRoundToGame");
const newRoundModalBody = document.getElementById("newRoundModalBody");
const newRoundModalSubmitButton = document.getElementById("submitNewRoundModalButton");
const newRoundModalCloseButton = document.getElementById("closeNewRoundModalButton");

newRoundModalButtonOpen.addEventListener("click", function () {
  let game = getSelectedGame();
  newRoundModalBody.innerHTML = "";

  if (game) {
    game.players.forEach(p => {
      let div = document.createElement("div");
      div.className = "input-group mb-3";

      let span = document.createElement("span");
      span.className = "input-group-text";
      span.textContent = p;

      let input = document.createElement("input");
      input.type = "number";
      input.classList = "form-control";
      input.value = 0;

      div.appendChild(span);
      div.appendChild(input);

      newRoundModalBody.appendChild(div);
    });
  }
});

newRoundModalSubmitButton.addEventListener("click", function () {
  let nodes = document.querySelectorAll("#newRoundModalBody div");
  let round = {};

  nodes.forEach(n => {
    let player = n.querySelector("span").textContent;
    let score = n.querySelector("input").value;

    round[player] = score;
  });

  round["date"] = new Date().toLocaleString();

  let game = getSelectedGame();
  game.rounds.push(round);

  writeGames();
  renderPlayerScoreHeaders();
  renderScores();
  renderLeaderboard();
  newRoundModalCloseButton.click();
});

const copyGameLinkButton = document.getElementById("copyGameLinkButton");
copyGameLinkButton.addEventListener("click", function () {
  let game = getSelectedGame();

  if (game) {
    let gameData = btoa(JSON.stringify(game));
    let parameters = new URLSearchParams();
    parameters.set("data", gameData);
    let url = window.location.href + '?' + parameters.toString();
    navigator.clipboard.writeText(url);

    copyGameLinkButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/></svg> Copied!'
    new Promise(resolve => setTimeout(resolve, 6000));
    copyGameLinkButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy"viewBox="0 0 16 16"><path fill-rule="evenodd"d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" /></svg> Copy Shareable Link'
  }
});