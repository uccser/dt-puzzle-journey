// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { get_svg, get_svg_height } from './utilties.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

function start() {
    $('#stage-fern').removeClass('hidden');
    var landscape_svg = document.getElementById('fern-svg');
    landscape_svg.addEventListener('load', function () {
        if (DEBUG) {
            console.log('Fern loaded.');
        }
        var svg = get_svg('fern-svg');
        animate_ants(svg);
        $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
    });
}

function animate_ants(svg) {
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
