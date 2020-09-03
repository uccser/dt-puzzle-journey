// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';


function start() {
    $('#stage-fern-message').removeClass('hidden');
    if (DEBUG) {
        console.log('Fern message loaded.');
    }
    $('#fern-message-previous-stage').on('click', { level_id: 'fern-interactive' }, end);
    $('#fern-message-next-stage').on('click', { level_id: 'unknown' }, end);
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
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
