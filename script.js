// Elements specific to gamePlace.html
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startNewGameButton = document.getElementById('start-new-game');
const soundButton = document.getElementById('sound-button');

// --- Popup Elements ---
const questionPopup = document.getElementById('question-popup');
const questionText = document.getElementById('question-text');
const confirmAnswerButton = document.getElementById('confirm-answer');
// Answer buttons are selected dynamically within handleBugClick

// --- Game State Variables ---
let score = 0;
let lives = 3;
let timerInterval = null;
let timeLeft = 180; // Default time, will be overwritten by difficulty
let selectedDifficulty = "easy"; // Default difficulty
let currentBug = null; // The bug div element that was clicked
let currentQuestionData = null; // The question object being asked
let selectedAnswerButton = null; // The answer button element that was clicked

// --- Bug Images ---
const bugImages = [
    'images/SimpleBug.png', 'images/FastBug.png', 'images/ComplexBug.png', 'images/StrongBug.png'
];

// --- Questions (Ensure all difficulties have questions) ---
const questions = {
    easy: [
        { question: "What is 2 + 2?", answers: ["4", "3", "5", "6"], correct: "4" },
        { question: "What is the capital of France?", answers: ["Paris", "London", "Berlin", "Madrid"], correct: "Paris" },
        { question: "What color is the sky?", answers: ["Blue", "Green", "Red", "Yellow"], correct: "Blue" }
    ],
    medium: [
        { question: "What does 'var' declare in JavaScript?", answers: ["Variable", "Function", "Class", "Array"], correct: "Variable" },
        { question: "Output of 'typeof null'?", answers: ["object", "null", "undefined", "string"], correct: "object" },
        { question: "HTML tag for JavaScript?", answers: ["<script>", "<js>", "<javascript>", "<code>"], correct: "<script>" }
    ],
    hard: [
        { question: "Time complexity of binary search?", answers: ["O(log n)", "O(n)", "O(n^2)", "O(1)"], correct: "O(log n)" },
        { question: "Purpose of JS closures?", answers: ["Encapsulate variables", "Create classes", "Define globals", "Optimize loops"], correct: "Encapsulate variables" },
        { question: "Difference between '==' and '==='?", answers: ["Value vs Value & Type", "Identical", "Type vs Value", "None"], correct: "Value vs Value & Type" }
    ],
    expert: [
        { question: "Output of '1 + '2' + 3'?", answers: ["123", "6", "15", "NaN"], correct: "123" },
        { question: "Algorithm in merge sort?", answers: ["Divide and Conquer", "Dynamic Programming", "Greedy", "Backtracking"], correct: "Divide and Conquer" },
        { question: "Purpose of 'this' keyword?", answers: ["Current object context", "New object", "Define variable", "None"], correct: "Current object context" }
    ],
    insane: [
        { question: "Quicksort worst case Big-O?", answers: ["O(n^2)", "O(n log n)", "O(n)", "O(1)"], correct: "O(n^2)" },
        { question: "Output of '[] + []'?", answers: ["'' (empty string)", "[]", "undefined", "NaN"], correct: "'' (empty string)" },
        { question: "Purpose of 'bind' method?", answers: ["Set 'this' context", "Create new function", "Define variable", "None"], correct: "Set 'this' context" }
    ],
    impossible: [
        { question: "Output of 'typeof NaN'?", answers: ["number", "NaN", "undefined", "object"], correct: "number" },
        { question: "Data structure in BFS?", answers: ["Queue", "Stack", "Heap", "Graph"], correct: "Queue" },
        { question: "Purpose of 'Symbol' type?", answers: ["Unique identifiers", "Define variables", "Optimize loops", "None"], correct: "Unique identifiers" }
    ]
};

// --- Helper Functions ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomQuestion(difficulty = "easy") {
    const questionSet = questions[difficulty] || questions.easy;
    if (!questionSet || questionSet.length === 0) {
        console.error("No questions found for difficulty:", difficulty);
        return { question: "Error: No question found.", answers: ["OK", "OK", "OK", "OK"], correct: "OK", shuffledAnswers: ["OK", "OK", "OK", "OK"] };
    }
    const randomIndex = Math.floor(Math.random() * questionSet.length);
    const question = { ...questionSet[randomIndex] };

    while (question.answers.length < 4) question.answers.push("N/A");
    question.answers = question.answers.slice(0, 4);

    let shuffledAnswers = [...question.answers];
    shuffleArray(shuffledAnswers);
    question.shuffledAnswers = shuffledAnswers;
    return question;
}

function startTimer(duration, displayElement) {
    if (timerInterval) clearInterval(timerInterval);
    let timer = duration;
    timeLeft = duration;

    timerInterval = setInterval(() => {
        if (!displayElement) {
             clearInterval(timerInterval);
             return;
        }
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        displayElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeLeft = timer;

        if (timer <= 0) {
            clearInterval(timerInterval);
            gameOver("Time's up!");
        }
        timer--;
    }, 1000);
}

function spawnBug() {
    // Ensure game container exists before spawning
    if (!gameContainer) {
        console.error("Game container not found, cannot spawn bug.");
        return;
    }
    const bug = document.createElement('div');
    bug.classList.add('bug');

    const maxCol = 6;
    const maxRow = 4;
    let col, row, attempts = 0;
    const maxAttempts = 30; // Limit attempts to find empty spot

    do {
        col = Math.floor(Math.random() * maxCol) + 1;
        row = Math.floor(Math.random() * maxRow) + 1;
        attempts++;
        if (attempts > maxAttempts) {
             console.warn(`Could not find empty spot for bug after ${maxAttempts} attempts.`);
             return; // Stop trying if grid might be full
        }
    } while (gameContainer.querySelector(`.bug[style*="grid-column: ${col};"][style*="grid-row: ${row};"]`));

    bug.style.gridColumn = col;
    bug.style.gridRow = row;

    const img = document.createElement('img');
    img.src = bugImages[Math.floor(Math.random() * bugImages.length)];
    img.alt = 'Bug';
    img.onerror = () => { bug.style.backgroundColor = 'red'; bug.textContent = 'X'; };
    bug.appendChild(img);

    // Add the click listener to THIS specific bug instance
    bug.addEventListener('click', () => handleBugClick(bug));

    gameContainer.appendChild(bug);
    // console.log(`Bug spawned at ${col}, ${row}`);
}

// --- Handle Bug Click (Opens Popup) ---
function handleBugClick(clickedBug) {
    console.log("handleBugClick triggered for bug:", clickedBug); // Log: Start of function

    // 1. Check if popup element exists
    if (!questionPopup) {
        console.error("Question popup element not found!");
        return;
    }

    // 2. Check if popup is already visible (should not happen if logic is correct)
    if (!questionPopup.classList.contains('hidden')) {
        console.warn("handleBugClick called while popup is already visible.");
        return;
    }

    // 3. Check if we are already processing a question (should not happen)
    if (currentQuestionData || currentBug) {
         console.warn("handleBugClick called while another question is active.");
         // Optionally force hide popup and reset state here if needed
         // questionPopup.classList.add('hidden');
         // currentBug = null; currentQuestionData = null; selectedAnswerButton = null;
         // return;
    }

    console.log("Proceeding to open popup..."); // Log: Checks passed

    currentBug = clickedBug; // Store reference to the clicked bug DIV
    currentQuestionData = getRandomQuestion(selectedDifficulty);
    selectedAnswerButton = null; // Reset selected answer button

    // --- Populate Popup ---
    if (!questionText) {
        console.error("Question text element not found!");
        currentBug = null; // Reset state
        currentQuestionData = null;
        return; // Cannot proceed
    }
    questionText.textContent = currentQuestionData.question;

    // Get the answer buttons *inside* the popup dynamically each time
    const currentAnswerButtons = questionPopup.querySelectorAll('.answers .answer');

    if (currentAnswerButtons.length !== 4) {
        console.error("Expected 4 answer buttons, found:", currentAnswerButtons.length);
        currentBug = null; // Reset state
        currentQuestionData = null;
        return; // Cannot proceed
    }

    // Remove old listeners and set new text/data using cloning
    try {
        currentAnswerButtons.forEach((button, index) => {
            const answerText = currentQuestionData.shuffledAnswers[index];
            const newButton = button.cloneNode(true); // Clone to remove listeners

            newButton.textContent = answerText;
            newButton.dataset.answerValue = answerText; // Store the actual answer value
            newButton.classList.remove('selected'); // Ensure clone is not selected

            // Replace the old button with the new one in the DOM
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            } else {
                 console.error("Button parent node not found during replacement.");
            }


            // Add the click listener to the NEW button
            newButton.addEventListener('click', handleAnswerSelection);
        });
    } catch (error) {
        console.error("Error during button setup:", error);
        currentBug = null; // Reset state on error
        currentQuestionData = null;
        return; // Stop execution if button setup fails
    }


    // --- Show Popup ---
    console.log("Removing 'hidden' class to show popup."); // Log: About to show
    questionPopup.classList.remove('hidden');
    console.log("Popup should be visible. Hidden class present?", questionPopup.classList.contains('hidden')); // Log: Verify class removal
}

// --- Handle Answer Selection (Highlights Button) ---
function handleAnswerSelection(event) {
    // Get all buttons within this specific popup instance again
    const currentAnswerButtons = questionPopup.querySelectorAll('.answers .answer');
    currentAnswerButtons.forEach(btn => btn.classList.remove('selected'));

    selectedAnswerButton = event.target; // The button element that was clicked
    if (selectedAnswerButton) {
        selectedAnswerButton.classList.add('selected');
        console.log("Selected answer:", selectedAnswerButton.dataset.answerValue);
    }
}

// --- Handle Answer Confirmation (Checks Answer, Updates Game State) ---
function confirmAnswer() {
    console.log("confirmAnswer triggered."); // Log: Start confirm

    // 1. Check if an answer was selected
    if (!selectedAnswerButton) {
        alert('Please select an answer!');
        return;
    }

    // 2. Check if we have the necessary context (question data and bug)
    if (!currentQuestionData || !currentBug) {
        console.error("Missing question data or bug reference on confirm.");
        // Attempt to gracefully hide popup and reset if possible
        if(questionPopup) questionPopup.classList.add('hidden');
        currentBug = null;
        currentQuestionData = null;
        selectedAnswerButton = null;
        return;
    }

    const selectedValue = selectedAnswerButton.dataset.answerValue;
    const correctAnswer = currentQuestionData.correct;
    console.log(`Selected: ${selectedValue}, Correct: ${correctAnswer}`); // Log: Comparison

    // --- Process Answer ---
    if (selectedValue === correctAnswer) {
        // CORRECT
        console.log("Answer CORRECT");
        score += 10;
        if (scoreDisplay) scoreDisplay.textContent = score;

        // Remove the correctly answered bug
        currentBug.remove(); // Remove the specific bug div

    } else {
        // INCORRECT
        console.log("Answer INCORRECT");
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
        lives--;
        console.log("Lives left:", lives); // Update lives display later if needed

        // Check for game over BEFORE spawning new bugs
        if (lives <= 0) {
            gameOver("You ran out of lives!");
            // Don't hide popup or reset state yet, gameOver handles it
            return;
        } else {
            // Spawn two new bugs because the answer was wrong
            console.log("Spawning 2 bugs due to incorrect answer.");
            spawnBug();
            spawnBug();
            // The incorrect bug (currentBug) remains on the screen
        }
    }

    // --- Cleanup and Hide Popup (if game didn't end) ---
    console.log("Hiding popup and resetting state."); // Log: Cleanup
    if(questionPopup) questionPopup.classList.add('hidden');
    currentBug = null; // Reset reference (bug is gone or stays but is no longer 'active')
    currentQuestionData = null; // Reset question
    selectedAnswerButton = null; // Reset selection
}


// --- Start Game ---
function startGame() {
    console.log("Starting new game...");
    if (!gameContainer || !startNewGameButton || !timeDisplay || !scoreDisplay || !questionPopup) {
        console.error("Required elements not found. Cannot start game.");
        return;
    }

    const storedDifficulty = localStorage.getItem('selectedDifficulty');
    if (storedDifficulty && questions[storedDifficulty]) {
        selectedDifficulty = storedDifficulty;
    } else {
        console.warn(`Stored difficulty "${storedDifficulty}" invalid. Defaulting to easy.`);
        selectedDifficulty = 'easy';
        localStorage.setItem('selectedDifficulty', 'easy');
    }
    console.log("Difficulty set to:", selectedDifficulty);

    score = 0;
    lives = 3;
    if(scoreDisplay) scoreDisplay.textContent = score;
    if(gameContainer) gameContainer.innerHTML = ''; // Clear board
    if(questionPopup) questionPopup.classList.add('hidden'); // Ensure popup is hidden

    // --- Difficulty-based Timer ---
    let gameDuration;
    switch (selectedDifficulty) {
        case 'medium':      gameDuration = 150; break; // 2:30
        case 'hard':        gameDuration = 120; break; // 2:00
        case 'expert':      gameDuration = 90;  break; // 1:30
        case 'insane':      gameDuration = 60;  break; // 1:00
        case 'impossible':  gameDuration = 45;  break; // 0:45
        case 'easy':
        default:            gameDuration = 180; break; // 3:00
    }
    console.log(`Game duration set to: ${gameDuration} seconds`);

    // Spawn initial bugs
    const initialBugCount = 5;
    for (let i = 0; i < initialBugCount; i++) {
        spawnBug();
    }

    startTimer(gameDuration, timeDisplay);
    if(startNewGameButton) startNewGameButton.disabled = true;
}

// --- Game Over ---
function gameOver(message) {
    console.log("Game Over:", message);
    if (timerInterval) clearInterval(timerInterval);

    alert(`Game Over!\n${message}\nFinal Score: ${score}`);

    if(startNewGameButton) startNewGameButton.disabled = false;
    if(gameContainer) gameContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #f0e68c; font-size: 1.5em; font-family: 'Press Start 2P', cursive; text-shadow: 2px 2px #000;">Game Over!</p>`;
    // Ensure popup is hidden on game over
    if(questionPopup) questionPopup.classList.add('hidden');
    // Reset potentially active question state just in case
    currentBug = null;
    currentQuestionData = null;
    selectedAnswerButton = null;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Setting up listeners..."); // Log: DOM ready

    // Select elements needed for listeners *after* DOM is ready
    const localStartButton = document.getElementById('start-new-game');
    const localSoundButton = document.getElementById('sound-button');
    const localConfirmButton = document.getElementById('confirm-answer');
    const playButtonIndex = document.getElementById('play-button'); // For index.html

    // Select display elements (ensure they are selected here for initial setup)
    const localTimeDisplay = document.getElementById('time');
    const localScoreDisplay = document.getElementById('score');
    const localQuestionPopup = document.getElementById('question-popup'); // Re-select for clarity

    // Log element selection results
    console.log({localStartButton, localSoundButton, localConfirmButton, playButtonIndex, localTimeDisplay, localScoreDisplay, localQuestionPopup});


    // --- Page Specific Logic ---
    if (window.location.pathname.includes('gamePlace.html')) {
        console.log("On gamePlace.html - Initial Setup");

        // --- Set Initial Timer Display Based on Difficulty ---
        let initialDifficulty = localStorage.getItem('selectedDifficulty') || 'easy';
        // Validate difficulty (optional but good practice)
        if (!questions[initialDifficulty]) {
            console.warn(`Invalid difficulty '${initialDifficulty}' found in localStorage. Defaulting to easy.`);
            initialDifficulty = 'easy';
            localStorage.setItem('selectedDifficulty', initialDifficulty); // Correct localStorage if invalid
        }

        let initialDuration;
        switch (initialDifficulty) {
            case 'medium':      initialDuration = 150; break;
            case 'hard':        initialDuration = 120; break;
            case 'expert':      initialDuration = 90;  break;
            case 'insane':      initialDuration = 60;  break;
            case 'impossible':  initialDuration = 45;  break;
            case 'easy':
            default:            initialDuration = 180; break;
        }
        console.log(`Initial difficulty from localStorage: ${initialDifficulty}, Initial duration: ${initialDuration}`);

        // Update the time display element if it exists
        if (localTimeDisplay) {
            const initialMinutes = Math.floor(initialDuration / 60);
            const initialSeconds = initialDuration % 60;
            const timeString = `${initialMinutes}:${initialSeconds < 10 ? '0' : ''}${initialSeconds}`;
            localTimeDisplay.textContent = timeString;
            console.log(`Initial time display set to: ${timeString}`);
            // Also update the global timeLeft variable to match the initial display
            timeLeft = initialDuration;
        } else {
            console.error("Time display element (#time) not found during initial setup!");
        }
        // --- End Initial Timer Display Setup ---


        // Setup other initial displays and states for game page
        if (localScoreDisplay) {
             localScoreDisplay.textContent = score; // Show initial score (0)
        } else {
             console.error("Score display element (#score) not found!");
        }

        if (localQuestionPopup) {
             localQuestionPopup.classList.add('hidden'); // Ensure popup is hidden initially
        } else {
             console.error("Question popup element not found during initial setup!");
        }

        // Add listeners for game page buttons
        if (localStartButton) {
            localStartButton.addEventListener('click', startGame);
            localStartButton.disabled = false; // Ensure start button is enabled initially
        } else {
            console.error("Start New Game button not found on gamePlace.html.");
        }
        if (localConfirmButton) {
            localConfirmButton.addEventListener('click', confirmAnswer);
        } else {
             console.error("Confirm Answer button not found on gamePlace.html.");
        }


    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
         console.log("On index.html or root");
        // We are on the main menu page
        if (playButtonIndex) {
            playButtonIndex.addEventListener('click', () => {
                window.location.href = 'levels.html';
            });
        } else {
             console.error("Play button (#play-button) not found on index.html.");
        }
    } else if (window.location.pathname.includes('levels.html')) {
         console.log("On levels.html");
         // Logic specific to levels page (mostly handled by inline script)
    }


    // --- Global Elements (like sound button if it exists on multiple pages) ---
    if (localSoundButton) {
        localSoundButton.addEventListener('click', () => {
            alert('Sound toggle clicked! (Functionality not implemented yet)');
        });
    }

    console.log("Initial setup complete."); // Log: End of setup
});
