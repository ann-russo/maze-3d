/**
 * UIManager is responsible for elements management,
 * such as health indicators, sound buttons, win/lose messages, etc.
 */
const soundButton = document.getElementById('soundButton');
const restartButton = document.getElementById('restartButton');
const controlsButton = document.getElementById('controlsButton');
const controlsDescription = document.getElementById('controls');

let isSoundOn = false;
let heartElements = [];

/**
 * Toggles the game controls description div when the controlsButton is clicked.
 */
controlsButton.addEventListener('click', function(event) {
    controlsDescription.style.display = controlsDescription.style.display === 'block' ? 'none' : 'block';
    event.stopPropagation(); // Prevent click from immediately propagating to document
});

/**
 * Hides the game controls description div when clicking anywhere on the screen.
 */
document.addEventListener('click', function(event) {
    if (controlsDescription.style.display === 'block') {
        controlsDescription.style.display = 'none';
    }
});

/**
 * Toggles the game sound on and off, updates the button text and style.
 * Plays start voice and theme song when sound is turned on.
 */
soundButton.addEventListener('click', function() {
    const buttonText = document.getElementById('buttonText');
    const buttonIcon = document.getElementById('buttonIcon');
    if (!isSoundOn) {
        playStartVoice();
        playThemeSong();

        buttonText.textContent = 'Sound Off';
        soundButton.style.backgroundColor = 'red';
        buttonIcon.src = 'res/icons/icons8-mute-50.png';

        theme_sound.muted = false;
        isSoundOn = true;
    } else {
        theme_sound.muted = true;
        start_voice.muted = true;

        buttonText.innerHTML = 'Sound On';
        soundButton.style.backgroundColor = '#4CAF50';
        buttonIcon.src = 'res/icons/icons8-sound-50-2.png';
        isSoundOn = false;
    }
});

/**
 * Resets all sounds, UI elements, values, and the game when the Restart Game button is clicked.
 */
restartButton.addEventListener('click', function() {
    resetSoundButton()
    toggleRestartButton(false)
    toggleLoseMessage(false)
    toggleWinMessage(false)
    stopAllSounds()
    resetValues()
    resetGame()
});

/**
 * Resets the appearance of the Sound button to its default state.
 */
function resetSoundButton() {
    const buttonText = document.getElementById('buttonText');
    const buttonIcon = document.getElementById('buttonIcon');
    buttonText.innerHTML = 'Sound On';
    soundButton.style.backgroundColor = '#4CAF50';
    buttonIcon.src = 'res/icons/icons8-sound-50-2.png';
    isSoundOn = false;
}

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
    const winImage = document.getElementById('winImage');
    winImage.style.display = isVisible ? 'block' : 'none';
}

/**
 * Toggles the visibility of the lose message.
 * @param {boolean} isVisible - Whether the message should be visible.
 */
function toggleLoseMessage(isVisible) {
    const loseImage = document.getElementById('loseImage');
    loseImage.style.display = isVisible ? 'block' : 'none';
}

function toggleRestartButton(isVisible) {
    restartButton.style.display = isVisible ? 'block' : 'none';
}

/**
 * Initializes the UI elements of the game.
 * This function should be called at the start of the game to set up the UI.
 */
function initializeUI() {
    // Any initial UI setup can go here
}