// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { equal_sets } from './utilities.mjs';


function start() {
    if (DEBUG) {
        console.log('Displaying Welcome UI.');
    }
    $('#stage-welcome-ui').removeClass('hidden');
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);

    $('#welcome-end').on('click', function () {
        // Stages are not hidden until required to allow SVGs to load
        $('.stage').addClass('hidden');
        $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, end);
    });

    // Implement browser checks
    let svg_elements = document.querySelectorAll('object.svg');
    let check_container = document.querySelector('#setup-status-checks');
    for (let i = 0; i < svg_elements.length; i++) {
        let checkbox = document.createElement('div');
        checkbox.id = svg_elements[i].id + '-checkbox';
        checkbox.className = 'status-checkbox';
        check_container.appendChild(checkbox);
    }
    run_status_checks();
}


function run_status_checks() {
    console.log("Checking");
    setTimeout(
        function () {
            if (check_assets_are_ready()) {
                display_start_button();
            } else {
                run_status_checks();
            }
        },
        250
    );
}


function display_start_button() {
    $('#setup-status').fadeOut(400, function () { $('#welcome-end').fadeIn(); });
}


function check_assets_are_ready() {
    let ready = true;
    let svg_elements = document.querySelectorAll('object.svg');
    for (let i = 0; i < svg_elements.length; i++) {
        let svg_id = svg_elements[i].id;
        if (window.ready_assets.has(svg_id)) {
            let checkbox = document.querySelector('#' + svg_id + '-checkbox');
            checkbox.classList.add('success');
        } else {
            ready = false;
        }
    }
    return ready;
}


function end() {
    $('#stage-welcome-ui').addClass('hidden');
    var animation_container = document.getElementById('animation-container');
    var advance_event = new Event('journey:advance_stage');
    animation_container.dispatchEvent(advance_event);
}


export { start };
