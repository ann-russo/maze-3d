const theme_sound = new Audio('res/sound/theme_Song.m4a');
const start_voice = new Audio('res/sound/get_ready.mp3');
const lose_voice = new Audio('res/sound/Evil_Laugh.mp3');
const lose_song = new Audio('res/sound/Titanic_Song.mp3');
const success_sound = new Audio('res/sound/duft_des_sieges.mp3');
const left_by_entrance_sound = new Audio('res/sound/nur_gschaut.mp3');
const collide_sound = new Audio('res/sound/toutchie.mp3');
const walking_sound = 'res/sound/walking.mp3';
let isWalkingSoundPlaying;
let audioContext;

/**
 * Plays the start voice.
 */
function playStartVoice() {
    start_voice.volume = 0.7;
    start_voice.play().catch(e => console.error('Error playing start voice:', e));
}

/**
 * Plays the theme music on repeat.
 */
function playThemeSong() {
    theme_sound.volume = 0.2;
    theme_sound.loop = true;
    theme_sound.play().catch(e => console.error('Error playing theme sound:', e));
}

function playEntranceSound() {
    left_by_entrance_sound.volume = 1;
    left_by_entrance_sound.play().catch(e => console.error('Error playing entrance sound:', e));
}

/**
 * Plays the collision sound.
 */
function playCollisionSound() {
    collide_sound.volume = 1;
    collide_sound.play().then(r => console.info("Played collision sound"));
}

/**
 * Plays the theme music on repeat.
 */
function playSuccessSound() {
    success_sound.volume = 1;
    success_sound.load();
    success_sound.play().catch(e => console.error('Error playing success sound:', e));
}

/**
 * Plays a voice and song when the player loses.
 */
function playLoseSound() {
    theme_sound.pause();

    lose_voice.volume = 0.5;
    lose_voice.play().catch(e => console.error('Error playing lose voice‚:', e));

    lose_song.volume = 0.7;
    lose_song.play().catch(e => console.error('Error playing lose song:', e));
}

/**
 * Plays a walking sound when the player moves.
 * @param {number} moveSpeed - The speed of the player's movement.
 */
async function playWalkingSound(moveSpeed) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // If the sound is already playing, exit the function
    if (isWalkingSoundPlaying) {
        return;
    }

    isWalkingSoundPlaying = true;

    // Loads the walking sound file and @returns {Promise<AudioBuffer>}
    const walkingBuffer = await (async () => {
        try {
            const response = await fetch(walking_sound);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await audioContext.decodeAudioData(arrayBuffer);
            return buffer;
        } catch (error) {
            console.error('Error loading walking audio:', error);
        }
    })();

    const source = audioContext.createBufferSource();
    source.buffer = walkingBuffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    try {
        const speedMultiplier = 80;
        const playbackRateValue = 0.4 * moveSpeed * speedMultiplier;
        source.playbackRate.value = playbackRateValue;

        const duration = source.buffer.duration / playbackRateValue;
        source.start(0);

        setTimeout(() => {
            isWalkingSoundPlaying = false;
        }, duration * 750);
    } catch (error) {
        console.error("Error playing walking audio:", error);
        isWalkingSoundPlaying = false;
    }
}
