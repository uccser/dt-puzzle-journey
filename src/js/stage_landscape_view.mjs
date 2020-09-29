// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

const ZOOM_DURATION = 30000;
const SMOKE_FAST_DURATION = 12000;
const SMOKE_SLOW_DURATION = 26000;
const TEXT_FADE_DURATION = 1000;
const TEXT_GAP_DURATION = 1000;
const TEXT_DURATION = 4000;
const INITIAL_ZOOM = 10;
const INITIAL_ZOOM_DELAY = (TEXT_FADE_DURATION * 2) + 3000;

function start() {
    $('#stage-landscape-view').removeClass('hidden');

    $('#landscape-view-next-stage').on('click', function () {
        $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, end);
    });
    setup();
    $('#animation-blindfold').fadeOut(
        BLINDFOLD_FADE_DURATION * 5,
        animateLandscapeView
    );
}


function setup() {
    var svg_container = document.getElementById('landscape-view');
    svg_container.style.transform = `scale(${INITIAL_ZOOM})`;
    var svg = getSvg('landscape-view');
    animateSmoke(svg);
}


function animateLandscapeView() {
    if (DEBUG) {
        console.log('Landscape view loaded.');
    }
    var svg_container = document.getElementById('landscape-view');
    var text_container = document.getElementById('landscape-ui-narrative-text');
    var next_stage_button = document.getElementById('landscape-view-next-stage');
    setText('It is time to return home to my whānau after a long time away...');
    anime({
        targets: svg_container,
        scale: [INITIAL_ZOOM, 1],
        easing: 'easeInOutSine',
        duration: ZOOM_DURATION,
        delay: INITIAL_ZOOM_DELAY,
    });
    anime.timeline({
        easing: 'linear',
        duration: TEXT_FADE_DURATION,
    }).add({
        // Show text "It's is time to return home..."
        targets: text_container,
        opacity: [0, 1],
    }).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("I've been travelling for days now, but the pā is just at the end of this valley.");
        },
    }, `+=${TEXT_DURATION}`).add({
        // Show text "I've been travelling..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION}`).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("I'll need to cross the plains...");
        },
    }, `+=${TEXT_DURATION}`).add({
        // Show text "I'll need to cross..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION * 5}`).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("...a river...");
        },
    }, `+=${TEXT_DURATION * 0.8}`).add({
        // Show text "...a river..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION}`).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("...but first I have to find the correct path through the forest.");
        },
    }, `+=${TEXT_DURATION * 0.5}`).add({
        // Show text "...but first I have..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION}`).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("My whānau told me that I will come across a secret message informing me which rimu tree to look for to find the river crossing.");
        },
    }, `+=${TEXT_DURATION * 0.8}`).add({
        // Show text "My whānau told me..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION}`).add({
        targets: text_container,
        opacity: [1, 0],
        complete: function () {
            setText("Not far to go now...");
            next_stage_button.style.display = 'block';
        },
    }, `+=${TEXT_DURATION * 1.6}`).add({
        // Show text "Not far to go now..."
        targets: text_container,
        opacity: [0, 1],
    }, `+=${TEXT_GAP_DURATION}`).add({
        targets: next_stage_button,
        opacity: [0, 1],
    });
}


function setText(string) {
    var text_container = document.getElementById('landscape-ui-narrative-text');
    text_container.innerText = string;
}


function animateSmoke(svg) {
    var smoke_left_fast = svg.querySelector('#lv-smoke-left-fast');
    var smoke_right_fast = svg.querySelector('#lv-smoke-right-fast');
    var smoke_left_slow = svg.querySelector('#lv-smoke-left-slow');
    var smoke_right_slow = svg.querySelector('#lv-smoke-right-slow');
    anime({
        targets: smoke_left_fast,
        strokeDashoffset: [0, anime.setDashoffset],
        easing: 'linear',
        duration: SMOKE_FAST_DURATION,
        loop: true
    });
    anime({
        targets: smoke_right_fast,
        strokeDashoffset: [0, anime.setDashoffset],
        easing: 'linear',
        duration: SMOKE_FAST_DURATION,
        loop: true
    });
    anime({
        targets: smoke_left_slow,
        strokeDashoffset: [0, anime.setDashoffset],
        easing: 'linear',
        duration: SMOKE_SLOW_DURATION,
        loop: true
    });
    anime({
        targets: smoke_right_slow,
        strokeDashoffset: [0, anime.setDashoffset],
        easing: 'linear',
        duration: SMOKE_SLOW_DURATION,
        loop: true
    });
}


function cleanUp() {
    document.getElementById('stage-landscape-view').innerHTML = '';
}


function end() {
    $('#stage-landscape-view').addClass('hidden');
    cleanUp();
    changeStage('fern-interactive');
}

export { start };
