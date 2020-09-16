// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var require_setup = true;


function start() {
    $('#stage-plains').removeClass('hidden');
    if (DEBUG) {
        console.log('Plains loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    // Setup buttons
    $('#stage-plains #plains-next-stage').on('click', end);

    // TEMP
    displayContinueUi();
}


function displayContinueUi() {
    // TODO: Display narrative text, then reveal button.
    $('#stage-plains #plains-next-stage').fadeIn();
}

function end() {
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            location.assign("/complete/index.html");
        }
    );
}


export { start };
