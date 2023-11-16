Math.TAU = Math.PI * 2.0;

const Direction =
    {
        North: 1,
        East: 0,
        South: 3,
        West: 2
    };

const DirectionToAngle = function (dir) {
    return Math.TAU * dir / 4;
};

// Rotates this vector to theta.
THREE.Vector3.prototype.rotateToY = function(theta) {
    const ox = this.x;
    this.x = ox * Math.cos(theta);
    this.z = ox * Math.sin(theta);
};

// Rotates this vector by theta.
THREE.Vector3.prototype.rotateY = function(theta) {
    const s = Math.sin(theta);
    const c = Math.cos(theta);

    const ox = this.x, oz = this.z;
    this.x = ox * c - oz * s;
    this.z = oz * c + ox * s;
};

// Gets the average of the vector's components.
THREE.Vector3.prototype.average = function() {
    return (this.x + this.y + this.z) / 3;
};

// Clamps rotation
const rotclamp = function (r) {
    while (r >= Math.TAU) {
        r -= Math.TAU;
    }
    while (r <= -Math.TAU) {
        r += Math.TAU;
    }
    return r;
};
