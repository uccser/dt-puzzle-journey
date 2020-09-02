// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';


function start() {
    $('#stage-fern-message').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern message loaded.');
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


export { start };
