var SCALE = new THREE.Vector3( 1, 1, 1 );
var maze;
var gamewon = false;



// Create an array to store heart elements
var heartElements = [];

var theme_sound = new Audio('res/sound/theme_Song.m4a');

var Game = function(args)
{

    this.controllers = [];
    
    if ( args.scale ) {
        
        SCALE.copy( args.scale );
        
    }
    
    var avgScaleXZ = ( SCALE.x + SCALE.z ) / 2;
    
    this.hacks = !!args.hacks || false;
    this.player = {
        position: new THREE.Vector3( -1.5, 0.1, 1 )
            .multiply( SCALE ),
        theta: Math.PI * 1.5,
        health: 3,
        phi: 0
    };

    Asset.init();

    for (var i = 0; i < this.player.health; i++) {
        var heart = document.createElement('img');
        heart.src = 'res/heart.png';
        heart.style.width = '30px'; // Adjust the width based on your preference
        heart.style.height = '30px'; // Adjust the height based on your preference
        heart.style.position = 'absolute';
        heart.style.top = '10px'; // Adjust the top position based on your preference
        heart.style.right = (i * 40 + 10) + 'px'; // Adjust the right position for spacing
        document.body.appendChild(heart);
        heartElements.push(heart);
    }

    var light = new THREE.AmbientLight(0x202020);
    scene.add( light );

    this.player.light = new THREE.PointLight( 0xF5D576, 1.2 * SCALE.average(), 2.5899 * SCALE.average() );



    /*

    // Cube Sky

    scene.background = new THREE.Color(0x1F2427);
    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load([
        "res/sky/sky_rt0001.png", // positive x
        "res/sky/sky_lf0001.png", // negative x
        "res/sky/sky_up0001.png", // positive y
        "res/sky/sky_dn0001.png", // negative y
        "res/sky/sky_ft0001.png", // positive z
        "res/sky/sky_bk0001.png", // negative z
    ]);
    scene.background = texture;

    var moonLight = new THREE.DirectionalLight(0x555577, 0.5);
    moonLight.position.set(-1, 1, -1);
    scene.add(moonLight);

    scene.fog = new THREE.Fog(0x1F2427, 2, 20);
    */

    // Sphere Sky
    var skyTexture = Asset.texture( "sky/beautiful-shining-stars-night-sky.jpg" );
    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.RepeatWrapping;
    skyTexture.repeat.set(2, 2);
    skyTexture.minFilter = THREE.LinearFilter;

    var skyGeometry = new THREE.SphereGeometry(10000, 100, 80);

    var skyMaterial = new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide,
        color: new THREE.Color(0.5, 0.5, 0.5)
    });
    var skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);

    var moonLight = new THREE.DirectionalLight(0x555577, 0.5);
    moonLight.position.set(-1, 1, -1);

    scene.add(moonLight);
    scene.add(skyMesh);

    camera.fov = 75;
    camera.updateProjectionMatrix();

    var dolly = new THREE.Group();
    
    dolly.add( this.player.light );
    
    // Euler rotation order for camera movement
    dolly.rotation.order = "ZYX";
    
    dolly.add( camera );

    this.player.update = function()
    {
        this.dolly.position.copy( this.position );

        this.dolly.rotation.y = this.theta;
        this.dolly.rotation.x = this.phi;
        
    };

    
    this.player.dolly = dolly;
    this.player.update();
    
    scene.add( dolly );
    
    this.dolly = dolly;

    maze = generateMaze( args.width, args.height );
    var mazeWalls = [];


    var torchBuilder = new TorchBuilder();

    // Gaps
    var walls = [];
    for ( var x = 0; x < maze.width * 2 + 1; x++ )
    {
        walls[x] = [];
        if ( x % 2 === 0 )
        {
            for ( var y = 0 ; y < maze.height * 2 + 1; y++ )
            {
                walls[x].push( ( y % 2 === 0 || !( x > 0 && maze.vertical[ x / 2 - 1 ][ Math.floor( y / 2 ) ] ) ) );
            }
        }
        else
        {
            for ( var y = 0 ; y < maze.height * 2 + 1; y++ )
            {
                walls[x].push( ( y % 2 === 0 && !( y > 0 && maze.horizontal[ (x - 1) / 2 ][ y / 2 - 1 ] ) ) );
            }
        }
    }

    walls[ 0 ][ 1 ] = false; // start
    walls[ maze.width * 2 - 1 ][ maze.height * 2 ] = false; // finish
    
    
    var actualMazeWidth = walls.length;
    var actualMazeHeight = walls[ 0 ].length;

    console.log( walls );


    // ! WALLS ARE Z, X!

    var xw = []; // walls along x axis, first dimension is x, second z
    var zw = []; // walls along z axis, first dimension is z, second x

    // additional + 1 is for ez culling
    for ( var x = 0; x < actualMazeWidth + 1; x++ )
    {
        xw.push( [] );
        for ( var z = 0; z < actualMazeHeight + 1 + 1; z++ )
        {
            xw[ x ].push( false );
        }
    }
    for ( var z = 0; z < actualMazeHeight + 1; z++ )
    {
        zw.push( [] );
        for ( var x = 0; x < actualMazeWidth + 1 + 1; x++ )
        {
            zw[ z ].push( false );
        }
    }

    for ( var x = 0; x < actualMazeWidth; x++ )
    {
        for ( var z = 0; z < actualMazeHeight; z++ )
        {
            if ( walls[ z ][ x ] )
            {
                // remove size conditions, replace by unrolled loop
                if ( z <= 0 || !walls[ z - 1 ][ x ] )
                {
                    // front
                    xw[ x ][ z ] = { flipped: 1 };
                }
                if ( z >= actualMazeHeight - 1 || !walls[ z + 1 ][ x ] )
                {
                    // back
                    xw[ x ][ z + 1 ] = { flipped: 0 };
                }
                if ( x <= 0 || !walls[ z ][ x - 1 ] )
                {
                    // left
                    zw[ z ][ x ] = { flipped: 1 };
                }
                if ( x >= actualMazeWidth - 1 || !walls[ z ][ x + 1 ] )
                {
                    // right
                    zw[ z ][ x + 1 ] = { flipped: 0 };
                }
            }
        }
    }

    console.log( xw );
    console.log( zw );

    var matrix = new THREE.Matrix4();
    var tmpgeom = new THREE.Geometry();
    
    
    var SingleWallGeom = new THREE.PlaneBufferGeometry( 1, 1 );
    var SingleWallGeomX = new THREE.Geometry().fromBufferGeometry(
            SingleWallGeom.clone()
                .rotateY( Math.TAU / 4 )
        );
    var SingleWallGeoms = {
        x: [
            new THREE.Geometry().fromBufferGeometry(
                SingleWallGeom.clone()
                    .rotateY( Math.TAU / 4 )
            ),
            new THREE.Geometry().fromBufferGeometry(
                SingleWallGeom.clone()
                    .rotateY( Math.TAU * 3 / 4 )
            )
        ],
        z: [
            new THREE.Geometry().fromBufferGeometry( SingleWallGeom ),
            new THREE.Geometry().fromBufferGeometry(
                SingleWallGeom.clone()
                    .rotateY( Math.PI )
            )
        ]
    }
    

    
    var SingleWallGeomZ = new THREE.Geometry().fromBufferGeometry( SingleWallGeom );
    
    
    
    // Generate geometries and merge them
    
    // x axis
    for ( var z = 0; z <  xw[ 0 ].length; z++ )
    {
        for ( var x = 0; x < xw.length; x++ )
        {
            var wall = xw[ x ][ z ];
            if ( wall )
            {
                matrix.makeTranslation(
                    z - 1 / 2,
                    0,
                    x
                );
                
                tmpgeom.merge( 
                    SingleWallGeoms.x[ wall.flipped ],
                    matrix
                );
            }
        }
    }

    // z axis
    for ( var x = 0; x < zw[ 0 ].length; x++ )
    {
        for ( var z = 0; z < zw.length; z++ )
        {
            var wall = zw[ z ][ x ];
            if ( wall )
            {
                matrix.makeTranslation(
                    z,
                    0,
                    x - 1 / 2
                );
                
                tmpgeom.merge( 
                    SingleWallGeoms.z[ wall.flipped ],
                    matrix
                );
            }
        }
    }

    tmpgeom.scale( SCALE.x, SCALE.y, SCALE.z );
    var mazeGeom = new THREE.BufferGeometry().fromGeometry( tmpgeom );
    mazeGeom.computeBoundingSphere();


    var CubeBumpMap = Asset.texture( "bump.jpeg" );
    CubeBumpMap.wrapT = CubeBumpMap.wrapS = THREE.RepeatWrapping;
    CubeBumpMap.offset.set( 1, 1 );
    CubeBumpMap.repeat.set( 1, 1 );


    var CubeMaterial = new THREE.MeshPhongMaterial( {
        color: 0xaaaaaa,
        bumpMap: CubeBumpMap,
        bumpScale: 0.55,
        shininess: 12,
        side: THREE.DoubleSide
    } );
    CubeMaterial.displacementMap = CubeBumpMap;
    CubeMaterial.displacementScale = 0;


    var mazeMesh = new THREE.Mesh(
        mazeGeom,
        //new THREE.MeshStandardMaterial( { color: 0xff0000, wireframe: true })
        CubeMaterial
    );
    scene.add( mazeMesh );

    for ( var x = 0; x < walls.length; x++ )
    {
        for ( var y = 0; y < walls[ x ].length; y++ )
        {
            if ( !walls[ x ][ y ] && rnd( 10 ) === 0 )
            {
                // Add random torches!
                var options = [];

                if ( x > 0  && walls[ x - 1 ][ y ] )
                    options.push( Direction.West );
                if ( x < walls.length - 1 && walls[ x + 1 ][ y ] )
                    options.push( Direction.East );

                if ( y > 0  && walls[ x ][ y - 1 ] )
                    options.push( Direction.South );
                if ( y < walls[ x ].length - 1 && walls[ x ][ y + 1 ] )
                    options.push( Direction.North );

                // There's always a possibility, no need to check
                torchBuilder.addTorch( new THREE.Vector3( x, 0, y ), DirectionToAngle( options.randomElement() ) );
            }
        }
    }

    // Place a torch at the entrance of the maze
    torchBuilder.addTorch( new THREE.Vector3( -1, 0, 0 ), DirectionToAngle( Direction.East ) );
    
    torchBuilder.finish();


    mazeWalls.push( mazeMesh );
    this.walls = mazeWalls;


    var MazePlane = new THREE.PlaneGeometry( actualMazeWidth * SCALE.x, actualMazeHeight * SCALE.z );

    var CeilingBumpMap = Asset.texture( "ceiling_bump.jpeg" );
    CeilingBumpMap.wrapT = CeilingBumpMap.wrapS = THREE.RepeatWrapping;
    CeilingBumpMap.repeat.set( actualMazeWidth * SCALE.x, actualMazeHeight * SCALE.z );

    var CeilingMaterial = new THREE.MeshPhongMaterial( {
        color: 0xaaaaaa,
        bumpMap: CeilingBumpMap,
        bumpScale: 1,
        shininess: 11
    } );

    var Ceiling = new THREE.Mesh( MazePlane, CeilingMaterial );
    Ceiling.position.set( maze.width, 1 / 2, maze.height ).multiply( SCALE );
    Ceiling.rotation.x = Math.TAU / 4;
    scene.add( Ceiling );


    var FloorBumpMap = Asset.texture( "floor_bump.jpeg" );
    FloorBumpMap.wrapT = FloorBumpMap.wrapS = THREE.RepeatWrapping;
    FloorBumpMap.repeat.set( actualMazeWidth, actualMazeHeight );

    var FloorMaterial = new THREE.MeshPhongMaterial( {
        color: 0xb0b0b0,
        bumpMap: FloorBumpMap,
        bumpScale: 1,
        shininess: 10
    } );

    var Floor = new THREE.Mesh( MazePlane, FloorMaterial );
    Floor.position.set( maze.width, -1 / 2, maze.height ).multiply( SCALE );
    Floor.rotation.x = Math.TAU * 3 / 4;
    scene.add( Floor );
    
    var OutsideFloorSize = Math.max( 50, actualMazeWidth, actualMazeHeight ) * 2 * avgScaleXZ;
    
    var OutsideFloorTexture = Asset.texture( "grass-floor.jpg" );
    OutsideFloorTexture.wrapT = OutsideFloorTexture.wrapS = THREE.RepeatWrapping;
    OutsideFloorTexture.repeat.set( Math.floor( OutsideFloorSize * 2 / SCALE.x ), Math.floor( OutsideFloorSize * 2 / SCALE.z ) );
    
    var OutsideFloor = new THREE.Mesh( 
        new THREE.PlaneGeometry( OutsideFloorSize, OutsideFloorSize ),
        new THREE.MeshBasicMaterial( {
            map: OutsideFloorTexture,
            color: 0x888888
        } )
    );

    OutsideFloor.position.set(-1 / 2, -1 / 2 - 0.01, -1 / 2).multiply( SCALE );
    OutsideFloor.rotation.x = Math.TAU * 3 / 4; // rotate floor to make it a floor and not a wall
    
    scene.add( OutsideFloor );
    
    this.xrControls = new XRControls( this, [ mazeMesh, Floor, OutsideFloor ] );
    
    this.MOVESPEED = 1.5 * avgScaleXZ;


    // Button and shortcut to disable sound
    var sound_button = document.createElement('button');
    sound_button.style.position = 'absolute';
    sound_button.style.width = '100px'; // Set the width as a string with 'px'
    sound_button.style.height = '50px'; // Adjusted the height for a more balanced look
    sound_button.style.backgroundColor = 'transparent'; // Transparent background
    sound_button.style.border = '2px solid #4CAF50'; // Green border
    sound_button.style.color = '#4CAF50'; // Green text color
    sound_button.style.fontSize = '20px'; // Adjusted font size
    sound_button.style.borderRadius = '8px'; // Rounded corners
    sound_button.style.cursor = 'pointer'; // Set cursor to pointer for better UX
    sound_button.style.top = '10px'; // Adjusted top position
    sound_button.style.left = '10px'; // Adjusted left position
    sound_button.innerHTML = 'Sound on'; // Changed initial text
    sound_button.onclick = function() {
        if (theme_sound.muted) {
            theme_sound.muted = false;
            sound_button.innerHTML = 'Sound on';
        } else {
            theme_sound.muted = true;
            sound_button.innerHTML = 'Sound off';
        }
    };

    document.body.appendChild(sound_button);
};

Game.prototype.postXRInit = function() {
    

    // Add fullscreen key
    THREEx.FullScreen.bindKey( { charCode : 'f'.charCodeAt( 0 ) } );

    // init pointerlock
    if ( requestPointerLock() ) {
        new PointerLock();
    }
    
    // below code is for when WebXR is present
    if ( !WEBXR_PRESENT ) {
        return;
    }
    
    // setup controllers
    this.xrControls.init();
    
};

Game.prototype.onXRSessionChange = function( sessionType ) {
    
    console.info( sessionType );
    
    // Lower the ground level for XR
    if ( sessionType === "sessionStarted" ) {
        
        g.player.position.y = ( -1 / 2 + 0.08 ) * SCALE.y;
        
    } else if ( sessionType === "sessionEnded" ) {
        
        g.player.position.y = 0;
        
    }
    
};
var collission_counter = 0;
const collide_sound = new Audio('res/sound/toutchie.mp3');
collide_sound.load();

Game.prototype.playerCollides = function( dir, amount )
{

    // Create a raycaster to check for player collisions with obstacles.
    var ray = new THREE.Raycaster( this.player.position, dir, 0, amount + 0.14 );

    // Perform collision detection by checking the raycaster against a list of obstacles (this.walls).
    var colliders = ray.intersectObjects( this.walls, false );

    // Check if the player has reached the target position (e.g., coordinates walls[maze.width * 2 - 1][maze.height * 2]).
    var targetPosition = new THREE.Vector3(maze.width * 2 - 1, 0, maze.height * 2); // Target position
    var playerPosition = this.player.position.clone();
    playerPosition.y = 0; // Set the Y-coordinate to 0 if not needed.

    var distanceToTarget = playerPosition.distanceTo(targetPosition);

    // If a collision is detected, play the sound and return true.
    if (colliders.length > 0 && colliders[0].distance - 0.5 < amount){
        collide_sound.volume = 1; // Set the volume (0-1)
        if (collide_sound.ended || collission_counter === 0) {
            collission_counter++;
            this.player.health--;
            if (this.player.health > 0) {
                collide_sound.play().then(r => console.log("Played collision sound"));
            }

            else{

                //Play lose voice and song
                theme_sound.pause();
                var lose_voice = new Audio('res/sound/Evil_Laugh.mp3');
                lose_voice.volume = 0.5;
                lose_voice.play();
                var lose_song = new Audio('res/sound/Titanic_Song.mp3');
                lose_song.volume = 1;
                lose_song.play();

                //display lose text and set the player ins nirvana
                var lose_quote = document.createElement('div');
                lose_quote.style.position = 'absolute';
                lose_quote.style.width = 100;
                lose_quote.style.height = 100;
                lose_quote.style.color = "red";
                lose_quote.style.fontSize = "50px";
                lose_quote.style.top = 50 + '%';
                lose_quote.style.left = 50 + '%';
                lose_quote.style.transform = 'translate(-50%, -50%)';
                lose_quote.innerHTML = "You Lost!";
                document.body.appendChild(lose_quote);
                this.player.position = 0;
            }
            updateHearts();
        }
        return true;
    };

    // Check if the game is not won and the player has reached the target position.
    if (gamewon === false && distanceToTarget < 1.0) {
        gamewon = true;
        console.log("Player reached the target position!");

        // You could perform additional actions when the player reaches the target position.
        const success_sound = new Audio('res/sound/duft_des_sieges.mp3');
        success_sound.volume = 1; // Set the volume (0-1)
        success_sound.load();
        success_sound.play().then(r => console.log("Played success sound"));

        // Display the text "You win!" centered on the Y and X axes in the window.
        var win_quote = document.createElement('div');
        win_quote.style.position = 'absolute';
        win_quote.style.width = 100;
        win_quote.style.height = 100;
        win_quote.style.color = "yellow";
        win_quote.style.fontSize = "50px";
        win_quote.style.top = 50 + '%';
        win_quote.style.left = 50 + '%';
        win_quote.style.transform = 'translate(-50%, -50%)';
        win_quote.innerHTML = "You win!";
        document.body.appendChild(win_quote);
    }

    return false;
};

// Function to update hearts based on player's health
const updateHearts = () => {
    for (let i = 0; i < heartElements.length; i++) {
        if (i < g.player.health) {
            heartElements[i].style.display = 'block'; // Show the heart
        } else {
            heartElements[i].style.display = 'none'; // Hide the heart
        }
    }
};

Game.prototype.update = function( delta )
{
    var MoveSpeed = this.MOVESPEED * delta;
    var KeyRotateSpeed = 1.4 * delta;

    // debux hax
    if ( InputManager.isKeyPressed( 113 /*f2*/ ) )
    {
        this.hacks ^= true;
    }

    if (this.hacks)
    {
        if ( InputManager.isKeyDown ( 16 /*shift*/ ) )
        {
            MoveSpeed *= 4; // Go faster!
        }

        if ( InputManager.isKeyDown( 32 /*space*/ ) )
        {
            this.player.position.y += MoveSpeed; // Go up
        }
        else if ( InputManager.isKeyDown( 17 /*ctrl*/ ) )
        {
            this.player.position.y -= MoveSpeed; // Go down
        }
    }
    else
    {
        if ( InputManager.isKeyDown ( 16 /*shift*/ ) )
        {
            MoveSpeed *= 1.7; // Go faster!
        }
    }



    if ( InputManager.isKeyDown( 81 /*q*/ ) )
    {
        this.player.theta += KeyRotateSpeed; /* turn left */
    }
    else if ( InputManager.isKeyDown( 69 /*e*/ ) )
    {
        this.player.theta -= KeyRotateSpeed; /* turn right */
    }

    this.player.theta = rotclamp( this.player.theta );

    var cTheta = Math.cos( this.player.theta );
    var sTheta = Math.sin( this.player.theta );

    var dir = new THREE.Vector3( -1.0 * sTheta, 0, -1.0 * cTheta );

    if ( (
            InputManager.isKeyDown( 87 /* w */ ) ||
            InputManager.isKeyDown( 38 /* arrow key up */ )
         ) &&
         !this.playerCollides( dir, MoveSpeed ))
    {
        // Move forward
        this.player.position.x += dir.x * MoveSpeed;
        this.player.position.z += dir.z * MoveSpeed;

    }
    else if ( (
            InputManager.isKeyDown( 83 /* s */ ) ||
            InputManager.isKeyDown( 40 /* arrow key down */ )
            ) &&
         !this.playerCollides( new THREE.Vector3( -dir.x, -dir.y, -dir.z ), MoveSpeed ))
    {
        // Move backward
        this.player.position.x -= dir.x * MoveSpeed;
        this.player.position.z -= dir.z * MoveSpeed;
    }

    var xProd = new THREE.Vector3();
    xProd.crossVectors( dir, new THREE.Vector3( 0, 1.0, 0 ) );

    if ( (
            InputManager.isKeyDown( 65 /* a */ ) ||
            InputManager.isKeyDown( 37 /* arrow key left */ )
        ) &&
         !this.playerCollides(  new THREE.Vector3( -xProd.x, -xProd.y, -xProd.z ), MoveSpeed ) )
    {
        // Move left
        this.player.position.x -= xProd.x * MoveSpeed;
        this.player.position.z -= xProd.z * MoveSpeed;
    }
    else if ( (
            InputManager.isKeyDown( 68 /*d*/ ) || 
            InputManager.isKeyDown( 39 /* arrow key right */ )
              ) &&
              !this.playerCollides( xProd, MoveSpeed ) )
    {
        // Move right
        this.player.position.x += xProd.x * MoveSpeed;
        this.player.position.z += xProd.z * MoveSpeed;
    }

    this.player.update();
    
    this.xrControls.update( delta );

    InputManager.update();
};

Game.prototype.mustRender = function()
{
    return true;
};
