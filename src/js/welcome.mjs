// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { change_stage } from './utilities.mjs';


function start(next_level_id, stage_data) {
    if (DEBUG) {
        console.log('Displaying Welcome UI.');
    }
    $('#stage-welcome-ui').removeClass('hidden');
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);

    $('#welcome-end').on('click', function () {
        // Stages are not hidden until required to allow SVGs to load.
        $('.stage').addClass('hidden');
        $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, function () { end(next_level_id);});
    });

    // Setup button
    let button_text = stage_data[next_level_id].button_text;
    document.querySelector('#welcome-end').textContent = button_text;

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

const CHECK_CYCLE_DURATION = 200;
const CHECK_DURATION_TIMEOUT = 2000 / CHECK_CYCLE_DURATION;

function run_status_checks(iteration = 1) {
    // Run status checks every 250ms until valid.
    // TODO: - Add backup checks for SVGs.
    //       - Add browser checks.
    if (DEBUG) {
        console.log(`Running status checks (iteration ${iteration}).`);
    }

    if (iteration >= CHECK_DURATION_TIMEOUT) {
        display_load_error();
    } else if(check_assets_are_ready()) {
        if (DEBUG) {
            console.log('All status checks passed.');
        }
        display_start_button();
    } else {
        setTimeout( function () {run_status_checks(iteration + 1);}, CHECK_CYCLE_DURATION);
    }
}


function display_start_button() {
    $('#setup-status').fadeOut(400, function () { $('#welcome-end').fadeIn(); });
}


function display_load_error() {
    $('#setup-status').fadeOut(400, function () { $('#load-error').fadeIn(); });
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


function end(next_level_id) {
    $('#stage-welcome-ui').addClass('hidden');
    change_stage(next_level_id);
}


export { start };
