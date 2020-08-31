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
import { start as stage_landscape_view_start } from './stage_landscape_view.mjs';

console.log('DEBUG is set to ' + DEBUG);

const STAGES = [
    {
        name: 'Opening landscape',
        intial_function: stage_landscape_view_start,
    },
    // {
    //     name: 'Fern interactive',
    //     intial_function: stage_2,
    // },
]
var current_level = 0;  // Start at first level


$(document).ready(function () {
    const parameters = queryString.parse(location.search);
    if ('stage' in parameters) {
        var stage_value = parameters.stage;
        current_level = parseInt(stage_value);
        if (isNaN(current_level)) {
            console.log('Given stage value is not a number, reverting to 0.')
            current_level = 0;
        } else if (current_level >= STAGES.length) {
            console.log('Given stage value is not within range, reverting to 0.')
            current_level = 0;
        }
    }
    if (DEBUG) {
        console.log('Starting at level ' + current_level);
    }
    STAGES[current_level].intial_function();
});
