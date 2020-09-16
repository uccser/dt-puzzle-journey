// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import dragula from 'dragula/dragula.js';

var require_setup = true;


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
}


function setup() {
    // Get SVG
    var svg = getSvg('river-crossing-svg');
    // addStylesToSvg(svg);

    // Create ropes
    createRopes();
    var rope_containers = document.querySelectorAll('.rope-container');
    var drake = dragula(Array.from(rope_containers), {
        mirrorContainer: document.querySelector('#stage-river-crossing'),
        direction: 'horizontal',
        accepts: function (rope, target, source, sibling) {
            var total_rope_length = getTotalRopeLength(target);
            // total_rope_length += parseInt(rope.dataset.length);
            return total_rope_length <= parseInt(target.dataset.capacity);
        },
    });
    drake.on('dragend', checkBridgeComplete);
}


function checkBridgeComplete(el) {
    var rope_container_top = document.querySelector('#river-crossing-rope-top');
    var rope_container_middle = document.querySelector('#river-crossing-rope-middle');
    var rope_container_bottom = document.querySelector('#river-crossing-rope-bottom');
    // TODO
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
    // TODO: Generate random rope lengths
    var rope_lengths = [7, 3, 1, 4, 1, 2, 2, 3, 5, 2];
    var initial_container = document.querySelector('#river-crossing-bank');
    for (let i = 0; i < rope_lengths.length; i++) {
        let length = rope_lengths[i];
        let rope_element = document.createElement('div');
        let rope_css_size = length * 10;
        rope_element.dataset.length = length;
        rope_element.classList.add('rope');
        rope_element.style.flexBasis = rope_css_size.toString() + '%';

        let value_element = document.createElement('div');
        value_element.classList.add('rope-value');
        value_element.innerText = length.toString() + 'm';
        rope_element.appendChild(value_element);

        initial_container.appendChild(rope_element);
    }

}


export { start };
