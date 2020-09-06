// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, setSvgElementAnchor, addStylesToSvg } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

// Leaf paths
import leaf_back_a from '../img/leaf-back-a.svg';
import leaf_back_b from '../img/leaf-back-b.svg';
import leaf_back_c from '../img/leaf-back-c.svg';
const LEAF_BACKS = [
    leaf_back_a,
    leaf_back_b,
    leaf_back_c,
]
import leaf_front_a from '../img/leaf-front-a.svg';
import leaf_front_b from '../img/leaf-front-b.svg';
import leaf_front_c from '../img/leaf-front-c.svg';
const LEAF_FRONTS = [
    leaf_front_a,
    leaf_front_b,
    leaf_front_c,
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

const DECIMAL_DICTIONARY = [
    'a',
    'ā',
    'e',
    'ē',
    'h',
    'i',
    'ī',
    'k',
    'm',
    'n',
    'ng',
    'o',
    'ō',
    'p',
    'r',
    't',
    'u',
    'ū',
    'w',
    'wh',
]

var message_word = window.sessionStorage.getItem('fern-message-word');
var require_setup = true;

function start() {
    $('#stage-fern-message').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern message loaded.');
    }
    window.sessionStorage.setItem('fern-interactive-show-next', true);
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    $('#fern-message-previous-stage').on('click', { level_id: 'fern-interactive' }, end);
    $('#fern-message-next-stage').on('click', { level_id: 'unknown' }, end);
    $('#fern-message-check').on('click', check_values);

    // Get SVG
    var svg = getSvg('fern-message-svg');
    addStylesToSvg(svg);

    // Setup moss
    var moss = Array.from(svg.querySelector('#moss').children);
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
        displayUi();
    }
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Fern Message UI.');
    }
    var ui_elements = Array.from(document.querySelector('#fern-message-value-container').children);
    ui_elements.push(document.querySelector('#fern-message-check'));
    $(ui_elements).css('visibility', 'visible');
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(500, {start: BLINDFOLD_FADE_DURATION}),
        easing: 'linear',
    });
}


function createWordWithBranches(word) {
    console.log(word);
    var word_container = document.querySelector('#fern-message-word-container');
    var value_container = document.querySelector('#fern-message-value-container');
    for (let i = 0; i < word.length; i++) {
        // Create fern leaves for letter
        var letter_container = document.createElement('div');
        letter_container.classList.add('letter-container');
        word_container.appendChild(letter_container);
        let letter = word.charAt(i);
        let letter_value = DECIMAL_DICTIONARY.indexOf(letter) + 1;
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
        // Create dropdown for letter
        var letter_select = document.createElement('select');
        for (let k = 0; k < DECIMAL_DICTIONARY.length; k++) {
            let letter_option = document.createElement('option');
            letter_option.text = letter_option.value = DECIMAL_DICTIONARY[k];
            letter_select.add(letter_option)
        }
        value_container.appendChild(letter_select);
    }
}


function check_values() {
    console.log(message_word);
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
