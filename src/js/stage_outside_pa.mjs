// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION, UI_FADE_DURATION, UI_STAGGER_DEFAULT } from './constants.mjs';
import { getSvg, animateSmoke, showUiElements, revealContentGuide } from './utilities.mjs';
import { playMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';


function start() {
    $('#stage-outside-pa').removeClass('hidden');
    if (DEBUG) {
        console.log('Outside pā loaded.');
    }
    setup();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, revealUi);
}


function setup() {
    playMusic('pa');
    var svg = getSvg('outside-pa-svg');

    // Animate smoke
    let fast_smoke = [
        svg.querySelector('#op-smoke-left-fast'),
        svg.querySelector('#op-smoke-right-fast'),
    ];
    let slow_smoke = [
        svg.querySelector('#op-smoke-left-slow'),
        svg.querySelector('#op-smoke-right-slow'),
    ];
    animateSmoke(fast_smoke, slow_smoke);

    // Animate fire glows
    animateFire(svg.querySelector('#op-fire-glow-1'), 0.9, 0.4);
    animateFire(svg.querySelector('#op-fire-glow-2'), 0.3, 0.15);
}


function animateFire(fire_element, opacity_high, opacity_low) {
    anime({
        targets: fire_element,
        opacity: [opacity_high, opacity_low],
        duration: function () {
            return anime.random(10, 50) * 10;
        },
        direction: 'alternate',
        easing: 'easeOutCubic',
        complete: function () {
            animateFire(fire_element, opacity_high, opacity_low);
        }
    });
}


function revealUi() {
    if (DEBUG) {
        console.log('Displaying Outside Pā UI.');
    }
    var ui_elements = Array.from(document.querySelector('#outside-pa-ui').children);
    showUiElements(ui_elements, UI_FADE_DURATION, UI_STAGGER_DEFAULT, revealContentGuide);
}


export { start };
