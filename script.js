document.getElementById('play-button').addEventListener('click', () => {
    window.location.href = 'levels.html';
});

let selectedLevel = null;

document.querySelectorAll('.level').forEach(level => {
    level.addEventListener('click', () => {
        // Deselect previously selected level
        document.querySelectorAll('.level').forEach(l => l.classList.remove('selected'));
        
        // Mark the clicked level as selected
        level.classList.add('selected');
        selectedLevel = level.dataset.level;

        // Enable the "Start Game" button
        const startButton = document.getElementById('start-game-button');
        startButton.disabled = false;
    });
});

document.getElementById('start-game-button').addEventListener('click', () => {
    if (selectedLevel === 'easy') {
        window.location.href = 'gamePlace.html';
    } else {
        alert('This level is not available yet!');
    }
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
