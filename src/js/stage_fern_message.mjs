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
const SECONDARY_TEXT_START = 30000;

var message_word = '';
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
    displayUi();
}


function setup() {
    $('#fern-message-previous-stage').on('click', { level_id: 'fern-interactive' }, end);
    $('#fern-message-next-stage').on('click', { level_id: 'before-river' }, end);
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
    message_word = POSSIBLE_WORDS[Math.floor(Math.random() * POSSIBLE_WORDS.length)];
    createWordWithBranches(message_word);
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Fern Message UI.');
    }
    // Setup text for later
    document.querySelector('#fern-message-word').textContent = message_word;
    let word_translation = WORD_TRANSLATIONS[message_word]
    document.querySelector('#fern-message-word-translation').textContent = word_translation;
    document.querySelector('#fern-message-word-sentence').textContent = word_translation;

    // Reveal UI elements
    var initial_text = Array.from(document.querySelectorAll('#fern-message-narrative-text .initial-text'))
    var secondary_text = Array.from(document.querySelectorAll('#fern-message-narrative-text .secondary-text'))
    var ui_elements_controls = [];
    var ui_elements_text = initial_text.slice();
    ui_elements_text.push(document.querySelector('#fern-message-narrative-text .instruction-text'));
    ui_elements_controls.push(Array.from(document.querySelector('#fern-message-value-container').children));
    ui_elements_controls.push(document.querySelector('#fern-message-check'));

    $(ui_elements_text).css('visibility', 'visible');
    $(ui_elements_controls).css('visibility', 'visible');
    anime.timeline({
        duration: 1000,
        opacity: 1,
        easing: 'linear',
    }).add({
        targets: ui_elements_text,
        delay: anime.stagger(3000, {start: BLINDFOLD_FADE_DURATION}),
        opacity: 1,
    }).add({
        targets: ui_elements_controls,
        opacity: 1,
        delay: anime.stagger(500),
    }).add({
        // Hide initial text, then display secondary text after timer.
        targets: initial_text,
        opacity: 0,
    }, `+=${SECONDARY_TEXT_START}`).add({
        targets: secondary_text,
        opacity: 1,
    });
}


function animateAnts(svg) {
    var ants = svg.querySelector('#fm-ants');
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
    // Hide text, then display final text.
    var other_text = Array.from(document.querySelectorAll('#fern-message-narrative-text'))
    var final_text = Array.from(document.querySelectorAll('#fern-message-narrative-text-final'))
    anime.timeline({
        duration: 1000,
        opacity: 1,
        easing: 'linear',
        complete: function () {
            $('#stage-fern-message #fern-message-next-stage').fadeIn();
        },
    }).add({
        targets: other_text,
        opacity: 0,
    }).add({
        targets: final_text,
        opacity: 1,
    });
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