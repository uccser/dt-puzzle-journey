// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { changeStage, showUiElements } from './utilities.mjs';
import { playMusic, playFX } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';


function start() {
    $('#stage-before-plains').removeClass('hidden');
    if (DEBUG) {
        console.log('Before plains loaded.');
    }
    setup();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, revealUi);
}


function setup() {
    playMusic('plains');
    // Setup buttons
    $('#stage-before-plains #before-plains-next-stage').on('click', end);
}

function revealUi() {
    if (DEBUG) {
        console.log('Displaying Before Plains UI.');
    }
    var ui_elements = Array.from(document.querySelector('#before-plains-ui').children);
    ui_elements.push(document.getElementById('before-plains-next-stage'));
    showUiElements(ui_elements);
}


function cleanUp() {
    document.getElementById('stage-before-plains').innerHTML = '';
}


function end() {
    playFX('change-stage');
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
