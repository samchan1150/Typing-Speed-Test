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
let characterTyped = 0;
let currentWords = [];
let totalWords = 20; // number of words in the test
let wordIndex = 0; // index of the current word
let correctWords = 0;

// Function to fetch and display random words from the API
async function generateWords() {
    try {
        wordDisplay.textContent = '';
        testArea.value = '';
        currentWords = [];
        wordIndex = 0;
        correctWords = 0;
        totalErrors = 0;
        characterTyped = 0;
        
        // Fetch random words from the API
        const response = await fetch(`https://random-word-api.vercel.app/api?words=${totalWords}`);
        const data = await response.json();

        currentWords = data;

        // Display words with each word wrapped in a span
        currentWords.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.innerText = word + ' '; // Add a space for separation
            wordDisplay.appendChild(wordSpan);
        });

        // Highlight the first word
        wordDisplay.childNodes[0].classList.add('current-word');
    } catch (error) {
        console.error('Error fetching words:', error);
        wordDisplay.innerText = 'Failed to load words. Please check your internet connection and try again.';
    }
}

// Function to start the timer
function startTimer() {
    if (timerRunning === false) {
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

// Function to handle input
function processInput(event) {
    // Start the timer on the first keypress
    startTimer();

    // Total characters typed
    characterTyped++;

    // Get the current word and user input
    const input = testArea.value.trim();
    const inputWords = input.split(' ');

    // Check if the last character is a space or if the user pressed Enter
    if (event.inputType === 'insertText' && (event.data === ' ' || event.data === null)) {
        // User pressed space or Enter, check the word
        checkWord(inputWords[inputWords.length - 1]);
    } else if (event.inputType === 'deleteContentBackward') {
        // Handle backspace
        if (testArea.value.slice(-1) === ' ') {
            // User deleted a space, move back to previous word
            if (wordIndex > 0) {
                wordIndex--;
                wordDisplay.childNodes[wordIndex].classList.remove('incorrect-word', 'correct-word');
                wordDisplay.childNodes[wordIndex].classList.add('current-word');
                wordDisplay.childNodes[wordIndex + 1].classList.remove('current-word');
            }
        }
    }
}

// Function to check the typed word
function checkWord(typedWord) {
    const currentWordSpan = wordDisplay.childNodes[wordIndex];
    const currentWord = currentWords[wordIndex];

    // Remove current-word highlight
    currentWordSpan.classList.remove('current-word');

    if (typedWord === currentWord) {
        currentWordSpan.classList.add('correct-word');
        correctWords++;
    } else {
        currentWordSpan.classList.add('incorrect-word');
        totalErrors++;
    }

    wordIndex++;

    if (wordIndex < currentWords.length) {
        // Highlight the next word
        wordDisplay.childNodes[wordIndex].classList.add('current-word');
    } else {
        // End the test
        clearInterval(interval);
        testArea.disabled = true;
        calculateResults();
    }

    // Clear the input field if not the last word
    if (wordIndex < currentWords.length) {
        testArea.value += ' ';
    }
}

// Function to calculate WPM and accuracy
function calculateResults() {
    // Calculating gross WPM
    let timeSpent = timer[0] * 60 + timer[1]; // in seconds
    let wpm = Math.round((characterTyped / 5) / (timeSpent / 60)) || 0;

    // Calculating accuracy
    let accuracy = Math.round((correctWords / currentWords.length) * 100) || 100;

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
    characterTyped = 0;
    currentWords = [];
    wordIndex = 0;
    correctWords = 0;
    generateWords();
}

// Event listeners
testArea.addEventListener('input', processInput);
resetButton.addEventListener('click', resetTest);

// Initialize the test on page load
window.onload = resetTest;