// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { changeStage } from './utilities.mjs';


function start(next_level_id, stage_data, autostart=false) {
    if (DEBUG) {
        console.log('Displaying Welcome UI.');
    }
    $('#welcome-ui').removeClass('hidden');
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);

    $('#welcome-end').on('click', function () { end(next_level_id); });

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
    runStatusChecks(autostart, next_level_id);
}

const CHECK_CYCLE_DURATION = 200;
const MAX_CHECK_DURATION = 60000;
const CHECK_DURATION_TIMEOUT = MAX_CHECK_DURATION / CHECK_CYCLE_DURATION;

function runStatusChecks(autostart, next_level_id, iteration = 1) {
    // Run status checks every 250ms until valid.
    // TODO: - Add backup checks for SVGs.
    //       - Add browser checks.
    if (DEBUG) {
        console.log(`Running status checks (iteration ${iteration}).`);
    }

    if (iteration >= CHECK_DURATION_TIMEOUT) {
        displayLoadError();
    } else if(checkAssetsAreReady()) {
        if (DEBUG) {
            console.log('All status checks passed.');
        }
        if (autostart) {
            end(next_level_id);
        } else {
            displayStartButton();
        }
    } else {
        setTimeout(function () { runStatusChecks(autostart, next_level_id, iteration + 1);}, CHECK_CYCLE_DURATION);
    }
}


function displayStartButton() {
    $('#setup-status').fadeOut(400, function () { $('#welcome-end').fadeIn(); });
}


function displayLoadError() {
    $('#setup-status').fadeOut(400, function () { $('#load-error').fadeIn(); });
}


function checkAssetsAreReady() {
    let ready = true;
    // Create copy to avoid issues when deleting from original set while iterating.
    let svg_ids = new Set(window.unchecked_assets);
    for (let svg_id of svg_ids) {
        if (checkAssetIsReady(svg_id)) {
            let checkbox = document.querySelector('#' + svg_id + '-checkbox');
            checkbox.classList.add('success');
            window.unchecked_assets.delete(svg_id);
        } else {
            ready = false;
        }
    }
    return ready;
}


function checkAssetIsReady(svg_id) {
    let svg_element = document.querySelector('#' + svg_id);
    if (window.ready_assets.has(svg_id)) {
        return true;
    } else if (svg_element.contentDocument.readyState == "complete") {
        return true;
    } else {
        return false;
    }
}


function end(next_level_id) {
    $('.stage').addClass('hidden');
    $('#animation-blindfold').fadeIn(BLINDFOLD_FADE_DURATION, function () {
        $('#welcome-ui').addClass('hidden');
        changeStage(next_level_id);
    });
}


export { start };
