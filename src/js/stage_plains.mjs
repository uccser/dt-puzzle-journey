// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';

var require_setup = true;


function start() {
    $('#stage-plains').removeClass('hidden');
    if (DEBUG) {
        console.log('Plains loaded.');
    }
    if (require_setup) {
        setup();
        require_setup = false;
    }
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION);
}


function setup() {
    // Setup buttons
    $('#stage-plains #plains-next-stage').on('click', end);
    var grid_size = 4;
    createGrid(grid_size);
    // Create logic array for locations

    // Pick starting location

    // Pick end location

    // Create obstacles (both in array and interface)

    // Find shortest path

    // Create path for user to solve
}


function createGrid(grid_size) {
    createGridContainer(grid_size);
    createGridCells(grid_size);
}


function createGridContainer(grid_size) {
    var parent_container = document.querySelector('#plains-left-container');
    var grid_square = document.querySelector('#plains-grid-container');
    parent_container.style.setProperty(
        'grid-template-columns',
        'repeat(' + grid_size + ', 1fr)'
    );
    grid_square.style.setProperty(
        'grid-area',
        '2 / 1 / 3 / ' + (grid_size + 1)
    );
}


function createGridCells(grid_size) {
    var grid_element = document.querySelector('#plains-grid');
    grid_element.style.setProperty(
        'grid-template-rows',
        'repeat(' + grid_size + ', 1fr)'
    );
    grid_element.style.setProperty(
        'grid-template-columns',
        'repeat(' + grid_size + ', 1fr)'
    );
    for (let row_num = 0; row_num < grid_size; row_num++) {
        for (let col_num = 0; col_num < grid_size; col_num++) {
            let cell = document.createElement('div');
            cell.id = `grid-cell-${row_num}-${col_num}`;
            cell.classList.add('cell');
            if (row_num == grid_size - 1) {
                cell.classList.add('bottom-edge');
            }
            if (col_num == grid_size - 1) {
                cell.classList.add('right-edge');
            }
            grid_element.appendChild(cell);
        }
    }
}


function displayContinueUi() {
    // TODO: Display narrative text, then reveal button.
    $('#stage-plains #plains-next-stage').fadeIn();
}


function end() {
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            location.assign("/complete/index.html");
        }
    );
}


export { start };
