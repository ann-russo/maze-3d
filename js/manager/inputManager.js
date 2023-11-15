/**
 * InputManager handles keyboard inputs for the game.
 */
var InputManager = {
    keys: {},
    oldKeys: {},

    /**
     * Updates the state of keys.
     */
    update: function() {
        this.oldKeys = { ...this.keys };
    },

    /**
     * Handles key down events.
     * @param {number} code - The key code of the pressed key.
     */
    keyDown: function(code) {
        this.keys[code] = true;
    },

    /**
     * Handles key up events.
     * @param {number} code - The key code of the released key.
     */
    keyUp: function(code) {
        this.keys[code] = false;
    },

    /**
     * Checks if a key is currently pressed down.
     * @param {number} code - The key code to check.
     * @returns {boolean} True if the key is down, false otherwise.
     */
    isKeyDown: function(code) {
        return !!this.keys[code];
    },

    /**
     * Checks if a key was just pressed.
     * @param {number} code - The key code to check.
     * @returns {boolean} True if the key was just pressed, false otherwise.
     */
    isKeyPressed: function(code) {
        return !!this.keys[code] && !this.oldKeys[code];
    }
};

// Event listeners for key down and key up events
document.addEventListener('keydown', function(event) {
    InputManager.keyDown(event.keyCode);
});

document.addEventListener('keyup', function(event) {
    InputManager.keyUp(event.keyCode);
});