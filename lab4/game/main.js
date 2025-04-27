import { Game } from "./objects/Game.js";

document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.body; // или document.getElementById('game-container')
    const game = new Game(gameContainer);
});
