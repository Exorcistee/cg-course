import { Game } from "./objects/Game.js";

const difficulty = parseInt(document.getElementById('difficulty').value);
const rows = difficulty;
const cols = difficulty;
const totalPairs = (rows * cols) / 2;

const gameContainer = document.body; 
const game = new Game(gameContainer, totalPairs);

