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


const TEXT_FADE_DURATION = 1000;
const TEXT_GAP_DURATION = 1000;
const TEXT_DURATION = 4000;
const INITIAL_ZOOM = 18;
const INITIAL_ZOOM_DELAY = 1000;
const ZOOM_DURATION = 53000 - INITIAL_ZOOM_DELAY;
var text_container = document.getElementById('landscape-ui-narrative-text');
var text_lines = [
    "After a long time away, I'll finally return home to my whanau.",
    "I've been travelling for days now, but the pā is just at the end of this valley.",
    "I'll need to cross the plains...",
    "...and a river...",
    "...but first I have to find the correct path through the forest.",
    "My whanau told me I will come across a secret message: Which rimu tree to look for to find the river crossing.",
    "Not far to go now...",
];


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

    var line_allocated_time = ZOOM_DURATION / text_lines.length;
    var line_fade = line_allocated_time * 0.2;
    var line_duration = line_allocated_time * 0.6;
    revealLine(0, line_fade, line_duration);
}


function revealLine(i, line_fade, line_duration) {
    setText(text_lines[i]);
    showUiElements(
        text_container,
        line_fade,
        0,
        function () {
            if (i < text_lines.length - 1) {
                setTimeout( function () {
                    hideUiElements(
                        text_container,
                        line_fade,
                        0,
                        function () {
                            revealLine(i + 1, line_fade, line_duration);
                        }
                    );
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


function setText(string) {
    text_container.innerText = string;
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
