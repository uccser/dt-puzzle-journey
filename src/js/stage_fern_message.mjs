// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, setSvgElementAnchor, addStylesToSvg } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

// Leaf paths
import leaf_back_1 from '../img/leaf-1-back-no-dots.svg';
const LEAF_BACKS = [
    leaf_back_1,
]
import leaf_front_1 from '../img/leaf-1-front.svg';
const LEAF_FRONTS = [
    leaf_front_1,
]

const POSSIBLE_WORDS = [
    'toru',
    'rima',
    'whitu',
    'waru',
    'tekau',
    // Current program doesn't support words with 'ng' or 'wh'.
    // 'whā',
    // Possibly too easy
    // 'iwa',
];

const DECIMAL_DICTIONARY = {
    ' ': 0,
    'a': 1,
    'ā': 2,
    'e': 3,
    'ē': 4,
    'h': 5,
    'i': 6,
    'ī': 7,
    'k': 8,
    'm': 9,
    'n': 10,
    'ng': 11,
    'o': 12,
    'ō': 13,
    'p': 14,
    'r': 15,
    't': 16,
    'u': 17,
    'ū': 18,
    'w': 19,
    'wh': 20,
}

var message_word = window.sessionStorage.getItem('fern-message-word');


function start() {
    $('#stage-fern-message').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern message loaded.');
    }
    window.sessionStorage.setItem('fern-interactive-show-next', true);
    setup();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    $('#fern-message-previous-stage').on('click', { level_id: 'fern-interactive' }, end);
    $('#fern-message-next-stage').on('click', { level_id: 'unknown' }, end);

    // Get SVG
    var svg = getSvg('fern-message-svg');
    addStylesToSvg(svg);

    // Setup moss
    var moss = [svg.querySelector('#moss-1'), svg.querySelector('#moss-2')];
    moss.forEach(function (moss_element) {
        moss_element.classList.add('interactable');
        setSvgElementAnchor(moss_element);
        $(moss_element).on('click', function () {
            anime({
                targets: this,
                scaleY: '*=.8',
                easing: 'easeInOutQuad',
                duration: 250,
            });
        });
    });

    // Create word
    if (!message_word) {
        message_word = POSSIBLE_WORDS[Math.floor(Math.random() * POSSIBLE_WORDS.length)];
        createWordWithBranches(message_word);
    }
}


function createWordWithBranches(word) {
    console.log(word);
    var word_container = document.querySelector('#fern-message-container');
    for (let i = 0; i < word.length; i++) {
        var letter_container = document.createElement('div');
        letter_container.classList.add('letter-container');
        word_container.appendChild(letter_container);
        let letter = word.charAt(i);
        let letter_value = DECIMAL_DICTIONARY[letter];
        let binary_string = letter_value.toString(2).padStart(5, '0');
        for (let j = 0; j < binary_string.length; j++) {
            if (binary_string[j] == '0') {
                var image_path = LEAF_FRONTS[Math.floor(Math.random() * LEAF_FRONTS.length)];
            } else {
                var image_path = LEAF_BACKS[Math.floor(Math.random() * LEAF_BACKS.length)];
            }
            var digit_element = document.createElement('div');
            digit_element.classList.add('digit-element');
            digit_element.style.backgroundImage = 'url(' + image_path + ')';
            letter_container.appendChild(digit_element);
        }
    }
}


function end(event) {
    window.sessionStorage.setItem('fern-interactive-show-next', false);
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            $('#stage-fern-message').addClass('hidden');
            changeStage(event.data.level_id);
        }
    );
}


export { start };
