var TorchBuilder = function() {

    this.initialTorchPos = new THREE.Vector3( 0.45 * SCALE.x, 0.18 * SCALE.y, 0 );
    this.initialLightPos = new THREE.Vector3( 0.37 * SCALE.x, (0.18 + 0.2) * SCALE.y, 0 );
    var torchGeometry = new THREE.BoxGeometry(0.03 * SCALE.x, 0.25 * SCALE.y, 0.07 * SCALE.z);

    // Load wood texture
    var woodTexture = new THREE.TextureLoader().load('res/wood.jpeg');
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);

    var torchMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        color: 0xffffff, // Set a base color if the texture is not fully covering the geometry
        roughness: 0.8, // Adjust the roughness for a more realistic look
        metalness: 0.2, // Adjust the metalness for a more realistic look
    });

    this.torchMesh = new THREE.Mesh(torchGeometry, torchMaterial);
    this.torchLight = new THREE.PointLight(0xFF6600, 1 * SCALE.average(), 3 * SCALE.average());
    this.geometry = new THREE.Geometry();

    this.torches = [];

};


TorchBuilder.prototype.addTorch = function( pos, angle ) {
    
    this.torches.push( new Torch( pos, angle, this ) );
    
};
    
TorchBuilder.prototype.finish = function() {
        
    var geom = new THREE.BufferGeometry().fromGeometry( this.geometry );
    geom.computeBoundingSphere();
    
    var mesh = new THREE.Mesh( geom, this.torchMesh.material );
    
    scene.add( mesh );
    
};

// A torch!
var Torch = function( pos, angle, torchBuilder ) {
    
    var torchPos = torchBuilder.initialTorchPos.clone();
    var lightPos = torchBuilder.initialLightPos.clone();
    var rotationVec = new THREE.Vector3( 0, 0, 0.39 );

    torchPos.rotateToY( angle );
    lightPos.rotateToY( angle );
    rotationVec.rotateY( angle );
    
    pos.multiply( SCALE );

    torchPos.add( pos );
    lightPos.add( pos );

    var torch = torchBuilder.torchMesh.clone();
    torch.position.copy( torchPos );
    torch.rotation.setFromVector3( rotationVec );

    // to transform a matrix would be too complex, so I do this instead.
    torchBuilder.geometry.mergeMesh( torch );

    this.light = torchBuilder.torchLight.clone();
    this.light.position.copy( lightPos );
    scene.add( this.light );

    //var pointLightHelper = new THREE.PointLightHelper( this.light, 0.01 );
    //scene.add( pointLightHelper );
};

/*Torch.prototype.update = function( delta )
{
    this.light.intensity = rnd( 90, 100 ) / 100.0;
};*/
