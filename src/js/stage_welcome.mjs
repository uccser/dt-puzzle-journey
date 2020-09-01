// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';


function start() {
    $('#stage-welcome-ui').removeClass('hidden');
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
    console.log('Displaying Welcome UI.');
    // TODO: Implement browser check
    $('#browser-check').delay(2000).fadeOut(400, function () { $('#welcome-end').fadeIn(); });
    $('#welcome-end').on('click', function () {
        $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, end);
    });
}

function end() {
    $('#stage-welcome-ui').addClass('hidden');
    var animation_container = document.getElementById('animation-container');
    var advance_event = new Event('journey:advance_stage');
    animation_container.dispatchEvent(advance_event);
}


export { start };
