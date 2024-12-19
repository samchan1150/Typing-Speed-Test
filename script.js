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

let timer = [0, 0, 0]; // [minutes, seconds, hundredths]
let interval;
let timerRunning = false;
let totalErrors = 0;
let characterTyped = 0;
let currentWords = [];
let totalWords = 20; // Number of words in the test
let wordIndex = 0; // Index of the current word
let correctWords = 0;

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

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 100); // Update every 0.1 seconds
    }
}

function runTimer() {
    timer[2] += 1; // Increment hundredths of a second

    if (timer[2] === 10) {
        timer[1]++;
        timer[2] = 0;
    }

    if (timer[1] === 60) {
        timer[0]++;
        timer[1] = 0;
    }

    // Format the timer values
    let minutes = (timer[0] < 10) ? '0' + timer[0] : timer[0];
    let seconds = (timer[1] < 10) ? '0' + timer[1] : timer[1];
    let hundredths = timer[2];

    // Display the running time
    timerElement.innerText = `${minutes}:${seconds}.${hundredths}`;

    // Process user input and update stats every tick
    processInput();
}

function processInput() {
    // Update character count excluding spaces
    characterTyped = testArea.value.replace(/\s+/g, '').length;

    // Update real-time statistics
    calculateRealtimeStats();
}


function calculateRealtimeStats() {
    let timeSpent = (timer[0] * 60) + timer[1] + (timer[2] / 10); // Total time in seconds
    let timeMinutes = timeSpent / 60;

    // Calculating WPM (only correct words)
    let netWPM = Math.round((correctWords / timeMinutes) || 0);

    // Calculating accuracy
    let accuracy = Math.round((correctWords / (wordIndex || 1)) * 100);

    // Display results
    wpmElement.innerText = netWPM;
    accuracyElement.innerText = accuracy;
}

function displayFinalResults() {
    // Provide feedback
    const wpm = wpmElement.innerText;
    const accuracy = accuracyElement.innerText;

    feedbackElement.innerHTML = `<p>Your typing speed is <strong>${wpm} WPM</strong> with an accuracy of <strong>${accuracy}%</strong>.</p>`;
    if (accuracy < 80) {
        feedbackElement.innerHTML += `<p>Focus on improving your accuracy.</p>`;
    } else {
        feedbackElement.innerHTML += `<p>Great job! Keep practicing to improve your speed further.</p>`;
    }
}

function resetTest() {
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0];
    timerRunning = false;
    totalErrors = 0;
    characterTyped = 0;
    correctWords = 0;
    wordIndex = 0; // Initialize wordIndex

    testArea.disabled = false;
    testArea.value = '';
    timerElement.innerText = '00:00.0';
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100%';
    feedbackElement.innerText = '';

    // Remove old word spans
    while (wordDisplay.firstChild) {
        wordDisplay.removeChild(wordDisplay.firstChild);
    }

    // Generate new words
    generateWords();
}

function handleSpace(event) {
    if (event.key === ' ') {

        // Start the timer on the first input
        if (!timerRunning) startTimer();

        // Get the current input up to this point
        const input = testArea.value.trim();

        // Split the input into words
        const inputWords = input.split(' ');

        // Get the last typed word
        const typedWord = inputWords[inputWords.length - 1];

        // Process the typed word
        processCurrentWord(typedWord);

        // Clear the input field for the next word if desired
        // Alternatively, keep the current input and let the user continue typing
    }
}

function processCurrentWord(typedWord) {
    const currentWordSpan = wordDisplay.childNodes[wordIndex];
    const currentWord = currentWords[wordIndex];

    if (currentWordSpan) {
        // Remove existing classes
        currentWordSpan.classList.remove('correct-word', 'incorrect-word', 'current-word');

        if (typedWord === currentWord) {
            currentWordSpan.classList.add('correct-word');
            correctWords++;
        } else {
            currentWordSpan.classList.add('incorrect-word');
            totalErrors++;
        }
    }

    // Move to the next word
    wordIndex++;

    // Highlight the new current word
    updateCurrentWordHighlight();

    // Check if test is complete
    if (wordIndex === currentWords.length) {
        // Stop the timer and disable input
        clearInterval(interval);
        testArea.disabled = true;
        displayFinalResults();
    }

    // Update real-time statistics
    calculateRealtimeStats();
}

function updateCurrentWordHighlight() {
    // Remove 'current-word' class from all words
    wordDisplay.childNodes.forEach(wordSpan => {
        wordSpan.classList.remove('current-word');
    });

    // Add 'current-word' class to the next word
    if (wordDisplay.childNodes[wordIndex]) {
        wordDisplay.childNodes[wordIndex].classList.add('current-word');
    }
}

// Event listeners
testArea.addEventListener('input', processInput);
resetButton.addEventListener('click', resetTest);
testArea.addEventListener('keydown', handleSpace);

// Initialize the test on page load
window.onload = resetTest;