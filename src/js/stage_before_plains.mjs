// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var require_setup = true;


function start() {
    $('#stage-before-plains').removeClass('hidden');
    if (DEBUG) {
        console.log('Before plains loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    // Setup buttons
    $('#stage-before-plains #before-plains-next-stage').on('click', end);
    if (DEBUG) {
        console.log('Displaying Before Plains UI.');
    }
    var ui_elements = Array.from(document.querySelector('#before-plains-ui').children);
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(3000, { start: BLINDFOLD_FADE_DURATION }),
        easing: 'linear',
        complete: displayContinueUi,
    });
}


function displayContinueUi() {
    $('#stage-before-plains #before-plains-next-stage').fadeIn();
}


function cleanUp() {
    document.getElementById('stage-before-plains').innerHTML = '';
}


function end() {
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            cleanUp();
            $('#stage-before-plains').addClass('hidden');
            changeStage('plains-1');
        }
    );
}


export { start };
