import { Game } from "./objects/Game.js";

document.getElementById('start-btn').addEventListener('click', () => {

    const difficulty = parseInt(document.getElementById('difficulty').value);
    const rows = difficulty;
    const cols = difficulty;
    const totalPairs = (rows * cols) / 2;

    const gameContainer = document.body; 
    const game = new Game(gameContainer, totalPairs);

});
