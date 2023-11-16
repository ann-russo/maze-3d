const theme_sound = new Audio('res/sound/theme_Song.m4a');
const start_voice = new Audio('res/sound/get_ready.mp3');
const lose_voice = new Audio('res/sound/Evil_Laugh.mp3');
const lose_song = new Audio('res/sound/Titanic_Song.mp3');
const success_sound = new Audio('res/sound/duft_des_sieges.mp3');
const left_by_entrance_sound = new Audio('res/sound/nur_gschaut.mp3');
const collide_sound = new Audio('res/sound/toutchie.mp3');

collide_sound.load();
left_by_entrance_sound.load();

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