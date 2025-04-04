// Elements specific to gamePlace.html
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time'); // Corrected ID from your HTML
const startNewGameButton = document.getElementById('start-new-game');
const soundButton = document.getElementById('sound-button'); // Assuming you might add functionality later
 
// --- Game State Variables (Example) ---
let score = 0;
let lives = 3; // Add lives tracking
let timerInterval = null; // To hold the timer ID
 
// --- Bug Images ---
const bugImages = [
    'images/SimpleBug.png',
    'images/FastBug.png',
    'images/ComplexBug.png',
    'images/StrongBug.png'
    // Add other bug images if needed
];
 
// --- Questions (Keep this structure) ---
const questions = {
    // Your easy, medium, hard questions here...
    easy: [
        { question: "What is 2 + 2?", answers: ["4", "3", "5", "6"], correct: "4" },
        // ... more easy questions
    ],
    medium: [
        { question: "What does 'var' declare?", answers: ["Variable", "Function", "Class", "Array"], correct: "Variable" },
        // ... more medium questions
    ],
    hard: [
        { question: "Time complexity of binary search?", answers: ["O(log n)", "O(n)", "O(n^2)", "O(1)"], correct: "O(log n)" },
        // ... more hard questions
    ]
};
 
// --- Helper Functions ---
 
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
 
function getRandomQuestion(difficulty = "easy") { // Default to easy for now
    // You'll need to pass the actual selected difficulty from levels.html later
    const questionSet = questions[difficulty] || questions.easy; // Fallback to easy
    if (!questionSet || questionSet.length === 0) {
        console.error("No questions found for difficulty:", difficulty);
        // Return a default placeholder question or handle error
        return { question: "Error: No question found.", answers: ["OK"], correct: "OK" };
    }
    const randomIndex = Math.floor(Math.random() * questionSet.length);
    const question = { ...questionSet[randomIndex] }; // Clone question object
    question.answers = [...question.answers]; // Clone answers array
    shuffleArray(question.answers);
    return question;
}
 
function startTimer(duration, displayElement) {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
 
    let timer = duration;
    timeLeft = duration; // Update global timeLeft
 
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
 
        displayElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeLeft = timer; // Keep global timeLeft updated
 
        if (timer <= 0) {
            clearInterval(timerInterval);
            gameOver("Time's up!"); // Call game over function
        }
 
        timer--;
    }, 1000);
}
 
function spawnBug() {
    if (!gameContainer) {
        console.error("Game container not found!");
        return;
    }
    const bug = document.createElement('div');
    bug.classList.add('bug');
 
    // --- Position the bug randomly within the grid ---
    // Get grid dimensions (assuming 6 columns, 4 rows from CSS)
    const maxCol = 6;
    const maxRow = 4;
    const col = Math.floor(Math.random() * maxCol) + 1; // Grid columns start at 1
    const row = Math.floor(Math.random() * maxRow) + 1; // Grid rows start at 1
    bug.style.gridColumn = col;
    bug.style.gridRow = row;
    // Basic check for overlap (simple version - might need improvement)
    // This simple check doesn't guarantee no overlap if bugs spawn fast
    const existingBug = gameContainer.querySelector(`.bug[style*="grid-column: ${col};"][style*="grid-row: ${row};"]`);
    if (existingBug) {
        console.log("Overlap detected, trying to spawn again");
        // Optional: Try spawning again immediately or just skip this spawn
        spawnBug(); // Recursive call - careful with this, add a limit if needed
        return; // Stop this function instance
    }
 
 
    // --- Add the image ---
    const img = document.createElement('img');
    img.src = bugImages[Math.floor(Math.random() * bugImages.length)];
    img.alt = 'Bug'; // Simpler alt text is fine
    img.onerror = () => { // Add error handling for images
        console.error("Error loading image:", img.src);
        bug.style.backgroundColor = 'red'; // Make missing image obvious
        bug.textContent = 'X'; // Show an 'X' if image fails
    };
    bug.appendChild(img);
 
    // --- Add click listener for the question ---
    bug.addEventListener('click', handleBugClick);
 
    gameContainer.appendChild(bug);
}
 
function handleBugClick(event) {
    const clickedBug = event.currentTarget; // Get the div.bug that was clicked
 
    // Prevent clicking multiple bugs quickly
    clickedBug.removeEventListener('click', handleBugClick); // Remove listener temporarily
 
    // 1. Get a question
    const difficulty = "easy"; // TODO: Get difficulty from selected level
    const questionData = getRandomQuestion(difficulty);
 
    // 2. Display the question (using a simple prompt for now, ideally use a modal/popup)
    const userAnswer = prompt(`${questionData.question}\n\nAnswers:\n${questionData.answers.join('\n')}`);
 
    // 3. Check the answer
    if (userAnswer && userAnswer.trim().toLowerCase() === questionData.correct.toLowerCase()) {
        // Correct Answer
        alert("Correct!");
        score += 10; // Increase score
        scoreDisplay.textContent = score;
        clickedBug.remove(); // Remove the clicked bug
 
        // Check for win condition
        if (gameContainer.querySelectorAll('.bug').length === 0) {
            gameOver("You cleared all the bugs!");
        }
 
    } else {
        // Incorrect Answer or cancelled prompt
        alert(`Incorrect! The answer was: ${questionData.correct}`);
        lives--; // Decrease lives (implement lives display later)
        console.log("Lives left:", lives); // Log lives
 
        // Add the listener back so it can be clicked again (or maybe not?)
        // clickedBug.addEventListener('click', handleBugClick); // Decide if they get another try on the *same* bug
 
        if (lives <= 0) {
            gameOver("You ran out of lives!");
            return; // Stop spawning more bugs if game over
        }
 
        // Spawn 2 more bugs
        spawnBug();
        spawnBug();
    }
}
 
function startGame() {
    console.log("Starting new game...");
    if (!gameContainer || !startNewGameButton || !timeDisplay) {
        console.error("Required elements not found. Cannot start game.");
        return;
    }
    score = 0;
    lives = 3; // Reset lives
    scoreDisplay.textContent = score;
    gameContainer.innerHTML = ''; // Clear existing bugs
 
    // Spawn initial bugs (e.g., 5 to start)
    for (let i = 0; i < 5; i++) {
        spawnBug();
    }
 
    // Start the timer (e.g., 60 seconds)
    startTimer(180, timeDisplay); // Start a 180-second timer
 
    startNewGameButton.disabled = true; // Disable button while playing
}
 
function gameOver(message) {
    console.log("Game Over:", message);
    alert(`Game Over!\n${message}\nFinal Score: ${score}`);
    if (timerInterval) {
        clearInterval(timerInterval); // Stop the timer
    }
    startNewGameButton.disabled = false; // Re-enable start button
    // Maybe clear the game container or show a game over screen
    gameContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: black;">Game Over!</p>';
}
 
// --- Event Listeners ---
 
// Make sure the DOM is loaded before adding listeners
document.addEventListener('DOMContentLoaded', () => {
    // Re-select elements just in case script runs before DOM is fully ready
    const gameContainer = document.getElementById('game-container');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startNewGameButton = document.getElementById('start-new-game');
    const soundButton = document.getElementById('sound-button');
 
    if (startNewGameButton) {
        startNewGameButton.addEventListener('click', startGame);
    } else {
        console.error("Start New Game button not found on DOMContentLoaded.");
    }
 
    if (soundButton) {
        soundButton.addEventListener('click', () => {
            alert('Sound toggle clicked! (Functionality not implemented yet)');
            // Add sound toggle logic here
        });
    }
 
    // Initial setup (optional)
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (timeDisplay) timeDisplay.textContent = timeLeft; // Show initial time
 
    document.getElementById('play-button').addEventListener('click', () => {
        window.location.href = 'levels.html'; // Navigate to the levels page
    });
});
