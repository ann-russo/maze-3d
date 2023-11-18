// Global game object
let gameObject;

// ThreeJS essentials: camera, scene, renderer, and a timer for animations.
let camera, scene, renderer, timer;

// Flag to check if WebXR is available
let WEBXR_PRESENT = false;

/**
 * Initializes the ThreeJS scene, camera, renderer, and event listeners.
 */
function init() {
    // Create a new ThreeJS scene.
    scene = new THREE.Scene();

    // Initialize the camera with perspective projection.
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    scene.add(camera);

    // Initialize the clock for managing animations.
    timer = new THREE.Clock();

    // Set up the WebGL renderer and append it to the DOM.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add event listener for window resize.
    window.addEventListener("resize", onWindowResize, false);

    // Parse URL parameters for customizing the maze dimensions and scale.
    const urlParams = new URLSearchParams(window.location.search);
    const dimensions = parseDimensions(urlParams.get("dimensions"));
    const scale = parseScale(urlParams.get("scale"));

    // Initialize the game with parsed arguments.
    gameObject = new Game({ width: dimensions.width, height: dimensions.height, scale: scale });
}

/**
 * Handles additional initialization for XR if available.
 */
function postInit() {
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
            WEBXR_PRESENT = supported;

            if (supported) {
                import("../lib/VRButton.js")
                    .then((module) => {
                        document.body.appendChild(module.VRButton.createButton(renderer, gameObject.onXRSessionChange));
                        renderer.xr.enabled = true;
                        renderer.xr.setReferenceSpaceType("local");
                    });
            }

            gameObject.postXRInit();
        });
    } else {
        gameObject.postXRInit();
    }
}

/**
 * Adjusts the camera and renderer size when the window is resized.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Starts the game timer.
 */
function start() {
    timer.start();
}

/**
 * Animation loop for rendering the scene.
 */
function animate() {
    renderer.setAnimationLoop(function() {
        const delta = timer.getDelta();
        gameObject.update(delta);

        if (gameObject.mustRender()) {
            renderer.render(scene, camera);
        }
    });
}

/**
 * Parses maze dimensions from a string.
 * @param {string} dimensionString - The dimensions in the format "width,height".
 * @returns {Object} An object containing width and height.
 */
function parseDimensions(dimensionString) {
    let width = 8, height = 8;

    if (/\d+/.test(dimensionString)) {
        if (/\d+,\d+/.test(dimensionString)) {
            const arr = dimensionString.split(",");
            width = parseInt(arr[0]);
            height = parseInt(arr[1]);
        } else {
            width = height = parseInt(dimensionString);
        }
    }

    return { width: width, height: height };
}

/**
 * Parses scale values from a string.
 * @param {string} scaleString - The scale in the format "x,y,z".
 * @returns {THREE.Vector3} A ThreeJS Vector3 object with scale values.
 */
function parseScale(scaleString) {
    if (/\d+,\d+,\d+/.test(scaleString)) {
        const arr = scaleString.split(",");
        return new THREE.Vector3(
            parseInt(arr[0]),
            parseInt(arr[1]),
            parseInt(arr[2])
        );
    }
    return null;
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    scene.add(camera);

    const urlParams = new URLSearchParams(window.location.search);
    const dimensions = parseDimensions(urlParams.get("dimensions"));
    const scale = parseScale(urlParams.get("scale"));

    gameObject = new Game({ width: dimensions.width, height: dimensions.height, scale: scale });

    timer.stop();
    timer.start();
}

// Initialize and start the game.
init();
postInit();
start();
animate();