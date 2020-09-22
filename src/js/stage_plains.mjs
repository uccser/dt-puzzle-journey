// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { getSvg, changeStage, getRandomInt } from './utilities.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import pathfinder from 'pathfinding';
import dragula from 'dragula/dragula.js';

var require_setup = true;
var grid_data;
const INSTRUCTION_ANIMATION_DURATION = 800;
const INSTRUCTION_FADE = 350;
const CELL_SPACE_VARIANTS = [
    'cell-space-a',
    'cell-space-b',
    'cell-space-c',
    'cell-space-d',
];
const CELL_OBSTACLE_VARIANTS = [
    'cell-obstacle-a',
    'cell-obstacle-b',
    'cell-obstacle-c',
    'cell-obstacle-d',
];

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

    // Create grid
    var grid_size = 4;
    setupGrid(grid_size);
    setupInstructionBlocks();
    setupAvatar();

    $('#plains-run-button').on('click', runInstructions);
    $('#plains-reset-button').on('click', resetInstructions);
}


function runInstructions() {
    // TODO: Disable run button

    // Go through instructions and add animations to Anime.js timeline.
    var timeline = anime.timeline({
        easing: 'easeInOutSine',
        autoplay: false,
        complete: checkRunInstructions,
    });

    var avatar = document.getElementById('grid-avatar');
    var avatar_container = document.getElementById('grid-avatar-container');
    var instructions = document.getElementById('plains-user-instructions').children;

    var heading = 0;
    var i = 0;
    var valid_sequence = true;
    var x_coord = grid_data.starting_location.x_coord;
    var y_coord = grid_data.starting_location.y_coord;
    while (valid_sequence && i < instructions.length) {
        let target = avatar;
        let instruction_element = instructions[i];
        let instruction = getInstructionFromContainerElement(instruction_element);
        if (instruction) {
            var transform = '';
            if (instruction == 'F') {
                if (heading == 90) {
                    x_coord++;
                } else if (heading == 270) {
                    x_coord--;
                } else if (heading == 0) {
                    y_coord--;
                } else {
                    y_coord++;
                }
                valid_sequence = grid_data.pathfinding_grid.isWalkableAt(x_coord, y_coord);
                // Animate movement
                if (heading == 90) {
                    transform = {translateX: '+=100%'};
                    target = avatar_container;
                } else if (heading == 270) {
                    transform = {translateX: '-=100%'};
                    target = avatar_container;
                } else if (heading == 0) {
                    transform = {translateY: '-=100%'};
                } else {
                    transform = {translateY: '+=100%'};
                }
                if (!valid_sequence) {
                    let transform_type = Object.keys(transform)[0];
                    let operator = transform[transform_type][0];
                    let opposite_operator = (operator == '+') ? '-' : '+';
                    transform[transform_type] = [
                        '+=0%',
                        `${operator}=30%`,
                        `${opposite_operator}=30%`,
                    ];
                }
            } else if (instruction == 'L') {
                transform = {rotate: '-=90deg'};
                heading = (heading + 270) % 360;
            } else if (instruction == 'R') {
                transform = {rotate: '+=90deg'};
                heading = (heading + 90) % 360;
            }
            var fade_options = {
                targets: instruction_element,
                duration: INSTRUCTION_FADE,
            }
            timeline.add(Object.assign({
                background: ['#00ff0000', '#00ff00'],
            }, fade_options));
            if (transform) {
                var options = Object.assign({
                    targets: target,
                    duration: INSTRUCTION_ANIMATION_DURATION,
                }, transform);
                timeline.add(options);
            } else {
                fade_options.delay = INSTRUCTION_ANIMATION_DURATION;
            }
            timeline.add(Object.assign({
                background: ['#00ff00', '#00ff0000'],
            }, fade_options));
        }
        i++;
    }
    if (x_coord == grid_data.goal_location.x_coord && y_coord == grid_data.goal_location.y_coord) {
        grid_data.completed = true;
    };
    timeline.play();
}


function checkRunInstructions() {
    var avatar = document.getElementById('grid-avatar');
    var avatar_container = document.getElementById('grid-avatar-container');
    if (grid_data.completed) {
        anime({
            targets: avatar,
            translateY: '-=200%',
            duration: INSTRUCTION_ANIMATION_DURATION * 3,
            easing: 'easeInOutSine',
        });
    } else {
        anime.timeline({
            easing: 'linear',
            duration: 500,
        }).add({
            targets: avatar_container,
            opacity: 0,
        }).add({
            targets: avatar_container,
            translateX: 0,
            duration: 1,
        }).add({
            targets: avatar,
            translateY: 0,
            rotate: 0,
            duration: 1,
        }).add({
            targets: avatar_container,
            opacity: 1,
        });
        // TODO: Re-enable run button.
    }
}


function getInstructionFromContainerElement(element) {
    // Possible return values:
    // 'F' - Forward
    // 'L' - Turn left
    // 'R' - Turn right
    // '?' - Empty instruction
    // '' - No instruction (when box is not available to user)
    if (element.hasChildNodes()) {
        element = element.children[0];
        if (element.classList.contains('instruction-user-defined')) {
            if (element.hasChildNodes()) {
                return getInstructionFromBlockElement(element.children[0]);
            } else {
                return '?';
            }
        } else {
            return getInstructionFromBlockElement(element);
        }
    } else {
        return '';
    }
}


function getInstructionFromBlockElement(element) {
    // Possible return values:
    // 'F' - Forward
    // 'L' - Turn left
    // 'R' - Turn right
    if (element.classList.contains('instruction-turn-left')) {
        return 'L';
    } else if (element.classList.contains('instruction-turn-right')) {
        return 'R';
    } else {
        return 'F';
    }
}


function resetInstructions() {
    var user_defined = document.querySelectorAll('.instruction-user-defined');
    for (let i = 0; i < user_defined.length; i++) {
        user_defined[i].innerHTML = '';
    }
}


function setupAvatar() {
    let starting_cell = getGridElementFromCoords(grid_data.starting_location.x_coord, grid_data.starting_location.y_coord);
    let avatar_container = document.createElement('div');
    avatar_container.id = 'grid-avatar-container';
    starting_cell.appendChild(avatar_container);
    let avatar = document.createElement('div');
    avatar.id = 'grid-avatar';
    avatar_container.appendChild(avatar);
}


function setupInstructionBlocks() {
    // Create path for user to solve
    // Replace random instructions (not first instructions)
    var instructions = grid_data.inital_path.slice();
    var indexes_to_replace = [];
    while (indexes_to_replace.length < 3) {
        let index = getRandomInt(1, instructions.length);
        if (!indexes_to_replace.includes(index)) {
            indexes_to_replace.push(index);
        }
    }
    for (let i = 0; i < indexes_to_replace.length; i++) {
        instructions[indexes_to_replace[i]] = '?';
    }

    // Create blocks
    var user_instructions = document.getElementById('plains-user-instructions');
    for (let i = 0; i < 16; i++) {
        let instruction_container = document.createElement('div');
        instruction_container.classList.add('instruction-container');
        if (i < instructions.length) {
            let block = document.createElement('div');
            let instruction = instructions[i];
            if (instruction == 'F') {
                block.classList.add('instruction-block');
                block.classList.add('instruction-forward');
            } else if (instruction == 'L') {
                block.classList.add('instruction-block');
                block.classList.add('instruction-turn-left');
            } else if (instruction == 'R') {
                block.classList.add('instruction-block');
                block.classList.add('instruction-turn-right');
            } else {
                block.classList.add('instruction-user-defined');
            }
            instruction_container.appendChild(block);
        }
        user_instructions.appendChild(instruction_container);
    }

    var draggable_containers = Array.from(document.querySelectorAll('.instruction-user-defined'));
    var source_container = document.getElementById('plains-instruction-blocks');
    draggable_containers.push(source_container);

    var drake = dragula(draggable_containers, {
        mirrorContainer: source_container,
        direction: 'horizontal',
        removeOnSpill: true,
        copy: function (el, source) {
            return source === source_container;
        },
        accepts: function (el, target) {
            return target !== source_container;
        }
    });
    drake.on('drop', function (el, target, source, sibling) {
        target.innerHTML = '';
        target.appendChild(el);
    });
}


function setupGrid(grid_size) {
    grid_data = {
        grid_size: grid_size,
    };

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
    // Add styling to grid cells
    styleGrid();

    if (DEBUG) {
        console.log('Grid data:');
        console.log(grid_data);
    }
}


function styleGrid() {
    var grid_element = document.querySelector('#plains-grid');
    for (let y_coord = 0; y_coord < grid_data.grid_size; y_coord++) {
        for (let x_coord = 0; x_coord < grid_data.grid_size; x_coord++) {
            let coords = {x_coord: x_coord, y_coord: y_coord};
            let cell = getGridElementFromCoords(x_coord, y_coord);
            let css_class;
            if (coordsMatch(coords, grid_data.starting_location)) {
                css_class = 'cell-space-entrance';
            } else if (coordsMatch(coords, grid_data.goal_location)) {
                css_class = 'cell-space-goal';
            } else if (!grid_data.pathfinding_grid.isWalkableAt(x_coord, y_coord)) {
                css_class = CELL_OBSTACLE_VARIANTS[Math.floor(Math.random() * CELL_OBSTACLE_VARIANTS.length)];
            } else {
                css_class = CELL_SPACE_VARIANTS[Math.floor(Math.random() * CELL_SPACE_VARIANTS.length)];
            }
            cell.classList.add(css_class);
        }
    }
    // Add entrance and goal paths
    let entrance_path = document.querySelector('#plains-grid-entrance-path');
    let entrance_x_coord = grid_data.starting_location.x_coord;
    entrance_path.style.setProperty(
        'grid-area',
        `3 / ${entrance_x_coord + 2} / 4 / ${entrance_x_coord + 3}`
    );
    let goal_path = document.querySelector('#plains-grid-goal-path');
    let goal_x_coord = grid_data.goal_location.x_coord;
    goal_path.style.setProperty(
        'grid-area',
        `1 / ${goal_x_coord + 2} / 2 / ${goal_x_coord + 3}`
    );
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
    return instructions;
}


function createGridObstacles() {
    var obstacle_coords = [];
    // For first stage, create one obstacle in front of starting location,
    // plus all empty spots on top and bottom rows.
    obstacle_coords.push([grid_data.starting_location.x_coord, 1]);
    for (let x_coord = 0; x_coord < grid_data.grid_size; x_coord++) {
        if (!(x_coord == grid_data.starting_location.x_coord)) {
            obstacle_coords.push([x_coord, grid_data.grid_size - 1]);
        }
        if (!(x_coord == grid_data.goal_location.x_coord)) {
            obstacle_coords.push([x_coord, 0]);
        }
    }
    for (let i = 0; i < obstacle_coords.length; i++) {
        createGridObstacle(...obstacle_coords[i]);
    }
}


function createGridObstacle(x_coord, y_coord) {
    grid_data.pathfinding_grid.setWalkableAt(x_coord, y_coord, false);
}


function selectGridStartingLocation(grid_size) {
    var x_coord = getRandomInt(0, grid_size);
    var y_coord = grid_size - 1; // Bottom row
    return {x_coord: x_coord, y_coord: y_coord};
}


function getGridElementFromCoords(x_coord, y_coord) {
    let id = getGridCellId(x_coord, y_coord);
    return document.querySelector(`#plains-grid #${id}`);
}


function getGridCellId(x_coord, y_coord) {
    return `grid-cell-${x_coord}-${y_coord}`;
}


function coordsMatch(coords_a, coords_b) {
    return coords_a.x_coord == coords_b.x_coord && coords_a.y_coord == coords_b.y_coord;
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
    parent_container.style.setProperty(
        'grid-template-columns',
        `22% repeat(${grid_size}, 1fr) 22%`
    );
    var grid_square = document.querySelector('#plains-grid-container');
    grid_square.style.setProperty(
        'grid-column-end',
        grid_size + 2
    );
    var grid_right_edge = document.querySelector('#plains-grid-right-edge');
    grid_right_edge.style.setProperty(
        'grid-area',
        `1 / ${grid_size + 2} / 4 / ${grid_size + 3}`
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
            cell.id = getGridCellId(x_coord, y_coord);
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
