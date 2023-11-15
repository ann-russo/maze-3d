/**
 * Asset manages the loading and storing of textures.
 */
const Asset = {
    textures: {},

    /**
     * Initializes the Asset manager by creating a texture loader.
     */
    init: function () {
        this.textureLoader = new THREE.TextureLoader();
    },

    /**
     * Loads a texture if not already loaded, or retrieves it from the cache.
     * @param {string} name - The name of the texture file.
     * @returns {THREE.Texture} The loaded texture.
     */
    texture: function (name) {
        if (!this.textures[name]) {
            this.textures[name] = this.textureLoader.load(
                "res/" + name,
                function (texture) {
                    // Handle successful loading
                },
                function (xhr) {
                    // Handle progress
                },
                function (error) {
                    console.warn("Couldn't load texture " + name + " with error: " + error);
                }
            );
        }
        return this.textures[name];
    }
};

// Initialize the Asset manager
Asset.init();
