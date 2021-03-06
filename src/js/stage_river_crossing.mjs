// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION, UI_FADE_DURATION } from './constants.mjs';
import {
    getSvg,
    changeStage,
    showUiElements,
    hideUiElements,
    setSvgElementAnchor
} from './utilities.mjs';
import { playFX, playMusic, stopMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import dragula from 'dragula/dragula.js';

var rope_data, hint_timeout;
var require_setup = true;
const HINT_DELAY = 60000;
const EEL_SPEED = 35000;

function start() {
    $('#stage-river-crossing').removeClass('hidden');
    if (DEBUG) {
        console.log('River crossing loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, displayUi);
}


function setup() {
    playMusic('river');
    // Get SVG
    var svg = getSvg('river-crossing-svg');

    // Animate water
    var water_top = svg.querySelector('#rc-water-top');
    var water_middle = svg.querySelector('#rc-water-middle');
    anime({
        targets: water_top,
        translateY: ['-66.6%', '0%'],
        easing: 'linear',
        duration: 4000,
        loop: true
    });
    anime({
        targets: water_middle,
        translateY: ['-66.6%', '0%'],
        easing: 'linear',
        duration: 8000,
        loop: true
    });

    // Animate reeds
    var reeds = [
        svg.querySelector('#rc-reeds-1'),
        svg.querySelector('#rc-reeds-2'),
        svg.querySelector('#rc-reeds-3'),
    ]
    reeds.forEach(function (reed_element) {
        setSvgElementAnchor(reed_element);
    });
    anime({
        targets: reeds,
        scaleY: [1.2, 2.6],
        duration: 1800,
        direction: 'alternate',
        easing: 'cubicBezier(1,0,.82,1.16)',
        loop: true,
    });

    // Animate eel
    let eel_container = svg.querySelector('#rc-eel');
    let eel = eel_container.querySelector('path');
    let eel_length = 9;
    let eel_path_length = eel.getTotalLength();
    eel.style.strokeDasharray = `${eel_length}%,${(1 - (eel_length / 100)) * eel_path_length}`;
    anime({
        targets: eel,
        strokeDashoffset: [0, anime.setDashoffset],
        easing: 'linear',
        duration: EEL_SPEED,
        loop: true
    });
    anime({
        targets: eel_container,
        translateY: ['-50%', '-10%'],
        easing: 'linear',
        duration: EEL_SPEED,
        loop: true
    });

    // Create ropes
    rope_data = {};
    createRopes();
    var rope_containers = document.querySelectorAll('.rope-container');
    var drake = dragula(Array.from(rope_containers), {
        mirrorContainer: document.querySelector('#stage-river-crossing'),
        direction: 'horizontal',
        moves: function (rope, source, handle, sibling) {
            return rope.classList.contains('draggable');
        },
        accepts: function (rope, target, source, sibling) {
            return !isRopeCompleted(target);
        },
    });
    drake.on('drag', function () {
        playFX('rope-pickup');
    });
    drake.on('dragend', function () {
        checkBridgeComplete();
    });
    drake.on('drop', function (el, target, source, sibling) {
        playRopeSound(target);
    });
    drake.on('cancel', function (el, container, source) {
        playRopeSound(container);
    });
    // Thanks to Constantin for the following: https://stackoverflow.com/a/59340712
    drake.on('shadow', function (el, container, source) {
        // check if the shadow copy is not already the last child of the container
        if (el !== container.children[container.children.length - 1]) {
            // otherwise: make it so
            container.appendChild(el);
        }
    })

    // Setup buttons
    $('#stage-river-crossing #river-crossing-next-stage').on('click', end);
    $('#stage-river-crossing #river-crossing-help-me').on('click', hintRopes);

    if (DEBUG) {
        console.log('River crossing setup complete.');
    }
}


function playRopeSound(container) {
    if (container.classList.contains('rope-bridge')) {
        playFX('rope-creak');

    } else {
        playFX('rope-pickup');
    }
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying River Crossing UI.');
    }
    // Reveal UI elements
    var ui_elements = Array.from(document.querySelector('#river-crossing-narrative-text').children);
    showUiElements(ui_elements);
    hint_timeout = setTimeout(function () {
        var hint_element = document.getElementById('river-crossing-help-me');
        showUiElements(hint_element);
    }, HINT_DELAY);
}


function checkBridgeComplete(el) {
    var rope_container_top = document.querySelector('#river-crossing-rope-top');
    var rope_container_middle = document.querySelector('#river-crossing-rope-middle');
    var rope_container_bottom = document.querySelector('#river-crossing-rope-bottom');

    var top_complete = isRopeCompleted(rope_container_top);
    var middle_complete = isRopeCompleted(rope_container_middle);
    var bottom_complete = isRopeCompleted(rope_container_bottom);

    if (top_complete && middle_complete && bottom_complete) {
        displayContinueUi();
    }
}


function isRopeCompleted(rope_container) {
    var total_rope_length = getTotalRopeLength(rope_container);
    return total_rope_length >= parseInt(rope_container.dataset.capacity);
}


function getTotalRopeLength(rope_container) {
    var total_length = 0;
    var ropes = rope_container.children;
    for (var i = 0; i < ropes.length; i++) {
        var rope = ropes[i];
        total_length += parseInt(rope.dataset.length);
    }
    return total_length;
}


function createRopes() {
    var rope_lengths = createRopeLengths();
    var initial_container = document.querySelector('#river-crossing-bank');
    for (let i = 0; i < rope_lengths.length; i++) {
        let length = rope_lengths[i];
        let rope_element = document.createElement('div');
        rope_element.dataset.length = length;
        rope_element.classList.add('rope', 'draggable');
        rope_element.style.flexBasis = length.toString() + '%';

        let value_element = document.createElement('div');
        value_element.classList.add('rope-value');
        value_element.innerText = (length / 10).toString() + 'm';
        rope_element.appendChild(value_element);

        initial_container.appendChild(rope_element);
    }
}


function createRopeLengths() {
    // Create 7 rope lengths, creating three lots of 100cms.
    var rope_lengths = [];
    var initial_rope_lengths = [];
    // Length of one rope (multiple required for bridge).
    var combined_rope_length = 100;

    // Create one rope of 3 pieces
    let rope_total_length = 0;
    while (rope_lengths.length < 2) {
        let rope_length = anime.random(27, 38);
        rope_total_length += rope_length;
        rope_lengths.push(rope_length);
        if (rope_lengths.length == 1) {
            initial_rope_lengths.push(rope_length);
        }
    }
    let rope_remaining = combined_rope_length - rope_total_length;
    rope_lengths.push(rope_remaining);

    // Create two ropes of 3 pieces, where one piece is at least 50% the length
    for (let i = 0; i < 2; i++) {
        let rope_a = anime.random(51, 66);
        initial_rope_lengths.push(rope_a);
        let remaining = combined_rope_length - rope_a;
        let rope_b = Math.floor(anime.random(remaining * 0.5, remaining * 0.6));
        let rope_c = combined_rope_length - rope_a - rope_b;
        rope_lengths.push(rope_a, rope_b, rope_c);
    }
    rope_data.initial_rope_lengths = initial_rope_lengths;
    return shuffle(rope_lengths);
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function hintRopes() {
    var hint_rope_lengths = rope_data.initial_rope_lengths;
    var initial_container = document.querySelector('#river-crossing-bank');
    var rope_containers = [
        document.querySelector('#river-crossing-rope-top'),
        document.querySelector('#river-crossing-rope-middle'),
        document.querySelector('#river-crossing-rope-bottom'),
    ];
    for (let i = 0; i < rope_containers.length; i++) {
        initial_container.append(...rope_containers[i].childNodes);
    }
    for (let i = 0; i < hint_rope_lengths.length; i++) {
        let rope_length = hint_rope_lengths[i];
        let rope = document.querySelector(`#stage-river-crossing .rope[data-length="${rope_length}"]`);
        rope_containers[i].append(rope);
        rope.classList.remove('draggable');
    }
    playFX('rope-creak');
    hideUiElements(document.querySelector('#river-crossing-help-me'));
}


function displayContinueUi() {
    clearTimeout(hint_timeout);
    // Hide text, then display final text.
    var ui_elements_to_hide = Array.from(document.querySelector('#river-crossing-narrative-text').children);
    ui_elements_to_hide.push(document.getElementById('river-crossing-help-me'));
    var ui_elements_to_show = Array.from(document.querySelector('#river-crossing-narrative-text-final').children);
    ui_elements_to_show.push(document.getElementById('river-crossing-next-stage'));
    hideUiElements(ui_elements_to_hide, UI_FADE_DURATION, -500, function () {
        showUiElements(ui_elements_to_show);
    });
}


function cleanUp() {
    document.getElementById('stage-river-crossing').innerHTML = '';
}


function end() {
    playFX('change-stage');
    stopMusic('river');
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            cleanUp();
            $('#stage-river-crossing').addClass('hidden');
            changeStage('before-plains');
        }
    );
}


export { start };
