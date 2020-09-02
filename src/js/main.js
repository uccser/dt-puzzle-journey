/*
    Author: Jack Morgan

    Notes:
        - All times are in milliseconds.

    Browser must support:
        - JS
            - CustomEvent()
            - Default parameters
            - Template literals (Template strings)
            - ClassList
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
import { markAssetAsReady } from './utilities.mjs';
import { start as welcomeStart } from './welcome.mjs';
import { start as stageLandscapeViewStart } from './stage_landscape_view.mjs';
import { start as stageFernInteractiveStart } from './stage_fern_interactive.mjs';
import { start as stageFernMessageStart } from './stage_fern_message.mjs';

console.log('DEBUG is set to ' + DEBUG + '.');

// Create global variable to track ready assets
window.ready_assets = new Set();
$('object.svg').each(function () {
    this.addEventListener('load', function () {
        markAssetAsReady(this.id);
    });
});


const STAGES = {
    'landscape-view': {
        button_text: 'Start the journey',
        initial_function: stageLandscapeViewStart,
    },
    'fern-interactive': {
        button_text: 'Start at the fern leaves',
        initial_function: stageFernInteractiveStart,
    },
    'fern-message': {
        button_text: 'Start at message in ferns leaves',
        initial_function: stageFernMessageStart,
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
    var autostart = 'autostart' in parameters;
    var animation_container = document.getElementById('animation-container');
    animation_container.addEventListener('journey:change_stage', run_stage);
    welcomeStart(stage_value, STAGES, autostart);
});


function run_stage(event) {
    let stage_data = STAGES[event.detail];
    if (DEBUG) {
        console.log("Starting level '" + event.detail + "'.");
    }
    stage_data.initial_function();
};
