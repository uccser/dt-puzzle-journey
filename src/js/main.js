/*
    Author: Jack Morgan

    Notes:
        - All times are in milliseconds.
*/

// Import third party libraries
import jQuery from 'jquery';
window.$ = jQuery;
import queryString from 'query-string';

// Import modules
import { DEBUG } from './constants.mjs';
import { mark_asset_as_ready } from './utilities.mjs';
import { start as stage_welcome_start } from './stage_welcome.mjs';
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


const STAGES = [
    {
        name: 'Welcome',
        initial_function: stage_welcome_start,
    },
    {
        name: 'Opening landscape',
        initial_function: stage_landscape_view_start,
    },
    {
        name: 'Fern interactive',
        initial_function: stage_fern_start,
    },
]
var current_stage = 0;  // Start at welcome


$(document).ready(function () {
    const parameters = queryString.parse(location.search);
    if ('stage' in parameters) {
        var stage_value = parameters.stage;
        current_stage = parseInt(stage_value);
        if (isNaN(current_stage)) {
            console.log('Given stage value is not a number, reverting to 0.')
            current_stage = 0;
        } else if (current_stage >= STAGES.length) {
            console.log('Given stage value is not within range, reverting to 0.')
            current_stage = 0;
        }
    }

    var animation_container = document.getElementById('animation-container');
    animation_container.addEventListener('journey:advance_stage', run_stage);
    var advance_event = new Event('journey:advance_stage');
    animation_container.dispatchEvent(advance_event);
});

function run_stage(event) {
    if (DEBUG) {
        console.log('Starting level ' + current_stage + '.');
    }
    STAGES[current_stage].initial_function();
    current_stage++;
};
