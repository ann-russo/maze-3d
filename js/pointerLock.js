/**
 * Initializes and manages pointer lock controls for the game.
 * @param {object} args - Configuration options.
 */
const PointerLock = function (args) {
    this.sensitivity = args && args.sensitivity ? args.sensitivity : 0.002;
    this.pointerLockActive = false;

    // Handles mouse movement events
    const onMouseMove = function (event) {
        if (!this.pointerLockActive) return;

        const movementX = event.movementX || event.mozMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || 0;

        gameObject.player.theta -= movementX * this.sensitivity;
        gameObject.player.phi -= movementY * this.sensitivity;

        gameObject.player.phi = Math.constrainRadius(gameObject.player.phi, Math.TAU / 4);
    }.bind(this); // Bind this function to the current context

    document.addEventListener("mousemove", onMouseMove, false);
};

/**
 * Checks if the browser supports pointer lock.
 * @returns {boolean} True if supported, false otherwise.
 */
const hasBrowserPointerLock = function () {
    return 'pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document;
};

/**
 * Requests the pointer lock for the game.
 * @returns {boolean} True if request is successful, false otherwise.
 */
const requestPointerLock = function (pointerLockInstance) {
    const element = document.body;

    if (hasBrowserPointerLock()) {
        const pointerlockchange = function () {
            pointerLockInstance.pointerLockActive = document.pointerLockElement === element ||
                document.mozPointerLockElement === element ||
                document.webkitPointerLockElement === element;
        };

        const pointerlockerror = function (event) {
            console.warn("PointerLock error:", event);
            pointerLockInstance.pointerLockActive = false;
        };

        // Setting up event listeners for pointer lock changes and errors
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        element.addEventListener('click', function () {
            element.requestPointerLock = element.requestPointerLock ||
                element.mozRequestPointerLock ||
                element.webkitRequestPointerLock;
            element.requestPointerLock();
        }, false);

        return true;
    } else {
        console.warn("Browser does not support pointer lock.");
        return false;
    }
};

