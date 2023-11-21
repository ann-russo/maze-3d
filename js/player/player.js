/**
 * Represents the player in the game, managing properties, movements, and interactions.
 */
class Player {
    /**
     * Constructs a Player instance.
     * @param {THREE.Camera} camera - The camera representing the player's view.
     * @param {PointLight} light - The light source attached to the player.
     * @param {THREE.Scene} scene - The scene to which the player belongs.
     * @param {Maze} maze - The maze in which the player navigates.
     */
    constructor(camera, light, scene, maze) {
        this.camera = camera;
        this.light = light;
        this.scene = scene;
        this.maze = maze;
        this.position = new THREE.Vector3(-1.5, 0.1, 1).multiply(SCALE);
        this.theta = Math.PI * 1.5; // Initial orientation angle
        this.phi = 0; // Initial vertical angle
        this.health = 3; // Player's health
        this.dolly = new THREE.Group(); // Group for moving the player and camera

        this.init();
    }

    /**
     * Initializes the player by setting up the camera, light, and dolly.
     */
    init() {
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();

        this.dolly.add(this.light);
        this.dolly.rotation.order = "ZYX";
        this.dolly.add(this.camera);
        this.scene.add(this.dolly);

        this.update();
    }

    /**
     * Updates the player's position and orientation.
     */
    update() {
        this.dolly.position.copy(this.position);
        this.dolly.rotation.y = this.theta;
        this.dolly.rotation.x = this.phi;
    }

    /**
     * Checks the player's position relative to the target and entrance.
     * @returns {Object} An object containing boolean values indicating if the player is at the target or entrance.
     */
    checkPlayerPosition = function() {
        const targetPosition = new THREE.Vector3(this.maze.width * 2 - 1, 0, this.maze.height * 2);
        const playerPosition = this.position.clone();
        playerPosition.y = 0;

        const distanceToTarget = playerPosition.distanceTo(targetPosition);
        const distanceToEntrance = playerPosition.distanceTo(new THREE.Vector3(0, 0, 0));

        return {
            isAtTarget: distanceToTarget < 1.0,
            isAtEntrance: distanceToEntrance < 1.0
        };
    };

    /**
     * Checks for collisions with the maze walls.
     * @param {Vector3} dir - The direction of movement.
     * @param {number} amount - The amount of movement.
     * @param {THREE.Object3D[]} walls - The walls of the maze.
     * @param {Function} onCollision - Callback function for collision handling.
     * @param {Function} onWin - Callback function for winning condition.
     * @param {Function} onEntrance - Callback function for entrance condition.
     * @returns {boolean} True if a collision occurs, otherwise false.
     */
    checkCollision(dir, amount, walls, onCollision, onWin, onEntrance) {
        const ray = new THREE.Raycaster(this.position, dir, 0, amount + 0.14);
        const colliders = ray.intersectObjects(walls, false);

        if (colliders.length > 0 && colliders[0].distance - 0.5 < amount) {
            onCollision();
            return true;
        }

        onWin();
        onEntrance();

        return false;
    }
}