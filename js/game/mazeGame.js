// Global scale for the game elements.
const SCALE = new THREE.Vector3(1, 1, 1);

// Flags to track game state.
let gameWon = false;
let collisionCounter = 0;
let entranceCounter = 0;

/**
 * Represents the main game.
 * @param {Object} args - Configuration arguments for the game.
 */
const Game = function (args) {
    // Controllers for the game.
    this.controllers = [];

    // Set the scale if provided in arguments.
    if (args.scale) {
        SCALE.copy(args.scale);
    }

    // Initialize hacks mode based on arguments.
    this.hacks = !!args.hacks || false;

    // Initialize assets and UI.
    Asset.init();
    initializeUI();

    // Initialize game properties.
    this.maze = null
    this.xrControls = null
    this.MOVESPEED = null

    // Initialize the game with provided arguments.
    initGame(this, args, scene, Asset);
    initAmbientLight(scene);
    initSkyAndMoonLight(scene);

    // Initialize the player and hearts representing the health.
    this.player = new Player(camera,  initPlayerLight(SCALE), scene, this.maze);
    createHearts(this.player.health);
};

/**
 * Initializes XR (Extended Reality) settings after XR is available.
 */
Game.prototype.postXRInit = function() {
    // Bind the 'f' key for fullscreen toggle.
    THREEx.FullScreen.bindKey({ charCode: 'f'.charCodeAt(0) });

    // Initialize and acquire pointer lock for better control.
    const pointerLockControl = new PointerLock({sensitivity: 0.002});
    if (requestPointerLock(pointerLockControl)) {
        console.info("PointerLock acquired successfully.")
    }

    // Initialize XR controls if WebXR is present.
    if (WEBXR_PRESENT) {
        this.xrControls.init();
    }
};

/**
 * Handles changes in XR session state.
 * @param {string} sessionType - The type of XR session change.
 */
Game.prototype.onXRSessionChange = function(sessionType) {
    console.info(sessionType);

    // Adjust player's ground level based on XR session state.
    if (sessionType === "sessionStarted") {
        this.player.position.y = (-1 / 2 + 0.08) * SCALE.y;
    } else if (sessionType === "sessionEnded") {
        this.player.position.y = 0;
    }
};

/**
 * Checks if the player collides with any object in the game.
 * @param {THREE.Vector3} dir - The direction of the player's movement.
 * @param {number} amount - The amount of movement.
 * @returns {boolean} - True if collision occurs, false otherwise.
 */
Game.prototype.playerCollides = function(dir, amount) {

    // Callback for handling collision.
    const onCollision = () => {
        if (collide_sound.ended || collisionCounter === 0) {
            collisionCounter++;
            this.player.health--;

            if (this.player.health > 0) {
                playCollisionSound();
            } else {
                playLoseSound();
                toggleLoseMessage(true);
                toggleRestartButton(true);
                this.player.position.set(-20000, -20000, -20000);
            }
            updateHearts();
        }
    };

    // Callback for winning condition.
    const onWin = () => {
        if (!gameWon && this.player.checkPlayerPosition().isAtTarget) {
            gameWon = true;
            playSuccessSound();
            toggleWinMessage(true);
            toggleRestartButton(true);
        }
    };

    // Callback for entrance condition.
    const onEntrance = () => {
        if (this.player.checkPlayerPosition().isAtEntrance) {
            if (entranceCounter > 0 && entranceCounter < 3) {
                playEntranceSound()
            }
            entranceCounter++;
        }
    };

    // Check for collision and handle accordingly.
    return this.player.checkCollision(dir, amount, this.maze.getWalls(), onCollision, onWin, onEntrance);
};

/**
 * Main update function for the game loop. It updates the game state based on the time delta.
 * @param {number} delta - The time delta since the last update, used for frame-independent movement.
 */
Game.prototype.update = function(delta) {
    let MoveSpeed = this.MOVESPEED * delta;
    const KeyRotateSpeed = 1.4 * delta;

    MoveSpeed = this.handleDebugHacks(MoveSpeed);
    this.handlePlayerRotation(KeyRotateSpeed);
    this.handlePlayerMovement(MoveSpeed);

    this.player.update();
    this.xrControls.update(delta);
    InputManager.update();
};

/**
 * Handles the activation and effects of debug hacks.
 * @param {number} MoveSpeed - The current movement speed of the player.
 * @returns {number} - The modified movement speed.
 */
Game.prototype.handleDebugHacks = function(MoveSpeed) {
    if (InputManager.isKeyPressed(113 /*f2*/)) {
        this.hacks ^= true;
    }

    if (this.hacks) {
        if (InputManager.isKeyDown(16 /*shift*/)) {
            MoveSpeed *= 4; // Go faster!
        }

        if (InputManager.isKeyDown(32 /*space*/)) {
            this.player.position.y += MoveSpeed; // Go up
        } else if (InputManager.isKeyDown(17 /*ctrl*/)) {
            this.player.position.y -= MoveSpeed; // Go down
        }
    } else {
        if (InputManager.isKeyDown(16 /*shift*/)) {
            MoveSpeed *= 1.7; // Go faster!
        }
    }

    return MoveSpeed;
};

/**
 * Handles the rotation of the player based on input.
 * @param {number} KeyRotateSpeed - The speed at which the player rotates.
 */
Game.prototype.handlePlayerRotation = function(KeyRotateSpeed) {
    if (InputManager.isKeyDown(81 /*q*/)) {
        this.player.theta += KeyRotateSpeed; // turn left
    } else if (InputManager.isKeyDown(69 /*e*/)) {
        this.player.theta -= KeyRotateSpeed; // turn right
    }

    this.player.theta = rotclamp(this.player.theta);
};

/**
 * Handles the movement of the player based on input.
 * @param {number} MoveSpeed - The current movement speed of the player.
 */
Game.prototype.handlePlayerMovement = function(MoveSpeed) {
    const cTheta = Math.cos(this.player.theta);
    const sTheta = Math.sin(this.player.theta);
    const dir = new THREE.Vector3(-1.0 * sTheta, 0, -1.0 * cTheta);

    this.movePlayer(dir, MoveSpeed);
};

/**
 * Handles the player's movement based on keyboard input.
 * @param {THREE.Vector3} dir - The direction vector for the player's movement.
 * @param {number} MoveSpeed - The speed at which the player moves.
 */
Game.prototype.movePlayer = function(dir, MoveSpeed) {
    // Calculate the cross product for lateral movement
    const xProd = new THREE.Vector3();
    xProd.crossVectors(dir, new THREE.Vector3(0, 1.0, 0));

    // Forward and backward movement
    if (InputManager.isKeyDown(87 /* w */) && !this.playerCollides(dir, MoveSpeed) && this.player.health > 0) {
        // Move forward
        this.player.position.x += dir.x * MoveSpeed;
        this.player.position.z += dir.z * MoveSpeed;
        playWalkingSound(MoveSpeed);
    } else if (InputManager.isKeyDown(83 /* s */) && !this.playerCollides(new THREE.Vector3(-dir.x, -dir.y, -dir.z), MoveSpeed) && this.player.health > 0) {
        // Move backward
        this.player.position.x -= dir.x * MoveSpeed;
        this.player.position.z -= dir.z * MoveSpeed;
        playWalkingSound(MoveSpeed);
    }

    // Left and right movement
    if (InputManager.isKeyDown(65 /* a */) && !this.playerCollides(new THREE.Vector3(-xProd.x, -xProd.y, -xProd.z), MoveSpeed) && this.player.health > 0) {
        // Move left
        this.player.position.x -= xProd.x * MoveSpeed;
        this.player.position.z -= xProd.z * MoveSpeed;
        playWalkingSound(MoveSpeed);
    } else if (InputManager.isKeyDown(68 /* d */) && !this.playerCollides(xProd, MoveSpeed) && this.player.health > 0) {
        // Move right
        this.player.position.x += xProd.x * MoveSpeed;
        this.player.position.z += xProd.z * MoveSpeed;
        playWalkingSound(MoveSpeed);
    }
};

Game.prototype.mustRender = function() {
    return true;
};

function resetValues() {
    gameWon = false;
    collisionCounter = 0;
    entranceCounter = 0;
}