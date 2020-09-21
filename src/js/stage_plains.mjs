// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, getRandomInt } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import pathfinder from 'pathfinding';

var require_setup = true;
var grid_data;

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
    setupGridData(grid_size);
}


function setupGridData(grid_size) {
    grid_data = {};

    createGrid(grid_size);

    // Create logic array for locations
    grid_data.pathfinding_grid = new pathfinder.Grid(grid_size, grid_size);
    // Pick starting location
    grid_data.starting_location = selectGridStartingLocation(grid_size);
    // Pick goal location
    grid_data.goal_location = selectGridGoalLocation(grid_size, grid_data.starting_location);
    // Create obstacles (both in array and interface)
    createGridObstacles();
    // Find shortest path
    grid_data.inital_path = shortestGridPathInstructions();
    // Create path for user to solve




    // Temp
    gridElementFromCoords(grid_data.starting_location).style.setProperty(
        'background-color',
        'yellow'
    );
    gridElementFromCoords(grid_data.goal_location).style.setProperty(
        'background-color',
        'green'
    );
    console.log(grid_data);
}


function shortestGridPathInstructions() {
    // Get shortest path as array of coords
    var finder = new pathfinder.IDAStarFinder();
    var path = finder.findPath(
        grid_data.starting_location.x_coord,
        grid_data.starting_location.y_coord,
        grid_data.goal_location.x_coord,
        grid_data.goal_location.y_coord,
        grid_data.pathfinding_grid
    );
    // Convert to instructions
    var instructions = [];
    var x_coord, y_coord;
    var [prev_x_coord, prev_y_coord] = path[0];
    var heading = 0;
    var required_heading;
    console.log(path);
    for (let i = 1; i < path.length; i++) {
        [x_coord, y_coord] = path[i];
        if (x_coord + 1 == prev_x_coord) {
            // If moving left
            required_heading = 270;
        } else if (y_coord + 1 == prev_y_coord) {
            // If moving up
            required_heading = 0;
        } else if (x_coord - 1 == prev_x_coord) {
            // If moving right
            required_heading = 90;
        } else {
            // If moving down
            required_heading = 180;
        }

        // Add 270 instead of minus 90 to ensure positive number for modulo
        if ((heading + 270) % 360 == required_heading) {
            instructions.push('L');
        } else if ((heading + 90) % 360 == required_heading) {
            instructions.push('R');
        } else if ((heading + 180) % 360 == required_heading) {
            instructions.push('L', 'L');
        }
        instructions.push('F');
        [prev_x_coord, prev_y_coord] = [x_coord, y_coord];
        heading = required_heading;
    }
    console.log(instructions);
    return instructions;
}



function createGridObstacles() {
    // For first stage, create one obstacle in front of starting location
    var x_coord = grid_data.starting_location.x_coord;
    var y_coord = 1;
    createGridObstacle(x_coord, y_coord);
}


function createGridObstacle(x_coord, y_coord) {
    grid_data.pathfinding_grid.setWalkableAt(x_coord, y_coord, false);
    gridElementFromCoords({x_coord: x_coord, y_coord: y_coord }).style.setProperty(
        'background-color',
        'red'
    );
}


function selectGridStartingLocation(grid_size) {
    var x_coord = getRandomInt(0, grid_size);
    var y_coord = grid_size - 1; // Bottom row
    return {x_coord: x_coord, y_coord: y_coord};
}


function gridElementFromCoords(coords) {
    let id = `grid-cell-${coords.x_coord}-${coords.y_coord}`;
    return document.querySelector(`#plains-grid #${id}`);
}


function selectGridGoalLocation(grid_size, starting_location) {
    var starting_x_coord = starting_location.x_coord;
    var possible_x_coords = [];
    if (starting_x_coord - 1 >= 0) {
        possible_x_coords.push(starting_x_coord - 1);
    }
    if (starting_x_coord + 1 <= grid_size - 1) {
        possible_x_coords.push(starting_x_coord + 1);
    }
    var random_x_coord_index = getRandomInt(0, possible_x_coords.length);
    var x_coord = possible_x_coords[random_x_coord_index];
    var y_coord = 0; // Top row
    return { x_coord: x_coord, y_coord: y_coord };
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
    for (let y_coord = 0; y_coord < grid_size; y_coord++) {
        for (let x_coord = 0; x_coord < grid_size; x_coord++) {
            let cell = document.createElement('div');
            cell.id = `grid-cell-${x_coord}-${y_coord}`;
            cell.classList.add('cell');
            if (y_coord == grid_size - 1) {
                cell.classList.add('bottom-edge');
            }
            if (x_coord == grid_size - 1) {
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
