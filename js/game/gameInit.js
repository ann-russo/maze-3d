/**
 * Initializes the game by setting up the maze, torches, and environment.
 * @param {Game} gameInstance - The instance of the game to be initialized.
 * @param {Object} args - Configuration arguments for the game.
 * @param {THREE.Scene} scene - The Three.js scene to which objects will be added.
 * @param {{init: function(): void, textures: {}, texture: function(string): THREE.Texture}} Asset - The asset manager for textures and materials.
 */
function initGame(gameInstance, args, scene, Asset) {
    // Initialize the maze with specified dimensions.
    const maze = new Maze(args.width, args.height);
    let mazeWalls = [];
    const torchBuilder = new TorchBuilder();
    const avgScaleXZ = (SCALE.x + SCALE.z) / 2;

    // Generate the maze geometry and add it to the scene.
    const mazeMesh = maze.generateMazeGeometry(SCALE, Asset);
    scene.add(mazeMesh);

    // Add torches to the maze using the torch builder.
    maze.addTorches(torchBuilder);

    // Store the maze walls for collision detection.
    mazeWalls.push(mazeMesh);
    maze.walls = mazeWalls;

    // Create and add the ceiling, floor, and outside floor to the scene.
    const ceiling = maze.createCeiling(SCALE, Asset);
    scene.add(ceiling);
    const floor = maze.createFloor(SCALE, Asset);
    scene.add(floor);
    const outsideFloor = maze.createOutsideFloor(SCALE, Asset, avgScaleXZ);
    scene.add(outsideFloor);

    // Initialize XR controls and set movement speed.
    gameInstance.xrControls = new XRControls(gameInstance, [mazeMesh, floor, outsideFloor]);
    gameInstance.MOVESPEED = 1.5 * ((SCALE.x + SCALE.z) / 2);
    gameInstance.maze = maze
}

/**
 * Initializes the ambient lighting for the scene.
 * @param {THREE.Scene} scene - The Three.js scene object.
 */
function initAmbientLight(scene) {
    const light = new THREE.AmbientLight(0x202020);
    scene.add(light);
}

/**
 * Initializes the player's point light.
 * @param {THREE.Vector3} scale - The scale vector for the game.
 * @returns {THREE.PointLight} - The created point light.
 */
function initPlayerLight(scale) {
    return new THREE.PointLight(0xF5D576, 1.2 * scale.average(), 2.5899 * scale.average());
}

/**
 * Initializes the sky and moon lighting for the scene.
 * @param {THREE.Scene} scene - The Three.js scene object.
 */
function initSkyAndMoonLight(scene) {
    const skyTexture = Asset.texture("sky/beautiful-shining-stars-night-sky.jpg");
    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.RepeatWrapping;
    skyTexture.repeat.set(2, 2);
    skyTexture.minFilter = THREE.LinearFilter;

    const skyGeometry = new THREE.SphereGeometry(10000, 100, 80);
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide,
        color: new THREE.Color(0.5, 0.5, 0.5)
    });
    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyMesh);

    const moonLight = new THREE.DirectionalLight(0x555577, 0.5);
    moonLight.position.set(-1, 1, -1);
    scene.add(moonLight);
}
