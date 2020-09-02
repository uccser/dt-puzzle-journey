/*
    Author: Jack Morgan

    Notes:
        - All times are in milliseconds.

    Browser must support:
        - JS
            - CustomEvent()
            - Default parameters
            - Template literals (Template strings)
        - CSS
            - Flexbox
            - Grid
            - Backface visibility
*/

// Import third party libraries
import jQuery from 'jquery';
window.$ = jQuery;
import queryString from 'query-string';

// Import modules
import { DEBUG } from './constants.mjs';
import { mark_asset_as_ready } from './utilities.mjs';
import { start as welcome_start } from './welcome.mjs';
import { start as stage_landscape_view_start } from './stage_landscape_view.mjs';
import { start as stage_fern_start } from './stage_fern_interactive.mjs';

console.log('DEBUG is set to ' + DEBUG + '.');

// Create global variable to track ready assets
window.ready_assets = new Set();
$('object.svg').each(function () {
    this.addEventListener('load', function () {
        mark_asset_as_ready(this.id);
    });
});


const STAGES = {
    'landscape-view': {
        button_text: 'Start the journey',
        initial_function: stage_landscape_view_start,
    },
    'fern-interactive': {
        button_text: 'Start at the fern leaves',
        initial_function: stage_fern_start,
    },
};
var default_stage = 'landscape-view';


$(document).ready(function () {
    var stage_value = default_stage;
    const parameters = queryString.parse(location.search);
    if ('stage' in parameters) {
        if (parameters.stage in STAGES) {
            stage_value = parameters.stage;
        } else {
            console.log("Given stage value '" + parameters.stage + "' is not known, reverting to first stage.")
        }
    }

    var animation_container = document.getElementById('animation-container');
    animation_container.addEventListener('journey:change_stage', run_stage);
    welcome_start(stage_value, STAGES);
});


function run_stage(event) {
    let stage_data = STAGES[event.detail];
    if (DEBUG) {
        console.log("Starting level '" + event.detail + "'.");
    }
    stage_data.initial_function();
};
