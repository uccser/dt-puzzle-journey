// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION, BLINDFOLD_SLOW_FADE_DURATION } from './constants.mjs';
import { getSvg, animateSmoke } from './utilities.mjs';
import { playMusic, playFX } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var require_setup = true;


function start() {
    $('#stage-before-pa').removeClass('hidden');
    if (DEBUG) {
        console.log('Before pā loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    playMusic('pa');
    var svg = getSvg('before-pa-svg');

    // Animate smoke
    let fast_smoke = [
        svg.querySelector('#bp-smoke-left-fast'),
        svg.querySelector('#bp-smoke-right-fast'),
    ];
    let slow_smoke = [
        svg.querySelector('#bp-smoke-left-slow'),
        svg.querySelector('#bp-smoke-right-slow'),
    ];
    animateSmoke(fast_smoke, slow_smoke);

    // Setup buttons
    $('#stage-before-pa #before-pa-next-stage').on('click', end);
    if (DEBUG) {
        console.log('Displaying Before Pā UI.');
    }
    var ui_elements = Array.from(document.querySelector('#before-pa-ui').children);
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
    $('#stage-before-pa #before-pa-next-stage').fadeIn();
}


function cleanUp() {
    document.getElementById('stage-before-pa').innerHTML = '';
}


function end() {
    playFX('change-stage');
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_SLOW_FADE_DURATION,
        function () {
            cleanUp();
            $('#stage-before-pa').addClass('hidden');
            // Completed all stages
            location.assign("./complete/index.html");
        }
    );
}


export { start };
