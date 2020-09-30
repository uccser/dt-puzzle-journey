// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';
import { playFX, playMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import dragula from 'dragula/dragula.js';

var require_setup = true;
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
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
    displayUi();
}


function setup() {
    playMusic('river');
    // Get SVG
    var svg = getSvg('river-crossing-svg');

    // Animate water
    var water_top = svg.querySelector('#water-top');
    var water_middle = svg.querySelector('#water-middle');
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

    // Animate eel
    let eel_container = svg.querySelector('#rc-eel');
    let eel = eel_container.querySelector('path');
    let eel_length = 12;
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
    createRopes();
    var rope_containers = document.querySelectorAll('.rope-container');
    var drake = dragula(Array.from(rope_containers), {
        mirrorContainer: document.querySelector('#stage-river-crossing'),
        direction: 'horizontal',
        accepts: function (rope, target, source, sibling) {
            return !isRopeCompleted(target);
        },
    });
    drake.on('drag', function () {
        playFX('rope-creak');
    });
    drake.on('dragend', checkBridgeComplete);

    // Setup buttons
    $('#stage-river-crossing #river-crossing-next-stage').on('click', end);

    if (DEBUG) {
        console.log('River crossing setup complete.');
    }
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying River Crossing UI.');
    }
    // Reveal UI elements
    var ui_elements = Array.from(document.querySelector('#river-crossing-narrative-text').children);
    anime({
        targets: ui_elements,
        duration: 1000,
        opacity: 1,
        easing: 'linear',
        delay: anime.stagger(3000, { start: BLINDFOLD_FADE_DURATION }),
    });
}



function checkBridgeComplete(el) {
    playFX('rope-creak');
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
        rope_element.classList.add('rope');
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
    // Length of one rope (multiple required for bridge).
    var combined_rope_length = 100;

    // Create one rope of 2 pieces
    let rope_a = anime.random(51, 89);
    let rope_b = combined_rope_length - rope_a;
    rope_lengths.push(rope_a, rope_b);

    // Create two ropes of 3 pieces
    for (let i = 0; i < 2; i++) {
        let rope_a = anime.random(21, 66);
        let remaining = combined_rope_length - rope_a;
        let rope_b = Math.floor(anime.random(remaining * 0.4, remaining * 0.6));
        let rope_c = combined_rope_length - rope_a - rope_b;
        rope_lengths.push(rope_a, rope_b, rope_c);
    }

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


function displayContinueUi() {
    // Hide text, then display final text.
    var other_text = Array.from(document.querySelectorAll('#river-crossing-narrative-text'))
    var final_text = Array.from(document.querySelectorAll('#river-crossing-narrative-text-final'))
    anime.timeline({
        duration: 1000,
        opacity: 1,
        easing: 'linear',
        complete: function () {
            $('#stage-river-crossing #river-crossing-next-stage').fadeIn();
        },
    }).add({
        targets: other_text,
        opacity: 0,
    }).add({
        targets: final_text,
        opacity: 1,
    });
}


function cleanUp() {
    document.getElementById('stage-river-crossing').innerHTML = '';
}


function end() {
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
