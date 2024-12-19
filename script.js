const TIME_LIMIT = 60; // Time limit in seconds
let timeLeft = TIME_LIMIT;
let timer = null;
let totalErrors = 0;
let errors = 0;
let accuracy = 0;
let characterTyped = 0;
let currentQuote = "";
let quoteNo = 0;

// Array of quotes for the test
const quotesArray = [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
    "Stay hungry, stay foolish.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold."
];

// Selecting required elements
const quoteDisplay = document.getElementById('quote-display');
const quoteInput = document.getElementById('quote-input');
const timerText = document.getElementById('timer');
const wpmText = document.getElementById('wpm');
const accuracyText = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');

// Function to update the quote
function updateQuote() {
    quoteDisplay.textContent = null;
    currentQuote = quotesArray[quoteNo];

    // Separate each character and make a span for styling
    currentQuote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        quoteDisplay.appendChild(charSpan);
    });

    // Reset input area
    quoteInput.value = null;
}

// Function to process current text
function processCurrentText() {
    let typedText = quoteInput.value;
    characterTyped++;

    errors = 0;

    let quoteSpanArray = quoteDisplay.querySelectorAll('span');
    let typedTextArray = typedText.split('');

    quoteSpanArray.forEach((char, index) => {
        let typedChar = typedTextArray[index];

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

    // Update errors
    totalErrors = errors;

    // Update accuracy
    let correctCharacters = characterTyped - totalErrors;
    let accuracyVal = (correctCharacters / characterTyped) * 100;
    accuracyText.textContent = Math.round(accuracyVal);

    // If current text is completely typed, move to next quote
    if (typedText.length === currentQuote.length) {
        updateQuote();
        quoteNo = (quoteNo + 1) % quotesArray.length;
        quoteInput.value = '';
    }
}

// Function to start the timer
function startTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerText.textContent = timeLeft;
    } else {
        finishTest();
    }
}

// Function to finish the test
function finishTest() {
    clearInterval(timer);
    quoteInput.disabled = true;
    restartBtn.style.display = 'block';

    let wpm = Math.round(((characterTyped / 5) / TIME_LIMIT) * 60);
    wpmText.textContent = wpm;
}

// Event listeners
quoteInput.addEventListener('input', () => {
    if (!timer) {
        timer = setInterval(startTimer, 1000);
    }
    processCurrentText();
});

restartBtn.addEventListener('click', () => {
    resetValues();
    updateQuote();
    clearInterval(timer);
    timer = null;
    quoteInput.disabled = false;
    quoteInput.focus();
    restartBtn.style.display = 'none';
});

// Function to reset all values
function resetValues() {
    timeLeft = TIME_LIMIT;
    errors = 0;
    totalErrors = 0;
    accuracy = 100;
    characterTyped = 0;
    quoteNo = 0;
    timerText.textContent = timeLeft;
    accuracyText.textContent = accuracy;
    wpmText.textContent = 0;
    quoteInput.value = '';
    quoteDisplay.textContent = '';
}

// Initialize the test
window.onload = () => {
    resetValues();
    updateQuote();
    restartBtn.style.display = 'none';
}