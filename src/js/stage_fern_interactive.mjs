// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

function start() {
    $('#stage-fern').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern interactive loaded.');
    }
    var svg = getSvg('fern-svg');
    animateAnts(svg);
    setupEvents();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setupEvents() {
    $('#fern-container').on('click', '.fern-leaf', function () {
        $(this).toggleClass('flipped');
        // updateDotCount();
    });

}


function animateAnts(svg) {
    var ants_1 = svg.querySelector('#ants-1');
    var ants_2 = svg.querySelector('#ants-2');
    anime({
        targets: ants_1,
        strokeDashoffset: [0, -ants_1.getTotalLength()],
        easing: 'linear',
        duration: 36000,
        loop: true
    });
    anime({
        targets: ants_2,
        strokeDashoffset: [0, ants_2.getTotalLength()],
        easing: 'linear',
        duration: 30000,
        loop: true
    });
}


export { start };
