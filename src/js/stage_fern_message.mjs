// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION, UI_FADE_DURATION, UI_STAGGER_DEFAULT } from './constants.mjs';
import {
    getSvg,
    changeStage,
    setSvgElementAnchor,
    addStylesToSvg,
    showUiElements,
    hideUiElements,
} from './utilities.mjs';
import { playMusic, stopMusic, playFX } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

// Leaf paths
import leaf_back_a from '../img/leaf-back-a.svg';
import leaf_back_b from '../img/leaf-back-b.svg';
import leaf_back_c from '../img/leaf-back-c.svg';
import leaf_back_1 from '../img/leaf-1-back.svg';
import leaf_back_2 from '../img/leaf-2-back.svg';
import leaf_back_4 from '../img/leaf-4-back.svg';
import leaf_back_8 from '../img/leaf-8-back.svg';
import leaf_back_16 from '../img/leaf-16-back.svg';
import leaf_front_a from '../img/leaf-front-a.svg';
import leaf_front_b from '../img/leaf-front-b.svg';
import leaf_front_c from '../img/leaf-front-c.svg';
const LEAF_BACKS = [
    leaf_back_a,
    leaf_back_b,
    leaf_back_c,
]
const LEAF_BACKS_WITH_DOTS = {
    1: leaf_back_1,
    2: leaf_back_2,
    4: leaf_back_4,
    8: leaf_back_8,
    16: leaf_back_16,
}
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
    // Possibly too easy
    // 'whā' as only 2 characters
    // 'iwa' as only 3 characters
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
var fm_require_setup = true;

function start() {
    $('#stage-fern-message').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern message loaded.');
    }
    window.sessionStorage.setItem('fern-interactive-show-next', true);
    if (fm_require_setup) {
        setup();
        fm_require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, displayUi);
}


function setup() {
    playMusic('forest');
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


function isFMSetup() {
    return !fm_require_setup;
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
    var ui_elements = Array.from(document.querySelectorAll('#fern-message-narrative-text .initial-text'));
    ui_elements.push(document.querySelector('#fern-message-narrative-text .instruction-text'));
    var secondary_ui_elements = Array.from(document.querySelector('#fern-message-narrative-text-final').children);
    console.log(ui_elements);
    console.log(secondary_ui_elements);

    showUiElements(ui_elements, UI_FADE_DURATION, UI_STAGGER_DEFAULT, displayControls);
    setTimeout(function () {
        hideUiElements(ui_elements, UI_FADE_DURATION, -500, function () {
            showUiElements(secondary_ui_elements);
        });
    }, SECONDARY_TEXT_START);
}

function displayControls() {
    var ui_elements = Array.from(document.querySelector('#fern-message-value-container').children);
    ui_elements.push(document.querySelector('#fern-message-check'));
    ui_elements.push(document.querySelector('#fern-message-previous-stage'));
    showUiElements(ui_elements, 1000, -500);
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
    var fern_back_count = 0;
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
            var image_path;
            if (binary_string[j] == '0') {
                image_path = LEAF_FRONTS[Math.floor(Math.random() * LEAF_FRONTS.length)];
            } else {
                fern_back_count++;
                if (fern_back_count % 3 == 1) {
                    let binary_value_position = binary_string.length - 1 - j;
                    let value = Math.pow(2, binary_value_position);
                    image_path = LEAF_BACKS_WITH_DOTS[value];
                } else {
                    image_path = LEAF_BACKS[Math.floor(Math.random() * LEAF_BACKS.length)];
                }
            }
            var digit_element = document.createElement('div');
            digit_element.classList.add('digit-element');
            digit_element.style.backgroundImage = 'url(' + image_path + ')';
            letter_container.appendChild(digit_element);
        }
        // Create dropdown for letter
        var letter_select = document.createElement('select');
        letter_select.classList.add('hidden-ui');
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
                return ['#deded1', '#acd890'];
            } else {
                return ['#deded1', '#e28686'];
            }
        },
        borderColor: function (element) {
            if (element.dataset.valid == 'true') {
                return '#4ba512';
            } else {
                return '#ce1919';
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
    var ui_elements_to_hide = Array.from(document.querySelectorAll('#fern-message-narrative-text'));
    var ui_elements_to_show = Array.from(document.querySelectorAll('#fern-message-narrative-text-final'));
    ui_elements_to_show.push(document.getElementById('fern-message-next-stage'));
    hideUiElements(ui_elements_to_hide, UI_FADE_DURATION, function () {
        showUiElements(ui_elements_to_show);
    });
}


function cleanUp() {
    document.getElementById('stage-fern-interactive').innerHTML = '';
    document.getElementById('stage-fern-message').innerHTML = '';
}


function end(event) {
    playFX('change-stage');
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            if (event.target.id == 'fern-message-next-stage') {
                stopMusic('forest');
                cleanUp();
            }
            $('#stage-fern-message').addClass('hidden');
            changeStage(event.data.level_id);
        }
    );
}


export { start, isFMSetup };
