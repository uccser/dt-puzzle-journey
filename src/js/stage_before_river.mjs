// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, setSvgElementAnchor, showUiElements } from './utilities.mjs';
import { playFX, playMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';


function start() {
    $('#stage-before-river').removeClass('hidden');
    if (DEBUG) {
        console.log('Before river loaded.');
    }
    setup();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, revealUi);
}


function setup() {
    playMusic('river');

    // Setup buttons
    $('#stage-before-river #before-river-next-stage').on('click', end);

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

    // Animate reeds
    var reeds = [
        svg.querySelector('#br-reeds-1'),
    ]
    reeds.forEach(function (reed_element) {
        setSvgElementAnchor(reed_element);
        reed_element.style.transformOrigin = 'bottom left';
    });
    anime({
        targets: reeds,
        skewX: [0, '-10deg'],
        duration: 1800,
        direction: 'alternate',
        easing: 'cubicBezier(1,0,.82,1.16)',
        loop: true,
    });
}



function revealUi() {
    if (DEBUG) {
        console.log('Displaying Before River UI.');
    }
    var ui_elements = Array.from(document.querySelector('#before-river-ui').children)
    ui_elements.push(document.getElementById('before-river-next-stage'));
    showUiElements(ui_elements);
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
