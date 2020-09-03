// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, setSvgElementAnchor, addStylesToSvg } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

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
    var svg = getSvg('fern-message-svg');
    addStylesToSvg(svg);
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
