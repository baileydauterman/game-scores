class Player {
    constructor(name) {
        this.name = name;
    }

    static from(json) {
        return Object.assign(new Player(), json);
    }
}

class Score {
    constructor(player, score) {
        this.player = player
        this.score = parseInt(score);
    }

    static from(json) {
        return Object.assign(new Score(), json);
    }
}

class Round {
    constructor() {
        this.date = new Date().toLocaleString();;
        this.scores = []
    }

    addScore(score) {
        this.scores.push(score);
    }

    addScoreForPlayer(player, scoreValue) {
        let score = new Score(player, scoreValue);
        this.scores.push(score);
    }

    static from(json) {
        let round = Object.assign(new Round(), json);

        for (let i = 0; i < round.scores.length; i++) {
            round.scores[i] = Round.from(round.scores[i]);
        }

        return round;
    }
}

class Game {
    constructor(name) {
        this.name = name;
        this.players = [];
        this.rounds = [];
        this.leaderboard = {};
    }

    addPlayer(name) {
        let player = new Player(name);
        this.players.push(player);
        this.leaderboard[name] = 0;
    }

    addPlayers(players) {
        players.forEach(p => {
            this.addPlayer(p);
        });
    }

    addRound(round) {
        this.rounds.push(round);
        console.log(round);
        this.updateLeaderboard(round);
    }

    updateLeaderboard(round) {
        round.scores.forEach(s => {
            this.leaderboard[s.player] += s.score;
        });
    }

    getPlayers() {
        let returnPlayers = [];
        this.players.forEach(p => {
            returnPlayers.push(p.name);
        });

        return returnPlayers;
    }

    static from(json) {
        let game = Object.assign(new Game(), json);

        for (let p = 0; p < game.players.length; p++) {
            game.players[p] = Player.from(game.players[p]);
        }

        for (let r = 0; r < game.rounds.length; r++) {
            game.rounds[r] = Round.from(game.rounds[r]);

        }

        return game;
    }

    static fromParameters(params) {
        let game = new Game();
        game.name = params.get("game");
        params.get("players").split(",").forEach(player => {
            if (player === undefined) {
                return;
            }
            game.addPlayer(player);
        });

        params.keys().forEach(roundKey => {
            if (roundKey === "game" || roundKey === "players") {
                return;
            }

            let count = 0;
            let round = new Round();
            params.get(roundKey).split(',').forEach(s => {
                if (s === undefined) {
                    return;
                }
                round.addScoreForPlayer(game.players[count++].name, parseInt(s));
            });
            game.addRound(round);
        });

        return game;
    }
}

class GameManager {
    constructor() {
        this.games = [];
        this.selectedGame = 0;
    }

    addGame(g) {
        this.games.push(g);
        this.changeSelectedGame(this.games.length - 1);
    }

    addGameAndPlayers(name, players) {
        let game = new Game(name);
        game.addPlayers(players);
        this.games.push(game);
        this.changeSelectedGame(this.games.length - 1);
    }

    changeSelectedGame(idx) {
        this.selectedGame = idx;
    }

    getSelectedGame() {
        if (this.selectedGame + 1 > this.games.length) {
            return undefined;
        }

        return this.games[this.selectedGame];
    }

    getGameAsUrlParameters(url) {
        let game = this.getSelectedGame();

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

            // parameters.set("data", gameData);
            url = url + '?' + parameters.toString();
            navigator.clipboard.writeText(url);
        }

        return url;
    }

    static fromKey(localStoreKey) {
        let json = JSON.parse(localStorage.getItem(localStoreKey)) || {};
        let gm = Object.assign(new GameManager(), json);

        for (let idx = 0; idx < gm.games.length; idx++) {
            gm.games[idx] = Game.from(gm.games[idx]);
        }

        if (gm.games.length > 0) {
            gm.changeSelectedGame(0);
        }

        return gm;
    }
}