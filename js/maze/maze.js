/**
 * Class representing a maze.
 * Handles the generation and management of a maze layout.
 */
class Maze {
    /**
     * Creates a Maze instance.
     * @param {number} width - The width of the maze.
     * @param {number} height - The height of the maze.
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = generateMaze(width, height); // Generate the maze layout
        this.walls = []; // Array to store wall presence
        this.xw = []; // Walls along the x-axis
        this.zw = []; // Walls along the z-axis
        this.actualMazeWidth = 0; // Initialize to default value
        this.actualMazeHeight = 0; // Initialize to default value
        this.initializeWalls(); // Initialize walls based on the generated maze
    }

    getWalls() {
        return this.walls;
    }

    /**
     * Initializes the walls of the maze.
     * Sets up the wall arrays based on the maze layout.
     */
    initializeWalls() {
        // Iterate over each cell to determine the presence of walls
        for (let x = 0; x < this.maze.width * 2 + 1; x++) {
            this.walls[x] = [];
            if (x % 2 === 0) {
                for (let y = 0; y < this.maze.height * 2 + 1; y++) {
                    // Determine if a wall should be present at each cell
                    this.walls[x].push(y % 2 === 0 || !(x > 0 && this.maze.vertical[x / 2 - 1][Math.floor(y / 2)]));
                }
            } else {
                for (let y = 0; y < this.maze.height * 2 + 1; y++) {
                    this.walls[x].push(y % 2 === 0 && !(y > 0 && this.maze.horizontal[(x - 1) / 2][y / 2 - 1]));
                }
            }
        }

        // Set start and finish points in the maze
        this.walls[0][1] = false; // Start
        this.walls[this.maze.width * 2 - 1][this.maze.height * 2] = false; // Finish

        this.actualMazeWidth = this.walls.length;
        this.actualMazeHeight = this.walls[0].length;

        // Initialize wall arrays for x and z axes
        this.initializeAxisWalls();
    }

    /**
     * Initializes the x and z axis walls arrays.
     */
    initializeAxisWalls() {
        // Initialize x-axis walls
        for (let x = 0; x < this.actualMazeWidth + 1; x++) {
            this.xw.push([]);
            for (let z = 0; z < this.actualMazeHeight + 1 + 1; z++) {
                this.xw[x].push(false);
            }
        }

        // Initialize z-axis walls
        for (let z = 0; z < this.actualMazeHeight + 1; z++) {
            this.zw.push([]);
            for (let x = 0; x < this.actualMazeWidth + 1 + 1; x++) {
                this.zw[z].push(false);
            }
        }

        // Determine the presence of walls along the x and z axes
        this.determineAxisWalls();
    }

    /**
     * Determines the presence of walls along the x and z axes.
     */
    determineAxisWalls() {
        for (let x = 0; x < this.actualMazeWidth; x++) {
            for (let z = 0; z < this.actualMazeHeight; z++) {
                if (this.walls[z][x]) {
                    // Determine the presence and orientation of walls
                    this.setWallPresence(x, z);
                }
            }
        }
    }

    /**
     * Sets the presence and orientation of walls at a given position.
     * @param {number} x - The x-coordinate in the maze.
     * @param {number} z - The z-coordinate in the maze.
     */
    setWallPresence(x, z) {
        // Check and set walls for each direction
        if (z <= 0 || !this.walls[z - 1][x]) {
            this.xw[x][z] = { flipped: 1 }; // Front
        }
        if (z >= this.actualMazeHeight - 1 || !this.walls[z + 1][x]) {
            this.xw[x][z + 1] = { flipped: 0 }; // Back
        }
        if (x <= 0 || !this.walls[z][x - 1]) {
            this.zw[z][x] = { flipped: 1 }; // Left
        }
        if (x >= this.actualMazeWidth - 1 || !this.walls[z][x + 1]) {
            this.zw[z][x + 1] = { flipped: 0 }; // Right
        }
    }

    /**
     * Generates the geometry for the maze, including a pyramid
     * @param {THREE.Vector3} SCALE - The scale of the maze.
     * @param {{init: (function(): void), textures: {}, texture: (function(string): Texture)}} Asset - The asset manager for textures and materials.
     * @returns {THREE.Group} - The group containing the mesh representing the maze geometry and the pyramid
     */
    generateMazeGeometry(SCALE, Asset) {
        // Initialize matrix and temporary geometry for merging.
        const matrix = new THREE.Matrix4();
        const tmpgeom = new THREE.Geometry();

        // Define single wall geometry.
        const SingleWallGeom = new THREE.PlaneBufferGeometry(1, 1);
        const SingleWallGeoms = {
            x: [
                new THREE.Geometry().fromBufferGeometry(
                    SingleWallGeom.clone().rotateY(Math.TAU / 4)
                ),
                new THREE.Geometry().fromBufferGeometry(
                    SingleWallGeom.clone().rotateY(Math.TAU * 3 / 4)
                )
            ],
            z: [
                new THREE.Geometry().fromBufferGeometry(SingleWallGeom),
                new THREE.Geometry().fromBufferGeometry(
                    SingleWallGeom.clone().rotateY(Math.PI)
                )
            ]
        };

        // Generate and merge geometries along the x-axis.
        for (let z = 0; z < this.xw[0].length; z++) {
            for (let x = 0; x < this.xw.length; x++) {
                let wall = this.xw[x][z];
                if (wall) {
                    matrix.makeTranslation(z - 0.5, 0, x);
                    tmpgeom.merge(SingleWallGeoms.x[wall.flipped], matrix);
                }
            }
        }

        // Generate and merge geometries along the z-axis.
        for (let x = 0; x < this.zw[0].length; x++) {
            for (let z = 0; z < this.zw.length; z++) {
                let wall = this.zw[z][x];
                if (wall) {
                    matrix.makeTranslation(z, 0, x - 0.5);
                    tmpgeom.merge(SingleWallGeoms.z[wall.flipped], matrix);
                }
            }
        }

        // Scale and finalize the geometry.
        tmpgeom.scale(SCALE.x, SCALE.y, SCALE.z);
        const mazeGeom = new THREE.BufferGeometry().fromGeometry(tmpgeom);
        mazeGeom.computeBoundingSphere();

        // Define and apply the material for the maze.
        const CubeBumpMap = Asset.texture("bump.jpeg");
        CubeBumpMap.wrapT = CubeBumpMap.wrapS = THREE.RepeatWrapping;
        CubeBumpMap.offset.set(1, 1);
        CubeBumpMap.repeat.set(1, 1);

        const CubeMaterial = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            bumpMap: CubeBumpMap,
            bumpScale: 0.55,
            shininess: 12,
            side: THREE.DoubleSide
        });
        CubeMaterial.displacementMap = CubeBumpMap;
        CubeMaterial.displacementScale = 0;

        const mazeMesh = new THREE.Mesh(mazeGeom, CubeMaterial);

        // Add a pyramid above the maze covering the entire maze
        const pyramidGeometry = new THREE.ConeBufferGeometry(
            Math.max(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z) / 1.415,
            Math.max(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z),
            4.8
        );

        // Use MeshPhongMaterial for the pyramid with the "bump.jpeg" texture and yellow color
        const pyramidMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: Asset.texture("ceiling_bump.jpeg"),
            bumpMap: Asset.texture("ceiling_bump.jpeg"),
            bumpScale: 100,
            shininess: 15,
        });

        const pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramidMesh.position.set(this.actualMazeWidth * SCALE.x / 2.125, Math.max(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z) / 1.8888, this.actualMazeHeight * SCALE.z / 2.13);

        // Set the rotation of the pyramid to 60 degrees on the Y-axis and a slight angle on the Z-axis
        const rotationAngleX = THREE.MathUtils.degToRad(0);
        const rotationAngleY = THREE.MathUtils.degToRad(135);
        const rotationAngleZ = THREE.MathUtils.degToRad(0);
        pyramidMesh.rotation.set(rotationAngleX, rotationAngleY, rotationAngleZ);

        // Group the maze and pyramid meshes
        const mazeGroup = new THREE.Group();
        mazeGroup.add(mazeMesh);
        mazeGroup.add(pyramidMesh);

        scene.add(mazeGroup);

        return new THREE.Mesh(mazeGeom, CubeMaterial);
    }

    /**
     * Adds torches to the maze.
     * @param {TorchBuilder} torchBuilder - The torch builder to use for adding torches.
     */
    addTorches(torchBuilder) {
        // Iterate through each cell in the maze.
        for (let x = 0; x < this.walls.length; x++) {
            for (let y = 0; y < this.walls[x].length; y++) {
                // Check for empty spaces and randomly decide to place a torch.
                if (!this.walls[x][y] && rnd(10) === 0) {
                    let options = [];
                    if (x > 0 && this.walls[x - 1][y]) options.push(Direction.West);
                    if (x < this.walls.length - 1 && this.walls[x + 1][y]) options.push(Direction.East);
                    if (y > 0 && this.walls[x][y - 1]) options.push(Direction.South);
                    if (y < this.walls[x].length - 1 && this.walls[x][y + 1]) options.push(Direction.North);

                    torchBuilder.addTorch(new THREE.Vector3(x, 0, y), DirectionToAngle(options.randomElement()));
                }
            }
        }

        // Place a torch at the entrance of the maze.
        torchBuilder.addTorch(new THREE.Vector3(-1, 0, 0), DirectionToAngle(Direction.East));

        // Finalize the torch building process.
        torchBuilder.finish();
    }

    /**
     * Creates the ceiling of the maze.
     * @param {THREE.Vector3} SCALE - The scale of the maze.
     * @param {{init: (function(): void), textures: {}, texture: (function(string): Texture)}} Asset - The asset manager for textures and materials.
     * @returns {THREE.Mesh} - The mesh representing the ceiling.
     */
    createCeiling(SCALE, Asset) {
        // Define the geometry and material for the ceiling.
        const MazePlane = new THREE.PlaneGeometry(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z);
        const CeilingBumpMap = Asset.texture("ceiling_bump.jpeg");
        CeilingBumpMap.wrapT = CeilingBumpMap.wrapS = THREE.RepeatWrapping;
        CeilingBumpMap.repeat.set(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z);

        const CeilingMaterial = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            bumpMap: CeilingBumpMap,
            bumpScale: 1,
            shininess: 11
        });

        // Create and position the ceiling mesh.
        const Ceiling = new THREE.Mesh(MazePlane, CeilingMaterial);
        Ceiling.position.set(this.width, 1 / 2, this.height).multiply(SCALE);
        Ceiling.rotation.x = Math.TAU / 4;

        return Ceiling;
    }

    /**
     * Creates the floor of the maze.
     * @param {THREE.Vector3} SCALE - The scale of the maze.
     * @param {{init: (function(): void), textures: {}, texture: (function(string): Texture)}} Asset - The asset manager for textures and materials.
     * @returns {THREE.Mesh} - The mesh representing the floor.
     */
    createFloor(SCALE, Asset) {
        // Define the geometry and material for the floor.
        const MazePlane = new THREE.PlaneGeometry(this.actualMazeWidth * SCALE.x, this.actualMazeHeight * SCALE.z);
        const FloorBumpMap = Asset.texture("floor_bump.jpeg");
        FloorBumpMap.wrapT = FloorBumpMap.wrapS = THREE.RepeatWrapping;
        FloorBumpMap.repeat.set(this.actualMazeWidth, this.actualMazeHeight);

        const FloorMaterial = new THREE.MeshPhongMaterial({
            color: 0xb0b0b0,
            bumpMap: FloorBumpMap,
            bumpScale: 1,
            shininess: 10
        });

        // Create and position the maze floor mesh.
        const Floor = new THREE.Mesh(MazePlane, FloorMaterial);
        Floor.position.set( this.width, -1 / 2, this.height ).multiply(SCALE);
        Floor.rotation.x = Math.TAU * 3 / 4;

        return Floor;
    }

    /**
     * Creates the grass floor outside the maze.
     * @param {THREE.Vector3} SCALE - The scale of the maze.
     * @param {{init: (function(): void), textures: {}, texture: (function(string): Texture)}} Asset - The asset manager for textures and materials.
     * @returns {THREE.Mesh} - The mesh representing the floor.
     */
    createOutsideFloor(SCALE, Asset, avgScaleXZ) {
        // Define the geometry and material for the floor.
        const OutsideFloorSize = Math.max(50, this.actualMazeWidth, this.actualMazeHeight) * 2 * avgScaleXZ;
        const OutsideFloorTexture = Asset.texture("grass-floor.jpg");
        OutsideFloorTexture.wrapT = OutsideFloorTexture.wrapS = THREE.RepeatWrapping;
        OutsideFloorTexture.repeat.set(Math.floor(OutsideFloorSize * 2 / SCALE.x), Math.floor(OutsideFloorSize * 2 / SCALE.z));

        const OutsideFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(OutsideFloorSize, OutsideFloorSize),
            new THREE.MeshBasicMaterial({
                map: OutsideFloorTexture,
                color: 0x888888
            })
        );

        // Position the floor mesh.
        OutsideFloor.position.set(-1 / 2, -1 / 2 - 0.01, -1 / 2).multiply(SCALE);
        OutsideFloor.rotation.x = Math.TAU * 3 / 4;

        return OutsideFloor;
    }

}
