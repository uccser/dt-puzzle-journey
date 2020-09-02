// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var next_button_hidden = true;
var card_interactions = 0;
const REQUIRED_CARD_INTERACTIONS = 5;

function start() {
    $('#stage-fern-interactive').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern interactive loaded.');
    }
    var svg = getSvg('fern-svg');
    animateAnts(svg);
    setupEvents();
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setupEvents() {
    $('#fern-container').on('click', '.fern-leaf', function () {
        $(this).toggleClass('flipped');
        card_interactions++;
        updateDotCount();
        if (next_button_hidden && card_interactions >= REQUIRED_CARD_INTERACTIONS) {
            $('#stage-fern-interactive #fern-next-stage').fadeIn();
            next_button_hidden = false;
        }
    });
    $('#fern-next-stage').on('click', end);
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
