class Player {
    constructor(name) {
        this.name = name;
        this.uuid = crypto.randomUUID();
    }

    static from(json) {
        return Object.assign(new Player(), json);
    }
}

class Score {
    constructor(player, score) {
        this.player = player
        this.score = parseFloat(score);
    }

    static from(json) {
        return Object.assign(new Score(), json);
    }
}

class Round {
    constructor() {
        this.date = new Date().toLocaleString();
        this.scores = [];
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

        if (this.games.length === 1) {
            this.changeSelectedGame(0);
        }
    }

    changeSelectedGame(idx) {
        this.selectedGame = idx;
    }

    deleteSelectedGame() {
        if (this.getSelectedGame()) {
            this.games.splice(this.selectedGame, 1);
            this.changeSelectedGame(0);
        }
    }

    getSelectedGame() {
        if (this.selectedGame + 1 > this.games.length) {
            return null;
        }

        return this.games[this.selectedGame];
    }

    static fromKey(localStoreKey) {
        let json = JSON.parse(localStorage.getItem(localStoreKey)) || {};
        let gm =  Object.assign(new GameManager(), json);

        for (let idx = 0; idx < gm.games.length; idx++) {
            gm.games[idx] = Game.from(gm.games[idx]);
        }
        
        if (gm.games.length > 0) {
            gm.changeSelectedGame(0);
        }

        return gm;
    }
}