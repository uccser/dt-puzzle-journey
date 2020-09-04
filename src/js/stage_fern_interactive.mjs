// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var show_next =
    window.sessionStorage.getItem('fern-interactive-show-next') || false;
var card_interactions = 0;
const REQUIRED_CARD_INTERACTIONS = 5;


// Created with https://yqnn.github.io/svg-path-editor/
// Maximum 40 wide and 50 height
const DIGIT_POSITIONS = {
    10: [1600, 600],  // Position for 10's place
    1: [1750, 600],  // Position for 1's place
}
// Doesn't include M node as this is set dynamically, all other nodes are relative
const DIGIT_PATHS = {
    'blank': 'M 3.8 56 c 0 -0.6 0 -2 0 -2.8 c 0 -0.6 0 -1.6 0.2 -2.4 c 0.2 -1.2 0.2 0 0.2 0 c 0 1 -0.2 1.4 -0.2 2.6 c 0 0.4 0 0.6 0.2 4 c 0 3 -0.4 2.2 -0.4 -0.8 z',
    0: 'M 2 25 c 0 -5 2 -14 4 -17 c 3 -4 8 -6 12 -6 c 10 0 13 7 15 16 c 2 8 0 15 -2 21 c -2 3 -6 11 -15 11 c -9 0 -13 -13 -14 -24 z',
    1: 'M 19 30 c 0 -3 0 -10 0 -14 c 0 -3 0 -8 1 -12 c 1 -6 1 0 1 0 c 0 5 -1 7 -1 13 c 0 2 0 3 1 20 c 0 15 -2 11 -2 -4 z',
    2: 'M 22 24 c 13.5 -16.5 9 -28.5 -10.5 -15 c -15 9 -7.5 1.5 0 -1.5 c 24 -13.5 19.5 1.5 18 6 c -13.5 28.5 -43.5 36 -7.5 34.5 c 10.5 0 24 1.5 -1.5 1.5 c -19.5 -1.5 -27 6 0 -24 z',
    3: 'M 16 27 c 18 -1.8 27 -26 0 -21.9 c -7 2 -7 0 0 -1 c 24 -5.4 28 21.6 -1 24.9 c 26 1.8 32 23.4 0 25.2 c 0 0 -14 1.8 0 -1.8 c 50 -18 -20 -19.8 1 -25.4 z',
    4: 'M 21 31 c 2 -40 0 -32 -15 -14 c -10 10 -4 10 15 10 c 26 -1 20 1 0 1 c -24 0 -25 -1 -11 -17 c 13 -15 12 -17 12 20 c -1 27 -2 22 -1 2 z',
    7: 'm 26 21 c 0 -1 2 -8 3 -11 c 1 -2 -1 -6 -20 -1 c -9 3 -4 -2 17 -4 c 6 -1 7 0 4 6 c -1 2 -3 2 -5 27 c -1 11 -4 9 1 -17 z',
    8: 'M 19 25 c 25 -19 11 -23 2 -23 c -9 0 -19 6 -11 15 c 6 6 19 11 20 18 c 1 9 -1 14 -9 15 c -7 1 -12 -3 -13 -7 c -2 -6 4 -12 10 -17 z',
    9: 'm 26 25 c 0 -20 3 -25 -11 -23 c -13 0 -17 19 -1 19 c 7 -1 10 -4 11 1 c 0 6 0 12 0 19 c 0 3 1 5 1 -1 c 0 1 0 -9 0 -14 z',

    5: 'M 21 31 c 2 -40 0 -32 -15 -14 c -10 10 -4 10 15 10 c 26 -1 20 1 0 1 c -24 0 -25 -1 -11 -17 c 13 -15 12 -17 12 20 c -1 27 -2 22 -1 2 z',
    6: 'm 6 23 c 3 -6 7 -13 12 -17 c 5 -3 7 -1 1 1 c -4 1 -16 20 -11 20 c 23 -5 19 8 13 14 c -5 5 -11 3 -15 1 c -7 -4 -4 -10 -2 -15 z',
}


function getDigitPath(digit, place) {
    let digit_path = DIGIT_PATHS[digit];
    let x_coord, y_coord;
    [x_coord, y_coord] = DIGIT_POSITIONS[place];
    return `M ${x_coord} ${y_coord} ${digit_path}`;
}


function start() {
    $('#stage-fern-interactive').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern interactive loaded.');
    }
    var svg = getSvg('fern-svg');
    animateAnts(svg);
    setup();
    if (show_next) {
        show_next_stage_button();
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    $('#fern-container').on('click', '.fern-leaf', function () {
        $(this).toggleClass('flipped');
        card_interactions++;
        updateDotCount();
        if (!show_next && card_interactions >= REQUIRED_CARD_INTERACTIONS) {
            show_next_stage_button();
        }
    });
    $('#fern-next-stage').on('click', end);
    displayUi();
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Fern Interactive UI.');
    }
    var ui_elements = Array.from(document.querySelector('#fern-interactive-ui').children);
    $(ui_elements).css('visibility', 'visible');
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(2500, { start: BLINDFOLD_FADE_DURATION }),
        easing: 'linear',
    });
}


function show_next_stage_button() {
    $('#stage-fern-interactive #fern-next-stage').fadeIn();
    show_next = true;
    window.sessionStorage.setItem('fern-interactive-show-next', true);
}


function updateDotCount() {
    var dot_count = 0;
    var cards = document.querySelectorAll('#stage-fern-interactive .fern-leaf');
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('flipped')) {
            dot_count += parseInt(card.dataset.value);
        }
    }
    console.log(dot_count);
};


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


function end() {
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            $('#stage-fern-interactive').addClass('hidden');
            changeStage('fern-message');
        }
    );
}


export { start };
