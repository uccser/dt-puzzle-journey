// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, getRandomInt } from './utilities.mjs';
import { isFMSetup } from './stage_fern_message.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var card_interactions = 0;
var require_setup = true;
var first_digit_ants_element, second_digit_ants_element;
var ant_puzzle_data = {
    puzzles: [
        runAntPuzzlesPart1,
        runAntPuzzlesPart2,
        runAntPuzzlesPart3,
    ],
    unstarted: true,
    completed: false,
};
const REQUIRED_CARD_INTERACTIONS = 3;
const DIGIT_ANT_SPEED = 20000;
const DIGIT_ANT_TRANSITION = 5000;
const DIGIT_POSITIONS = {
    10: [1640, 620],  // Position for 10's place
    1: [1740, 620],  // Position for 1's place
    'blank': [1690, 800],  // Position for empty space
}
// Created with https://yqnn.github.io/svg-path-editor/
// Maximum 40 wide and 50 height.
// Doesn't include M node as this is set dynamically, all other nodes are relative.
// Start point should be at top center.
const DIGIT_PATHS = {
    'blank': 'c -2 0 -3 0 -5 0 c -2 0 -6 0 -8 0 c -3 0 -1 -1 1 -1 c 2 0 3 0 7 0 c 4 0 9 0 15 0 c 7 0 6 1 -3 1 z',
    0: 'c 19 1 27 13 35 25 c 9 15 9 67 4 87 c -3 14 -13 35 -42 35 c -29 0 -42 -47 -41 -73 c -1 -39 13 -74 42 -74 z',
    1: 'c 4 -2 3 6 3 15 c -1 50 0 60 0 73 c 0 14 -1 33 -1 46 c 0 10 -6 4 -5 -1 c 0 -12 0 -27 -1 -60 c -1 -37 1 -75 4 -73 z',
    2: 'c 10 -1 49 -3 1 61 c -80 75 -41 61 -1 62 c 61 -2 30 9 -25 7 c -58 0 -25 -25 22 -71 c 51 -49 2 -72 -42 -42 c -18 11 -5 -15 44 -17 z',
    3: 'c 22 -2 54 1 52 36 c -1 26 -24 34 -49 33 c -14 -1 -15 8 1 7 c 61 3 85 65 -5 69 c -33 -1 47 37 52 -70 c 11 -109 -95 -74 -51 -75 z',
    4: 'c 27 -1 10 117 10 123 c 0 20 -4 12 -4 -4 c -3 -27 32 -172 -36 -91 c -19 24 -12 39 24 40 c 93 3 44 8 0 5 c -50 -1 -53 -39 5 -73 z',
    5: 'c -13 0 -20 70 -3 68 c 53 -6 126 49 4 64 c -15 3 -13 7 2 5 c 105 -13 71 -77 -3 -73 c -14 0 -8 -62 1 -61 c 75 2 68 -4 29 -3 z',
    6: 'c 3 -6 6 -3 -16 39 c -24 37 -13 37 -7 31 c 12 -11 45 -1 54 10 c 9 12 17 57 -33 60 c -32 0 -50 -14 -38 -60 c 14 -41 36 -75 40 -80 z',
    7: 'c 14 0 23 0 38 1 c 29 -1 -38 101 -49 122 c -12 25 -28 24 -13 1 c 15 -27 31 -56 36 -68 c 25 -54 35 -47 -22 -47 c -49 0 -67 -11 3 -9 z',
    8: 'c 20 -1 32 6 33 25 c 3 69 -68 27 -68 85 c 0 19 5 36 35 37 c 19 0 41 -8 38 -39 c -6 -46 -74 -21 -78 -77 c 0 -28 32 -31 38 -31 z',
    9: 'c -3 0 -26 -1 -26 28 c 2 24 3 38 53 30 c 2 25 -3 60 -6 74 c -1 10 2 14 5 0 c 6 -28 9 -75 9 -102 c 0 -18 -6 -30 -34 -30 z',
}


function start() {
    $('#stage-fern-interactive').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern interactive loaded.');
    }
    if (require_setup) {
        setup();
        displayUi();
        require_setup = false;
    }
    if (isFMSetup()) {
        showNextStageButton();
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    // Setup ants
    var svg = getSvg('fern-svg');
    first_digit_ants_element = svg.querySelector('#fi-ants-10-digit');
    second_digit_ants_element = svg.querySelector('#fi-ants-1-digit');
    var blank_path = getDigitPath('blank', 'blank');
    first_digit_ants_element.setAttribute('d', blank_path);
    second_digit_ants_element.setAttribute('d', blank_path);
    animateAnts(svg);

    // Other elements
    $('#fern-container').on('click', '.fern-leaf', function () {
        $(this).toggleClass('flipped');
        card_interactions++;
        updateDotCount();
        if (!ant_puzzle_data.completed) {
            if (ant_puzzle_data.unstarted && card_interactions >= REQUIRED_CARD_INTERACTIONS) {
                ant_puzzle_data.unstarted = false;
                ant_puzzle_data.puzzles.shift()();
            } else if (getDotCount() == ant_puzzle_data.current_goal) {
                ant_puzzle_data.puzzles.shift()();
            }
        }
    });
    $('#fern-next-stage').on('click', end);
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Fern Interactive UI.');
    }
    var ui_elements = Array.from(document.querySelectorAll('#fern-interactive-ui-1 .narrative-text'));
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(2500, { start: BLINDFOLD_FADE_DURATION }),
        easing: 'linear',
    });
}


function runAntPuzzlesPart1() {
    ant_puzzle_data.current_goal = getRandomInt(3, 31);
    if (ant_puzzle_data.current_goal == getDotCount()) {
        ant_puzzle_data.current_goal++;
    }
    document.getElementById('ant-puzzle-1-goal').innerText = ant_puzzle_data.current_goal;
    var ui_elements = Array.from(document.querySelectorAll('#fern-interactive-ui-2 .ant-text-1'));
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(2500),
        easing: 'linear',
    });
}


function runAntPuzzlesPart2() {
    ant_puzzle_data.current_goal = getRandomInt(0, 27);
    if (ant_puzzle_data.current_goal & 2 == 0) {
        ant_puzzle_data.current_goal++;
    }
    if (ant_puzzle_data.current_goal == getDotCount()) {
        ant_puzzle_data.current_goal += 2;
    }
    document.getElementById('ant-puzzle-2-goal').innerText = ant_puzzle_data.current_goal;
    var ui_elements = Array.from(document.querySelectorAll('#fern-interactive-ui-2 .ant-text-2'));
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(2000, { start: DIGIT_ANT_TRANSITION * 0.1 }),
        easing: 'linear',
    });
}


function runAntPuzzlesPart3() {
    ant_puzzle_data.completed = true;
    var ui_elements = Array.from(document.querySelectorAll('#fern-interactive-ui-2 .ant-text-3'));
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: DIGIT_ANT_TRANSITION * 0.1,
        easing: 'linear',
        complete: showNextStageButton,
    });
}


function showNextStageButton() {
    var ui_elements = document.querySelector('#stage-fern-interactive #fern-next-stage');
    $(ui_elements).css('visibility', 'visible');
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(3000),
        easing: 'linear',
    });
}


function getDotCount() {
    let dot_count = 0;
    let cards = document.querySelectorAll('#stage-fern-interactive .fern-leaf');
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('flipped')) {
            dot_count += parseInt(card.dataset.value);
        }
    }
    return dot_count;
}



function updateDotCount() {
    let dot_count = getDotCount();
    let count_text = dot_count.toString().padStart(2, '0');
    let tens_digit_path = getDigitPath(count_text[0], 10);
    let ones_digit_path = getDigitPath(count_text[1], 1);
    anime({
        targets: first_digit_ants_element,
        d: [ { value: tens_digit_path } ],
        easing: 'easeInOutSine',
        duration: DIGIT_ANT_TRANSITION,
    });
    anime({
        targets: second_digit_ants_element,
        d: [{ value: ones_digit_path } ],
        easing: 'easeInOutSine',
        duration: DIGIT_ANT_TRANSITION,
    });
};


function getDigitPath(digit, place) {
    let digit_path, x_coord, y_coord;
    if (place == 10 && digit == 0) {
        digit_path = DIGIT_PATHS['blank'];
        [x_coord, y_coord] = DIGIT_POSITIONS['blank'];
    } else {
        digit_path = DIGIT_PATHS[digit];
        [x_coord, y_coord] = DIGIT_POSITIONS[place];
    }
    return `M ${x_coord} ${y_coord} ${digit_path}`;
}


function animateAnts(svg) {
    var ants_1 = svg.querySelector('#fi-ants-1');
    var ants_2 = svg.querySelector('#fi-ants-2');
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
    anime({
        targets: first_digit_ants_element,
        strokeDashoffset: [0, -first_digit_ants_element.getTotalLength() * 10],
        easing: 'linear',
        duration: DIGIT_ANT_SPEED,
        loop: true
    });
    anime({
        targets: second_digit_ants_element,
        strokeDashoffset: [0, second_digit_ants_element.getTotalLength() * 10],
        easing: 'linear',
        duration: DIGIT_ANT_SPEED,
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
