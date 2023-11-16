/**
 * XRControls handles the VR controller interactions in the game.
 * @param {Object} game - The game instance.
 * @param {Array} objectsToIntersectWith - Objects that the controller can interact with.
 */
function XRControls(game, objectsToIntersectWith) {
    this.game = game;
    this.activeControllers = [];
    this.geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    this.objectsToIntersectWith = objectsToIntersectWith;
    this.controllerToCheck = 0;
}

/**
 * Initializes the XR controllers.
 */
XRControls.prototype.init = function() {
    const controllerMesh = new THREE.Mesh(
        new THREE.CubeGeometry(0.04, 0.04, 0.08),
        new THREE.MeshBasicMaterial({wireframe: true})
    );

    const self = this;

    function setupControllerEvents(controller) {
        controller.addEventListener("connected", function() {
            self.handleControllerConnected(this, controllerMesh);
        });
        controller.addEventListener("disconnect", function() {
            self.handleControllerDisconnected(this);
        });
        controller.addEventListener("selectstart", function() {});
        controller.addEventListener("selectend", function() {
            self.attemptTeleport(this);
        });
    }

    for (let i = 0; i < 2; i++) {
        const controller = renderer.xr.getController(i);
        controller.raycaster = new THREE.Raycaster();
        controller.raycaster.near = 0.1;
        setupControllerEvents(controller);
        this.game.dolly.add(controller);
        this.game.controllers.push(controller);
    }
};

/**
 * Handles controller connection.
 * @param {Object} controller - The connected controller.
 * @param {Object} controllerMesh - The mesh to be used for the controller.
 */
XRControls.prototype.handleControllerConnected = function(controller, controllerMesh) {
    controller.add(controllerMesh.clone());
    const line = new THREE.Line(this.geom);
    line.scale.set(0.2, 0.2, 0);
    controller.add(line);
    this.activeControllers.push(controller);
};

/**
 * Handles controller disconnection.
 * @param {Object} controller - The disconnected controller.
 */
XRControls.prototype.handleControllerDisconnected = function(controller) {
    controller.remove(controller.children[1]);
    controller.remove(controller.children[0]);
    this.activeControllers = this.activeControllers.filter(c => c.uuid !== controller.uuid);
};

/**
 * Attempts to teleport the player based on controller interaction.
 * @param {Object} controller - The controller used for teleportation.
 */
XRControls.prototype.attemptTeleport = function(controller) {
    const intersections = this.getIntersections(controller, this.objectsToIntersectWith);
    if (intersections.length === 0 || intersections[0].distance < 0.25 || intersections[0].object.uuid === this.objectsToIntersectWith[0].uuid) {
        return false;
    }
    const headPosition = this.game.player.position;
    const diff = intersections[0].point.clone().sub(headPosition);
    diff.y = 0; // Don't move the y of the head
    this.game.player.position.add(diff);
};

/**
 * Gets intersections between the controller's raycaster and the specified meshes.
 * @param {Object} controller - The controller.
 * @param {Array|Object} mesh - The mesh or array of meshes to check for intersections.
 * @returns {Array} An array of intersection results.
 */
XRControls.prototype.getIntersections = function(controller, mesh) {
    const mat = new THREE.Matrix4().identity().extractRotation(controller.matrixWorld);
    controller.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    controller.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(mat);
    return Array.isArray(mesh) ? controller.raycaster.intersectObjects(mesh) : controller.raycaster.intersectObject(mesh);
};

/**
 * Updates the state of the controllers, checking for intersections and updating visuals accordingly.
 * @param {number} delta - The time delta for the update.
 */
XRControls.prototype.update = function(delta) {
    if (this.activeControllers.length === 0) return;

    const controller = this.activeControllers[this.controllerToCheck];
    const intersections = this.getIntersections(controller, this.objectsToIntersectWith);

    if (intersections.length === 0 || intersections[0].distance < 0.25 || intersections[0].object.uuid === this.objectsToIntersectWith[0].uuid) {
        controller.children[1].scale.z = 0;
        controller.children[0].material.color.setHex(0xffffff); // Disabled state
    } else {
        controller.children[1].scale.z = intersections[0].distance;
        controller.children[0].material.color.setHex(0x88ff88); // Enabled state
    }

    // Rotate through controllers for performance
    this.controllerToCheck = (this.controllerToCheck + 1) % this.activeControllers.length;
};