// Import modules
import {
    DEBUG,
    UI_FADE_DURATION,
    UI_STAGGER_DEFAULT,
    BLINDFOLD_FADE_DURATION,
    BLINDFOLD_SLOW_FADE_DURATION,
} from './constants.mjs';
import {
    getSvg,
    changeStage,
    animateSmoke,
    showUiElements,
    hideUiElements,
} from './utilities.mjs';
import { playMusic, playFX } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

const INITIAL_ZOOM = 18;
const INITIAL_ZOOM_DELAY = 1000;
const ZOOM_DURATION = 53000 - INITIAL_ZOOM_DELAY;
const TEXT_CONTAINER = document.getElementById('landscape-ui-narrative-text');


function start() {
    $('#stage-landscape-view').removeClass('hidden');

    $('#landscape-view-next-stage').on('click', function () {
        $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, end);
    });
    setup();
    $('#animation-blindfold').fadeOut(
        BLINDFOLD_SLOW_FADE_DURATION,
        animateLandscapeView
    );
}


function setup() {
    playMusic('forest');
    playMusic('opening');
    var svg_container = document.getElementById('landscape-view-svg');
    svg_container.style.transform = `scale(${INITIAL_ZOOM})`;

    // Animate smoke
    var svg = getSvg('landscape-view-svg');
    var fast_smoke = [
        svg.querySelector('#lv-smoke-left-fast'),
        svg.querySelector('#lv-smoke-right-fast'),
    ];
    var slow_smoke = [
        svg.querySelector('#lv-smoke-left-slow'),
        svg.querySelector('#lv-smoke-right-slow'),
    ];
    animateSmoke(fast_smoke, slow_smoke);
}


function animateLandscapeView() {
    if (DEBUG) {
        console.log('Landscape view loaded.');
    }
    var svg_container = document.getElementById('landscape-view-svg');
    anime({
        targets: svg_container,
        scale: [INITIAL_ZOOM, 1],
        easing: 'easeInOutSine',
        duration: ZOOM_DURATION,
        delay: INITIAL_ZOOM_DELAY,
    });

    var text_lines = Array.from(TEXT_CONTAINER.children);
    var line_allocated_time = ZOOM_DURATION / text_lines.length;
    var line_fade = line_allocated_time * 0.1;
    var line_duration = line_allocated_time * 0.9;
    revealLine(text_lines, line_fade, line_duration);
}


function revealLine(text_lines, line_fade, line_duration) {
    // Reveal line, get ready to reveal next
    var line_element = text_lines.shift();
    showUiElements(
        line_element,
        line_fade,
        0,
        function () {
            if (text_lines.length > 0) {
                setTimeout( function () {
                    revealLine(text_lines, line_fade, line_duration);
                    }, line_duration);
            } else {
                setTimeout(function () {
                    var next_stage_button = document.getElementById('landscape-view-next-stage');
                    showUiElements(next_stage_button);
                }, line_duration);
            }
        }
    );
}


function cleanUp() {
    document.getElementById('stage-landscape-view').innerHTML = '';
}


function end() {
    playFX('change-stage');
    $('#stage-landscape-view').addClass('hidden');
    cleanUp();
    changeStage('fern-interactive');
}

export { start };
