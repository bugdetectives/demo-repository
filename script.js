document.getElementById('play-button').addEventListener('click', () => {
    window.location.href = 'levels.html'; // Navigate to the levels page
    startTimer(180, 'timer'); // Start a 3-minute timer
});

document.getElementById('start-game-button').addEventListener('click', () => {
    window.location.href = 'gamePlace.html';
});

const bugContainer = document.getElementById("bug-container");
        const questionContainer = document.getElementById("question-container");
        const scoreDisplay = document.getElementById("score");
        const timerDisplay = document.getElementById("timer");
        let score = 0;
        let timeLeft = 60;

document.getElementById('settings-button').addEventListener('click', () => {
    alert('Settings menu opened!');
    // ...future code...
});

document.getElementById('sound-button').addEventListener('click', () => {
    alert('Sound toggled!');
    // ...future code...
});

document.querySelectorAll('.level').forEach(level => {
    level.addEventListener('click', () => {
        document.querySelectorAll('.level').forEach(l => l.classList.remove('selected'));
        level.classList.add('selected');
    });
});

// Example arrays of questions categorized by difficulty
const questions = {
    easy: [
        {
            question: "What is 2 + 2?",
            answers: ["4", "3", "5", "6"],
            correct: "4"
        },
        {
            question: "What is the capital of France?",
            answers: ["Paris", "London", "Berlin", "Madrid"],
            correct: "Paris"
        },
        {
            question: "What color is the sky?",
            answers: ["Blue", "Green", "Red", "Yellow"],
            correct: "Blue"
        }
    ],
    medium: [
        {
            question: "What does 'var' declare in JavaScript?",
            answers: ["Variable", "Function", "Class", "Array"],
            correct: "Variable"
        },
        {
            question: "What is the output of 'console.log(typeof null)'?",
            answers: ["object", "null", "undefined", "string"],
            correct: "object"
        },
        {
            question: "Which HTML tag is used to include JavaScript?",
            answers: ["<script>", "<js>", "<javascript>", "<code>"],
            correct: "<script>"
        }
    ],
    hard: [
        {
            question: "What is the time complexity of binary search?",
            answers: ["O(log n)", "O(n)", "O(n^2)", "O(1)"],
            correct: "O(log n)"
        },
        {
            question: "What is the purpose of closures in JavaScript?",
            answers: [
                "To encapsulate variables",
                "To create classes",
                "To define global variables",
                "To optimize loops"
            ],
            correct: "To encapsulate variables"
        },
        {
            question: "What is the difference between '==' and '===' in JavaScript?",
            answers: [
                "'==' checks value, '===' checks value and type",
                "Both are identical",
                "'==' checks type, '===' checks value",
                "None of the above"
            ],
            correct: "'==' checks value, '===' checks value and type"
        }
    ]
};

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to get a randomized question by difficulty
function getRandomQuestion(difficulty) {
    const questionSet = questions[difficulty];
    const randomIndex = Math.floor(Math.random() * questionSet.length);
    const question = questionSet[randomIndex];
    shuffleArray(question.answers); // Randomize the answers
    return question;
}

// Function to start a timer
function startTimer(duration, displayElementId) {
    let timer = duration;
    const displayElement = document.getElementById(displayElementId);

    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        displayElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timer <= 0) {
            clearInterval(interval);
            alert('Time is up!');
        }

        timer--;
    }, 1000);
}

// Example usage
const randomEasyQuestion = getRandomQuestion("easy");
console.log("Easy Question:", randomEasyQuestion.question);
console.log("Answers:", randomEasyQuestion.answers);

const randomMediumQuestion = getRandomQuestion("medium");
console.log("Medium Question:", randomMediumQuestion.question);
console.log("Answers:", randomMediumQuestion.answers);

const randomHardQuestion = getRandomQuestion("hard");
console.log("Hard Question:", randomHardQuestion.question);
console.log("Answers:", randomHardQuestion.answers);
