// script.js

// Selecting required elements
const testWrapper = document.getElementById('test-wrapper');
const testArea = document.getElementById('test-area');
const wordDisplay = document.getElementById('word-display');
const resetButton = document.getElementById('reset');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const feedbackElement = document.getElementById('feedback');

let timer = [0, 0]; // [minutes, seconds]
let interval;
let timerRunning = false;
let totalErrors = 0;
let errors = 0;
let characterTyped = 0;
let currentWords = [];
let totalWords = 20; // number of words in the test

// Function to fetch and display random words from the API
async function generateWords() {
    try {
        wordDisplay.textContent = '';
        currentWords = [];

        // Fetch random words from the API
        const response = await fetch(`https://random-word-api.vercel.app/api?words=${totalWords}`);
        const data = await response.json();

        currentWords = data;

        // Combine words into a string
        const wordsString = currentWords.join(' ');

        // Split wordsString into characters and create span elements
        wordsString.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            wordDisplay.appendChild(charSpan);
        });
    } catch (error) {
        console.error('Error fetching words:', error);
        wordDisplay.innerText = 'Failed to load words. Please check your internet connection and try again.';
    }
}

// Function to start the timer
function startTimer() {
    if (timerRunning === false && testArea.value.length > 0) {
        timerRunning = true;
        interval = setInterval(runTimer, 1000);
    }
}

// Function to run the timer
function runTimer() {
    timer[1]++;
    if (timer[1] == 60) {
        timer[0]++;
        timer[1] = 0;
    }

    // Update timer display
    let minutes = (timer[0] < 10) ? '0' + timer[0] : timer[0];
    let seconds = (timer[1] < 10) ? '0' + timer[1] : timer[1];
    timerElement.innerText = `${minutes}:${seconds}`;
}

// Function to spell check the text entered
function spellCheck() {
    const textEntered = testArea.value;
    characterTyped = textEntered.length;

    errors = 0;

    let wordChars = wordDisplay.querySelectorAll('span');
    let textEnteredArray = textEntered.split('');

    // Loop through each character and compare
    wordChars.forEach((char, index) => {
        let typedChar = textEnteredArray[index];

        if (typedChar == null) {
            char.classList.remove('correct', 'incorrect');
        } else if (typedChar === char.innerText) {
            char.classList.add('correct');
            char.classList.remove('incorrect');
        } else {
            char.classList.add('incorrect');
            char.classList.remove('correct');
            errors++;
        }
    });

    // Update error count
    totalErrors = errors;

    // If text is complete
    if (textEntered.length === wordDisplay.textContent.length) {
        clearInterval(interval);
        testArea.disabled = true;
        calculateResults();
    }
}

// Function to calculate WPM and accuracy
function calculateResults() {
    // Calculating gross WPM
    let timeSpent = timer[0] * 60 + timer[1]; // in seconds
    let wpm = Math.round(((characterTyped / 5) / (timeSpent / 60)) || 0);

    // Calculating accuracy
    let accuracy = Math.round(((characterTyped - totalErrors) / characterTyped) * 100) || 100;

    // Display results
    wpmElement.innerText = wpm;
    accuracyElement.innerText = accuracy;

    // Provide feedback
    feedbackElement.innerHTML = `<p>Your typing speed is <strong>${wpm} WPM</strong> with an accuracy of <strong>${accuracy}%</strong>.</p>`;
    if (accuracy < 80) {
        feedbackElement.innerHTML += `<p>Focus on improving your accuracy.</p>`;
    } else {
        feedbackElement.innerHTML += `<p>Great job! Keep practicing to improve your speed further.</p>`;
    }
}

// Function to reset the test
function resetTest() {
    clearInterval(interval);
    timer = [0, 0];
    timerRunning = false;
    testArea.disabled = false;
    testArea.value = '';
    wordDisplay.textContent = '';
    timerElement.innerText = '00:00';
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100';
    feedbackElement.innerHTML = '';
    totalErrors = 0;
    errors = 0;
    characterTyped = 0;
    generateWords();
}

// Event listeners
testArea.addEventListener('keydown', startTimer);
testArea.addEventListener('input', spellCheck);
resetButton.addEventListener('click', resetTest);

// Initialize the test on page load
window.onload = resetTest;