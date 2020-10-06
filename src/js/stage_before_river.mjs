// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';
import { playFX, playMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var require_setup = true;


function start() {
    $('#stage-before-river').removeClass('hidden');
    if (DEBUG) {
        console.log('Before river loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    playMusic('river');

    // Setup buttons
    $('#stage-before-river #before-river-next-stage').on('click', end);
    if (DEBUG) {
        console.log('Displaying Before River UI.');
    }
    var ui_elements = Array.from(document.querySelector('#before-river-ui').children);
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(3000, { start: BLINDFOLD_FADE_DURATION }),
        easing: 'linear',
        complete: displayContinueUi,
    });

    // Get SVG
    var svg = getSvg('before-river-svg');

    // Animate water
    var water_top = svg.querySelector('#br-water-top');
    var water_middle = svg.querySelector('#br-water-middle');
    anime({
        targets: water_top,
        translateX: ['-66.6%', '0%'],
        easing: 'linear',
        duration: 4000,
        loop: true
    });
    anime({
        targets: water_middle,
        translateX: ['-66.6%', '0%'],
        easing: 'linear',
        duration: 8000,
        loop: true
    });
}


function displayContinueUi() {
    $('#stage-before-river #before-river-next-stage').fadeIn();
}


function cleanUp() {
    document.getElementById('stage-before-river').innerHTML = '';
}


function end() {
    playFX('change-stage');
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            cleanUp();
            $('#stage-before-river').addClass('hidden');
            changeStage('river-crossing');
        }
    );
}


export { start };
