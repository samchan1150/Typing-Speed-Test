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
const wordCountSelect = document.getElementById('word-count'); // Preset word count select
const customWordCountInput = document.getElementById('custom-word-count'); // Custom word count input

let timer = [0, 0, 0]; // [minutes, seconds, hundredths]
let interval;
let timerRunning = false;
let totalErrors = 0;
let characterTyped = 0;
let currentWords = [];
let totalWords = 20; // Initialize to default value
let correctWords = 0;
let inputWords = []; // Declare inputWords globally

async function generateWords() {
    try {
        wordDisplay.textContent = '';
        testArea.value = '';
        currentWords = [];
        correctWords = 0;
        totalErrors = 0;
        characterTyped = 0;
        inputWords = [];

        // Determine the total number of words
        let customWordCount = parseInt(customWordCountInput.value);
        if (customWordCount && customWordCount >= 1 && customWordCount <= 1000) {
            totalWords = customWordCount;
        } else {
            totalWords = parseInt(wordCountSelect.value);
        }

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
}

function processInput() {
    // Start the timer on the first input
    if (!timerRunning && testArea.value.length > 0) startTimer();

    // Get the current input
    let input = testArea.value;

    // Update character count excluding spaces
    characterTyped = input.replace(/\s+/g, '').length;

    // Split the input into words
    inputWords = input.trim().split(/\s+/);

    // Remove any empty strings from array (could happen if there are multiple spaces)
    inputWords = inputWords.filter(word => word.length > 0);

    // Initialize
    correctWords = 0;
    totalErrors = 0;

    // Remove existing classes from word spans
    wordDisplay.childNodes.forEach(wordSpan => {
        wordSpan.classList.remove('correct-word', 'incorrect-word', 'current-word');
    });

    // Iterate over the input words
    for (let i = 0; i < currentWords.length; i++) {
        let wordSpan = wordDisplay.childNodes[i];
        let currentWord = currentWords[i];

        if (inputWords[i] != null) {
            // Add 'current-word' class to the word being typed
            if (i === inputWords.length - 1 && !testArea.value.endsWith(' ')) {
                wordSpan.classList.add('current-word');
            }

            if (inputWords[i] === currentWord) {
                wordSpan.classList.add('correct-word');
                // Increment correctWords if:
                // - The word is followed by a space (word completed)
                // - It's not the last input word
                // - It's the last word, and all words have been typed
                if (
                    testArea.value.endsWith(' ') ||
                    i < inputWords.length - 1 ||
                    (i === currentWords.length - 1 && inputWords.length === currentWords.length)
                ) {
                    correctWords++;
                }
            } else {
                wordSpan.classList.add('incorrect-word');
                totalErrors++;
            }
        } else {
            // Word not typed yet
            break;
        }
    }

    // Handle the case when all words have been typed
    if (inputWords.length === currentWords.length) {
        // Check if the last word has been fully typed
        const lastWordTyped = inputWords[inputWords.length - 1];
        const lastWordTarget = currentWords[currentWords.length - 1];

        if (lastWordTyped === lastWordTarget) {
            // Test complete
            clearInterval(interval);
            testArea.disabled = true;
            calculateRealtimeStats();
            displayFinalResults();
        }
    }

    // Update real-time statistics
    calculateRealtimeStats();
}


function calculateRealtimeStats() {
    let timeSpent = (timer[0] * 60) + timer[1] + (timer[2] / 10); // Total time in seconds
    let timeMinutes = timeSpent / 60;

    // Calculating WPM (considering correct words)
    let netWPM = Math.round((correctWords / timeMinutes) || 0);

    // Calculating accuracy
    let totalTypedWords = inputWords.length;
    let accuracy = Math.round((correctWords / (totalTypedWords || 1)) * 100);

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
    inputWords = [];

    testArea.disabled = false;
    testArea.value = '';
    timerElement.innerText = '00:00.0';
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100';
    feedbackElement.innerText = '';

    // Remove old word spans
    while (wordDisplay.firstChild) {
        wordDisplay.removeChild(wordDisplay.firstChild);
    }

    // Generate new words
    generateWords();
}

// Event listeners
testArea.addEventListener('input', processInput);
resetButton.addEventListener('click', resetTest);

// Event listeners for settings changes
wordCountSelect.addEventListener('change', resetTest);
customWordCountInput.addEventListener('input', resetTest);

// Initialize the test on page load
window.onload = resetTest;