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

const WORD_TRANSLATIONS = {
    'toru': 'three',
    'rima': 'five',
    'whitu': 'seven',
    'waru': 'eight',
    'tekau': 'ten',
}

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
// Letters that use two characters
const DOUBLE_LETTER_DICTIONARY = [
    'ng',
    'wh',
]

var message_word = window.sessionStorage.getItem('fern-message-word');
var message_values = [];
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
    $('#fern-message-next-stage').on('click', { level_id: 'river-crossing' }, end);
    $('#fern-message-check:not(:disabled)').on('click', checkValues);

    // Get SVG
    var svg = getSvg('fern-message-svg');
    addStylesToSvg(svg);
    animateAnts(svg);

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
        window.sessionStorage.setItem('fern-message-word', message_word);
    }
    createWordWithBranches(message_word);
    displayUi();
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Fern Message UI.');
    }
    var ui_elements = Array.from(document.querySelector('#fern-message-value-container').children);
    document.querySelector('#fern-message-word').textContent = message_word;
    document.querySelector('#fern-message-word-translation').textContent = WORD_TRANSLATIONS[message_word];
    ui_elements.push(document.querySelector('#fern-message-check'));
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(300, {start: BLINDFOLD_FADE_DURATION}),
        easing: 'linear',
    });
}


function animateAnts(svg) {
    var ants = svg.querySelector('#ants-2');
    anime({
        targets: ants,
        strokeDashoffset: [0, ants.getTotalLength()],
        easing: 'linear',
        duration: 80000,
        loop: true
    });
}


function createWordWithBranches(word) {
    var word_container = document.querySelector('#fern-message-word-container');
    var value_container = document.querySelector('#fern-message-value-container');
    for (let i = 0; i < word.length; i++) {
        // Create fern leaves for letter
        var letter_container = document.createElement('div');
        letter_container.classList.add('letter-container');
        word_container.appendChild(letter_container);
        var letter;
        if (DOUBLE_LETTER_DICTIONARY.includes(word.substring(i, i + 2))) {
            letter = word.substring(i, i + 2);
            i++;
        } else {
            letter = word.charAt(i);
        }
        let letter_value = DECIMAL_DICTIONARY.indexOf(letter) + 1;
        message_values.push(letter_value);
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
            letter_option.text = DECIMAL_DICTIONARY[k];
            letter_option.value = k + 1;
            letter_select.add(letter_option)
        }
        value_container.appendChild(letter_select);
    }
}


function checkValues() {
    if (DEBUG) {
        console.log(`Message is '${message_word}' which is ${message_values}.`);
    }
    let check_button = document.querySelector('#fern-message-check');
    check_button.setAttribute('disabled', 'disabled');
    let select_elements = document.querySelectorAll('#fern-message-value-container select');
    var values_correct = true;
    for (let i = 0; i < select_elements.length; i++) {
        let select = select_elements[i];
        let submitted_letter_value = select.options[select.selectedIndex].value;
        let correct_letter_value = message_values[i];
        if (submitted_letter_value == correct_letter_value) {
            select.dataset.valid = 'true';
        } else {
            select.dataset.valid = 'false';
            values_correct = false;
        }
    }
    anime({
        targets: select_elements,
        duration: 200,
        delay: anime.stagger(250),
        endDelay: 1000,
        direction: 'alternate',
        easing: 'linear',
        background: function (element) {
            if (element.dataset.valid == 'true') {
                return '#acd890';
            } else {
                return '#e28686'
            }
        },
        borderColor: function (element) {
            if (element.dataset.valid == 'true') {
                return '#4ba512';
            } else {
                return '#ce1919'
            }
        },
        begin: function() {
            var success_text = document.querySelector('#fern-message-feedback-success-text');
            var error_text = document.querySelector('#fern-message-feedback-error-text');
            if (values_correct) {
                // TODO: Use timeline to stagger these, including words in success text
                anime({
                    targets: success_text,
                    opacity: 1,
                    duration: 500,
                    easing: 'linear',
                });
                anime({
                    targets: error_text,
                    opacity: 0,
                    duration: 500,
                    easing: 'linear',
                });
            } else {
                anime({
                    targets: error_text,
                    opacity: 1,
                    duration: 500,
                    easing: 'linear',
                });
            }
        },
        complete: function () {
            if (values_correct) {
                displayContinueUi();
            } else {
                check_button.removeAttribute('disabled');
            }
        }
    });
}


function displayContinueUi() {
    // TODO: Display narrative text, then reveal button.
    $('#stage-fern-message #fern-message-next-stage').fadeIn();
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
