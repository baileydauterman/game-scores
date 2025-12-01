// Retrieve existing names from localStorage or start with an empty array
const params = new URLSearchParams(window.location.search);
const localStorageKey = "gamesDataV2"
let gm = GameManager.fromKey(localStorageKey);

// DOM Elements
const gameSelector = document.getElementById("gameSelection");
const playersList = document.getElementById("playersList");
const scoresTablesHeaders = document.getElementById("scoresTableHeaders");
const scoresTableBody = document.getElementById("scoresTableBody");
const leaderboardTable = document.getElementById("leaderboardTableBody");
const titleElement = document.getElementsByTagName("title")[0];

if (params.size >= 3) {
  let g = new Game();
  g.name = params.get("game");
  params.get("players").split(",").forEach(p => {
    if (p === undefined) {
      return;
    }
    g.addPlayer(p);
  });

  params.keys().forEach(k => {
    if (k === "game" || k === "players") {
      return;
    }

    let count = 0;
    round = new Round();
    params.get(k).split(',').forEach(s => {
      if (s === undefined) {
        return;
      }
      round.addScoreForPlayer(g.players[count++].name, parseFloat(s));
    });
    g.addRound(round);
  });

  gm.addGame(g);
}

function writeGamesToLocalStorage() {
  localStorage.setItem(localStorageKey, JSON.stringify(gm));
}

function renderGamesInSelector() {
  gameSelector.innerHTML = "";
  let counter = 1;
  let gameName = params.get("name")

  gm.games.forEach(g => {
    let option = document.createElement("option");
    if (counter - 1 === gm.selectedGame) {
      option.selected = true;
    }
    option.value = counter++;
    option.text = g.name;
    gameSelector.appendChild(option);
  });
}

function renderScores() {
  let game = gm.getSelectedGame();
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
  let game = gm.getSelectedGame();
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

      if (counter === 2) {
        td.textContent = "👑 " + player;
      } else {
        td.textContent = player;
      }

      tr.appendChild(td);

      td = document.createElement("td");
      score = parseFloat(sortedScores[player]);
      td.textContent = score;

      tr.appendChild(td);

      leaderboardTable.appendChild(tr);
    });
  }
}

function renderAllViews() {
  if (gm.getSelectedGame()) {
    titleElement.textContent = gm.getSelectedGame().name + " - Game Scores";
  } else {
    titleElement.textContent = "Game Scores";
  }
  renderGamesInSelector();
  renderScores();
  renderLeaderboard();

  writeGamesToLocalStorage();
}

renderAllViews();

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
  gm.addGameAndPlayers(name, newPlayers);

  playersList.innerHTML = "";
  newGameNameInput.value = "";
  newPlayers = []

  renderAllViews();
  closeNewGameModalButton.click();
});

gameSelector.addEventListener("change", function () {
  gm.changeSelectedGame(gameSelector.selectedIndex);
  renderAllViews();
});

const newRoundModal = document.getElementById("newRoundModal");
const newRoundModalButtonOpen = document.getElementById("addRoundToGame");
const newRoundModalBody = document.getElementById("newRoundModalBody");
const newRoundModalSubmitButton = document.getElementById("submitNewRoundModalButton");
const newRoundModalCloseButton = document.getElementById("closeNewRoundModalButton");

newRoundModalButtonOpen.addEventListener("click", function () {
  let game = gm.getSelectedGame();
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
      input.inputmode = "decimal";
      input.pattern = "(-?[0-9]+([\.,][0-9]+)?)"
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
  let round = new Round();

  nodes.forEach(n => {
    let player = n.querySelector("span").textContent;
    let score = n.querySelector("input").value;

    if (score === "") {
      score = 0;
    }

    round.addScoreForPlayer(player, score);
  });

  let game = gm.getSelectedGame();
  game.addRound(round);

  renderAllViews();
  newRoundModalCloseButton.click();
});

const copyGameLinkButton = document.getElementById("copyGameLinkButton");
const toastLiveExample = document.getElementById('liveToast')
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);

copyGameLinkButton.addEventListener("click", function () {
  let game = gm.getSelectedGame();

  if (game) {
    let parameters = new URLSearchParams();
    parameters.set("game", game.name);
    parameters.set("players", game.getPlayers());

    game.rounds.forEach(r => {
      let scores = [];

      r.scores.forEach(p => {
        scores.push(p.score);
      });

      parameters.set(new Date(r.date).getTime(), scores);
    });

    let url = window.location.href + '?' + parameters.toString();
    navigator.clipboard.writeText(url);

    toastBootstrap.show();
  }
});

const deleteCurrentGameButton = document.getElementById("deleteGameButton");
const closeDeleteGameModalButton = document.getElementById("closeDeleteGameModalButton");

deleteCurrentGameButton.addEventListener("click", function () {
  gm.deleteSelectedGame();
  renderAllViews();
  closeDeleteGameModalButton.click();
});