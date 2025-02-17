const player = document.getElementById('player');
const mainWorld = document.getElementById('main-world');
const miniGameScreen = document.getElementById('mini-game-screen');
const miniGameBanner = document.getElementById('mini-game-banner');
const exitButton = document.getElementById('exit-button');
const miniGameAreas = document.querySelectorAll('.mini-game-area');
const hoverBanner = document.getElementById('hover-banner');
const pongGame = document.getElementById('pong-game');
const runningGame = document.getElementById('running-game');
const obstacleGame = document.getElementById('obstacle-game');
const memoryGame = document.getElementById('memory-game');

let playerX = 0;
let playerY = 0;
let currentGame = null;
let score = 0;
const beatenGames = new Set(); // Track beaten games
let hoveredArea = null; // Track which area is being hovered

// Initialize player position
player.style.top = `${playerY}px`;
player.style.left = `${playerX}px`;

// Player Movement
document.addEventListener('keydown', (event) => {
    const speed = 10;
    if (currentGame === null) {
        // Main world movement
        switch (event.key) {
            case 'ArrowUp':
                playerY -= speed;
                break;
            case 'ArrowDown':
                playerY += speed;
                break;
            case 'ArrowLeft':
                playerX -= speed;
                break;
            case 'ArrowRight':
                playerX += speed;
                break;
            case 'Enter':
                if (hoveredArea) {
                    startMiniGame(hoveredArea.dataset.game);
                }
                break;
        }
        player.style.top = `${playerY}px`;
        player.style.left = `${playerX}px`;

        // Check if player enters a mini-game area
        miniGameAreas.forEach(area => {
            const rect = area.getBoundingClientRect();
            if (
                playerX >= rect.left &&
                playerX <= rect.right &&
                playerY >= rect.top &&
                playerY <= rect.bottom &&
                !beatenGames.has(area.dataset.game) // Prevent replaying beaten games
            ) {
                hoveredArea = area; // Set the hovered area
                hoverBanner.style.display = 'block';
                hoverBanner.style.top = `${rect.top - 30}px`; // Position above the area
                hoverBanner.style.left = `${rect.left}px`;
            } else if (hoveredArea === area) {
                hoveredArea = null; // Clear the hovered area
                hoverBanner.style.display = 'none';
            }
        });
    } else if (currentGame === 'running') {
        // Typing race logic
    } else if (currentGame === 'obstacle') {
        // Maze movement
        const mazePlayer = document.getElementById('maze-player');
        let mazePlayerX = parseFloat(mazePlayer.style.left || 0);
        let mazePlayerY = parseFloat(mazePlayer.style.top || 0);
        switch (event.key) {
            case 'ArrowUp':
                mazePlayerY -= speed;
                break;
            case 'ArrowDown':
                mazePlayerY += speed;
                break;
            case 'ArrowLeft':
                mazePlayerX -= speed;
                break;
            case 'ArrowRight':
                mazePlayerX += speed;
                break;
        }
        mazePlayer.style.top = `${mazePlayerY}px`;
        mazePlayer.style.left = `${mazePlayerX}px`;

        // Check for collisions with walls
        const walls = document.querySelectorAll('.maze-wall');
        walls.forEach(wall => {
            const rect = wall.getBoundingClientRect();
            if (
                mazePlayerX + 50 >= rect.left &&
                mazePlayerX <= rect.right &&
                mazePlayerY + 50 >= rect.top &&
                mazePlayerY <= rect.bottom
            ) {
                alert('You hit a wall! Game over.');
                exitButton.click();
            }
        });

        // Check if player reaches the goal
        const goal = document.getElementById('maze-goal');
        const goalRect = goal.getBoundingClientRect();
        if (
            mazePlayerX + 50 >= goalRect.left &&
            mazePlayerX <= goalRect.right &&
            mazePlayerY + 50 >= goalRect.top &&
            mazePlayerY <= goalRect.bottom
        ) {
            alert('You reached the goal!');
            markGameAsBeaten('obstacle');
            exitButton.click();
        }
    }
});

// Start Mini-Game
function startMiniGame(game) {
    currentGame = game;
    mainWorld.style.display = 'none';
    miniGameScreen.style.display = 'block';
    miniGameBanner.textContent = `${game.charAt(0).toUpperCase() + game.slice(1)} Game`;
    miniGameBanner.style.display = 'block';
    exitButton.style.display = 'block';

    // Hide all mini-games
    document.querySelectorAll('.mini-game').forEach(game => game.style.display = 'none');

    // Show the selected mini-game
    document.getElementById(`${game}-game`).style.display = 'block';

    // Initialize the mini-game
    if (game === 'pong') {
        startPong();
    } else if (game === 'running') {
        startTypingRace();
    } else if (game === 'obstacle') {
        startMaze();
    } else if (game === 'memory') {
        startMemory();
    }
}

// Exit Mini-Game
exitButton.addEventListener('click', () => {
    mainWorld.style.display = 'block';
    miniGameScreen.style.display = 'none';
    currentGame = null;
    score = 0; // Reset score
    player.style.display = 'block'; // Ensure main player is visible
    player.style.top = `${playerY}px`; // Reset player position
    player.style.left = `${playerX}px`;
});

// Mark a game as beaten
function markGameAsBeaten(game) {
    beatenGames.add(game);
    miniGameAreas.forEach(area => {
        if (area.dataset.game === game) {
            area.classList.add('beaten');
        }
    });
}

// Pong Game
function startPong() {
    const ball = document.getElementById('pong-ball');
    const paddlePlayer = document.getElementById('pong-paddle-player');
    const paddleAI = document.getElementById('pong-paddle-ai');
    const playerScore = document.getElementById('player-score');
    const aiScore = document.getElementById('ai-score');

    let ballX = 50;
    let ballY = 50;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    let playerScoreCount = 0;
    let aiScoreCount = 0;

    // Move ball
    function moveBall() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top and bottom
        if (ballY <= 0 || ballY >= 100) {
            ballSpeedY *= -1;
        }

        // Ball collision with paddles
        if (
            ballX <= 10 &&
            ballY >= parseFloat(paddlePlayer.style.top) &&
            ballY <= parseFloat(paddlePlayer.style.top) + 80
        ) {
            ballSpeedX *= -1;
        }

        if (
            ballX >= 90 &&
            ballY >= parseFloat(paddleAI.style.top) &&
            ballY <= parseFloat(paddleAI.style.top) + 80
        ) {
            ballSpeedX *= -1;
        }

        // Ball out of bounds
        if (ballX <= 0) {
            aiScoreCount++;
            aiScore.textContent = aiScoreCount;
            resetBall();
        }

        if (ballX >= 100) {
            playerScoreCount++;
            playerScore.textContent = playerScoreCount;
            resetBall();
        }

        // Check for win/lose
        if (playerScoreCount >= 3) {
            alert('You won the Pong Game!');
            markGameAsBeaten('pong');
            exitButton.click();
        }

        if (aiScoreCount >= 3) {
            alert('You lost the Pong Game!');
            exitButton.click();
        }

        // Update ball position
        ball.style.left = `${ballX}%`;
        ball.style.top = `${ballY}%`;
    }

    // Reset ball position
    function resetBall() {
        ballX = 50;
        ballY = 50;
        ballSpeedX = 5;
        ballSpeedY = 5;
    }

    // AI paddle movement
    function moveAI() {
        const aiPaddleCenter = parseFloat(paddleAI.style.top) + 40;
        if (aiPaddleCenter < ballY) {
            paddleAI.style.top = `${parseFloat(paddleAI.style.top) + 2}%`;
        } else {
            paddleAI.style.top = `${parseFloat(paddleAI.style.top) - 2}%`;
        }
    }

    // Player paddle movement
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            paddlePlayer.style.top = `${Math.max(0, parseFloat(paddlePlayer.style.top) - 5}%`;
        } else if (event.key === 'ArrowDown') {
            paddlePlayer.style.top = `${Math.min(80, parseFloat(paddlePlayer.style.top) + 5}%`;
        }
    });

    // Game loop
    const gameLoop = setInterval(() => {
        moveBall();
        moveAI();
    }, 20);
}

// Typing Race
function startTypingRace() {
    const typingPrompt = document.getElementById('typing-prompt');
    const typingInput = document.getElementById('typing-input');
    const typingTimer = document.getElementById('typing-timer');
    const typingScore =
