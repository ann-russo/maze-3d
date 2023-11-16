/**
 * TorchBuilder is responsible for creating and managing torches in the game.
 */
function TorchBuilder() {
    this.initialTorchPos = new THREE.Vector3(0.45 * SCALE.x, 0.18 * SCALE.y, 0);
    this.initialLightPos = new THREE.Vector3(0.37 * SCALE.x, (0.18 + 0.2) * SCALE.y, 0);
    const torchGeometry = new THREE.BoxGeometry(0.03 * SCALE.x, 0.25 * SCALE.y, 0.07 * SCALE.z);

    const woodTexture = Asset.texture("wood.jpeg");
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);

    const torchMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.2,
    });

    this.torchMesh = new THREE.Mesh(torchGeometry, torchMaterial);
    this.torchLight = new THREE.PointLight(0xFF6600, 1 * SCALE.average(), 3 * SCALE.average());
    this.geometry = new THREE.Geometry();
    this.torches = [];
}

/**
 * Adds a torch to the scene at a specified position and angle.
 * @param {THREE.Vector3} pos - The position to place the torch.
 * @param {number} angle - The angle to rotate the torch.
 */
TorchBuilder.prototype.addTorch = function(pos, angle) {
    this.torches.push(new Torch(pos, angle, this));
};

/**
 * Finalizes the torch creation process and adds them to the scene.
 */
TorchBuilder.prototype.finish = function() {
    const geom = new THREE.BufferGeometry().fromGeometry(this.geometry);
    geom.computeBoundingSphere();
    const mesh = new THREE.Mesh(geom, this.torchMesh.material);
    scene.add(mesh);
};

/**
 * Represents a single torch in the game.
 * @param {THREE.Vector3} pos - The position of the torch.
 * @param {number} angle - The angle of the torch.
 * @param {TorchBuilder} torchBuilder - The TorchBuilder instance.
 */
function Torch(pos, angle, torchBuilder) {
    const torchPos = torchBuilder.initialTorchPos.clone();
    const lightPos = torchBuilder.initialLightPos.clone();
    const rotationVec = new THREE.Vector3(0, 0, 0.39);

    torchPos.rotateToY(angle);
    lightPos.rotateToY(angle);
    rotationVec.rotateY(angle);

    pos.multiply(SCALE);
    torchPos.add(pos);
    lightPos.add(pos);

    const torch = torchBuilder.torchMesh.clone();
    torch.position.copy(torchPos);
    torch.rotation.setFromVector3(rotationVec);

    torchBuilder.geometry.mergeMesh(torch);

    this.light = torchBuilder.torchLight.clone();
    this.light.position.copy(lightPos);
    scene.add(this.light);
}