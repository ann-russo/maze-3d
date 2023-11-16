/**
 * UIManager is responsible for elements management,
 * such as health indicators, sound buttons, win/lose messages, etc.
 */
const soundButton = document.getElementById('soundButton');
let isSoundOn = false;
let heartElements = [];

/**
 * Toggles the game sound on and off, updates the button text and style.
 * Plays start voice and theme song when sound is turned on.
 */
soundButton.addEventListener('click', function() {
    if (!isSoundOn) {
        playStartVoice();
        playThemeSong();

        soundButton.innerHTML = 'Sound Off';
        soundButton.style.backgroundColor = 'red';
        theme_sound.muted = false;
        isSoundOn = true;
    } else {
        theme_sound.muted = true;
        start_voice.muted = true;

        soundButton.innerHTML = 'Sound On';
        soundButton.style.backgroundColor = '#4CAF50';
        isSoundOn = false;
    }
});

/**
 * Creates and displays heart elements for the health indicator.
 * @param {number} health - The number of health points to display.
 */
function createHearts(health) {
    for (let i = 0; i < health; i++) {
        let heart = document.createElement('img');
        heart.src = 'res/heart.png';
        heart.style.width = '30px';
        heart.style.height = '30px';
        heart.style.position = 'absolute';
        heart.style.top = '10px';
        heart.style.right = (i * 40 + 10) + 'px';
        document.body.appendChild(heart);
        heartElements.push(heart);
    }
}

/**
 * Updates the display of heart elements based on the player's current health.
 * Assumes heartElements array is in sync with the player's health.
 */
const updateHearts = () => {
    for (let i = 0; i < heartElements.length; i++) {
        if (i < gameObject.player.health) {
            heartElements[i].style.display = 'block';
        } else {
            heartElements[i].style.display = 'none';
        }
    }
};

/**
 * Toggles the visibility of the win message.
 * @param {boolean} isVisible - Whether the message should be visible.
 */
function toggleWinMessage(isVisible) {
    const winQuote = document.getElementById('winQuote');
    winQuote.style.display = isVisible ? 'block' : 'none';
}

/**
 * Toggles the visibility of the lose message.
 * @param {boolean} isVisible - Whether the message should be visible.
 */
function toggleLoseMessage(isVisible) {
    const loseQuote = document.getElementById('loseQuote');
    loseQuote.style.display = isVisible ? 'block' : 'none';
}

/**
 * Initializes the UI elements of the game.
 * This function should be called at the start of the game to set up the UI.
 */
function initializeUI() {
    // Any initial UI setup can go here
}