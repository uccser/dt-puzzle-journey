// Import modules
import { DEBUG, BLINDFOLD_FADE_DURATION } from './constants.mjs';
import { changeStage, getRandomInt, showUiElements } from './utilities.mjs';
import { playFX, playMusic, stopMusic } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';
import pathfinder from 'pathfinding';
import dragula from 'dragula/dragula.js';

var setup_events = true;
var setup_initial_ui = true;
var plains_substage_num, grid_data;
const INSTRUCTION_ANIMATION_DURATION = 800;
const INSTRUCTION_FADE = 350;
const INSTRUCTION_MAX_COUNT = 16;
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
    'cell-obstacle-e',
    'cell-obstacle-f',
    'cell-obstacle-g',
];
const SUBSTAGE_DATA = {
    1: {
        grid_size: 4,
        instruction_loss_rate: 0.5,
        instruction_loss_start_index: 1,
    },
    2: {
        grid_size: 5,  // Note: A lot of obstacle logic is based off this number being 5.
        instruction_loss_rate: 0.7,
        instruction_loss_start_index: 0,
    },
    3: {
        grid_size: 6,
        // Hard coded grid
    },
}

function start(additional_parameters) {
    $('#stage-plains').removeClass('hidden');
    if (DEBUG) {
        console.log('Plains loaded.');
        if (additional_parameters) {
            console.log('Additional parameters loaded.');
        }
    }
    if (setup_events) {
        // Setup buttons
        $('#stage-plains #plains-next-stage').on('click', end);
        $('#plains-run-button').on('click', runInstructions);
        setup_events = false;
    }
    plains_substage_num = additional_parameters.substage || 1;
    setup(plains_substage_num);
    $('#animation-blindfold').fadeOut(BLINDFOLD_FADE_DURATION, displayUi);
}

function setup(substage_num) {
    playMusic('plains');
    // Create grid
    setupGrid(substage_num);
    setupInstructionBlocks();
    setupAvatar();
}


function displayUi() {
    if (DEBUG) {
        console.log('Displaying Plains UI.');
    }
    // Reveal UI elements
    var ui_elements = [];
    if (setup_initial_ui) {
        ui_elements = ui_elements.concat(Array.from(document.querySelectorAll('#plains-narrative-text .initial-text')));
        ui_elements.push(document.getElementById('plains-run-button'));
        setup_initial_ui = false;
    }
    if (plains_substage_num == 3) {
        let kea_text_1 = document.getElementById('kea-text-1');
        kea_text_1.classList.remove('hidden');
        ui_elements.push(kea_text_1);
        let kea_text_2 = document.getElementById('kea-text-2');
        kea_text_2.classList.remove('hidden');
    }
    showUiElements(ui_elements);
}


function runInstructions() {
    // Disable run button
    document.querySelector('#plains-run-button').setAttribute('disabled', 'disabled');

    //Go through instructions and add animations to Anime.js timeline.
    var timeline = anime.timeline({
        easing: 'easeInOutSine',
        autoplay: false,
        complete: runInstructionsCompleted,
    });

    var avatar = document.getElementById('grid-avatar');
    var avatar_container = document.getElementById('grid-avatar-container');
    var instructions = document.getElementById('plains-user-instructions').children;
    grid_data.completed = false;
    var heading = 0;
    var i = 0;
    var valid_sequence = true;
    var x_coord = grid_data.starting_location.x_coord;
    var y_coord = grid_data.starting_location.y_coord;

    while (valid_sequence && !grid_data.completed && i < instructions.length) {
        let transform;
        let target = avatar;
        let instruction_element = instructions[i];
        let instruction = getInstructionFromContainerElement(instruction_element);
        if (instruction) {
            if (instruction == 'F') {
                // Determine heading
                if (heading == 90) {
                    x_coord++;
                } else if (heading == 270) {
                    x_coord--;
                } else if (heading == 0) {
                    y_coord--;
                } else {
                    y_coord++;
                }

                // Check if valid movement
                valid_sequence = grid_data.pathfinding_grid.isWalkableAt(x_coord, y_coord);

                // Determine movement
                if (heading == 90) {
                    transform = { translateX: '+=100%' };
                    target = avatar_container;
                } else if (heading == 270) {
                    transform = { translateX: '-=100%' };
                    target = avatar_container;
                } else if (heading == 0) {
                    transform = { translateY: '-=100%' };
                } else {
                    transform = { translateY: '+=100%' };
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
                } else {
                    grid_data.last_coords = { x_coord: x_coord, y_coord: y_coord };
                }
            } else if (instruction == 'L') {
                transform = { rotate: '-=90deg' };
                heading = (heading + 270) % 360;
            } else if (instruction == 'R') {
                transform = { rotate: '+=90deg' };
                heading = (heading + 90) % 360;
            }
            var fade_options = {
                targets: instruction_element,
                duration: INSTRUCTION_FADE,
            }
            timeline.add(Object.assign(
                {
                    backgroundColor: ['#00ff0000', '#00ff00'],
                },
                fade_options
            ));
            if (transform) {
                var options = Object.assign(
                    {
                        targets: target,
                        duration: INSTRUCTION_ANIMATION_DURATION,
                        begin: function() {
                            playFX('steps');
                        }
                    },
                    transform
                );
                timeline.add(options);
            } else {
                fade_options.delay = INSTRUCTION_ANIMATION_DURATION * 0.25;
            }
            timeline.add(Object.assign(
                {
                    backgroundColor: ['#00ff00', '#00ff0000'],
                },
                fade_options
            ));
            if (coordsMatch({ x_coord: x_coord, y_coord: y_coord }, grid_data.goal_location) && heading == 0) {
                grid_data.completed = true;
            }
        }
        i++;
    }
    grid_data.avatar_heading = heading;
    timeline.play();
}


function runInstructionsCompleted() {
    var avatar = document.getElementById('grid-avatar');
    var avatar_container = document.getElementById('grid-avatar-container');
    if (grid_data.completed) {
        playFX('change-stage');
        anime({
            targets: avatar,
            easing: 'easeInOutSine',
            translateY: '-=200%',
            duration: INSTRUCTION_ANIMATION_DURATION * 2,
            complete: displayContinueUi,
        });
    } else {
        anime.timeline({
            easing: 'linear',
            duration: 500,
            complete: function () {
                let run_button = document.querySelector('#plains-run-button');
                run_button.removeAttribute('disabled');
            }
        }).add({
            targets: avatar_container,
            opacity: 0,
            complete: setAvatarToStartPosition,
        }).add({
            targets: avatar_container,
            opacity: 1,
        });
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


function setupAvatar() {
    // Position in top left cell
    let starting_cell = getGridElementFromCoords(0, 0);
    let avatar_container = document.createElement('div');
    avatar_container.id = 'grid-avatar-container';
    starting_cell.appendChild(avatar_container);
    let avatar = document.createElement('div');
    avatar.id = 'grid-avatar';
    avatar_container.appendChild(avatar);
    setAvatarToStartPosition();

    // See: https://github.com/uccser/dt-puzzle-journey/issues/19
    // anime({
    //     target: document.getElementById('grid-avatar-container'),
    //     duration: 0,
    //     translateX: `${grid_data.starting_location.x_coord * 100}%`,
    // });
    // anime({
    //     target: document.getElementById('grid-avatar'),
    //     duration: 0,
    //     translateY: `${grid_data.starting_location.y_coord * 100}%`,
    // });
}


function setAvatarToStartPosition() {
    let avatar_container = document.getElementById('grid-avatar-container');
    let x_transform = `${grid_data.starting_location.x_coord * 100}%`;
    avatar_container.style.transform = `translateX(${x_transform})`;

    let avatar = document.getElementById('grid-avatar');
    let y_transform = `${grid_data.starting_location.y_coord * 100}%`;
    avatar.style.transform = `translateY(${y_transform})`;
}


function setupInstructionBlocks() {
    // Create path for user to solve
    // Replace random instructions (not first instructions)
    if (plains_substage_num == 3) {
        var instructions = Array(INSTRUCTION_MAX_COUNT).fill('?');
    } else {
        var instructions = grid_data.inital_path.slice();
        var indexes_to_replace = [];
        var number_to_remove = Math.floor(instructions.length * grid_data.instruction_loss_rate);
        var instruction_loss_start_index = grid_data.instruction_loss_start_index;
        while (indexes_to_replace.length < number_to_remove) {
            let index = getRandomInt(instruction_loss_start_index, instructions.length);
            if (!indexes_to_replace.includes(index)) {
                indexes_to_replace.push(index);
            }
        }
        for (let i = 0; i < indexes_to_replace.length; i++) {
            instructions[indexes_to_replace[i]] = '?';
        }
    }

    // Create source blocks
    var source_container = document.getElementById('plains-instruction-blocks');
    for (let i = 0; i < 3; i++) {
        var source_block = document.createElement('div');
        var css_class;
        if (i == 0) {
            source_block.classList.add('instruction-block', 'instruction-forward');
        } else if (i == 1) {
            source_block.classList.add('instruction-block', 'instruction-turn-left');
        } else if (plains_substage_num == 3) {
            source_block.classList.add('kea-block', 'instruction-turn-right');
            // Temporary until animation added
            source_block.style.opacity = 0;
        } else {
            source_block.classList.add('instruction-block', 'instruction-turn-right');
        }
        source_container.appendChild(source_block);
    }
    if (plains_substage_num == 3) {
        source_container.classList.add('kea-blocks');
    }

    // Create user blocks
    var user_instructions = document.getElementById('plains-user-instructions');
    for (let i = 0; i < INSTRUCTION_MAX_COUNT; i++) {
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
    draggable_containers.push(source_container);

    var drake = dragula(draggable_containers, {
        mirrorContainer: source_container,
        direction: 'horizontal',
        removeOnSpill: true,
        copy: function (el, source) {
            return source === source_container;
        },
        moves: function (el, source, handle, sibling) {
            return !el.classList.contains('kea-block');
        },
        accepts: function (el, target) {
            return target !== source_container;
        }
    });
    drake.on('drop', function (el, target, source, sibling) {
        playFX('click');
        target.innerHTML = '';
        target.appendChild(el);
        if (plains_substage_num == 3) {
            let num_instructions = 0;
            let instructions = document.getElementById('plains-user-instructions').children;
            for (let i = 0; i < instructions.length; i++) {
                let instruction = getInstructionFromContainerElement(instructions[i]);
                if (!['', '?'].includes(instruction)) {
                    num_instructions++;
                }
            }
            if (num_instructions == INSTRUCTION_MAX_COUNT) {
                showKeaHint();
            }
        }
    });
    if (DEBUG) {
        console.log('Instructions block setup complete.')
    }
}


function showKeaHint() {
    showUiElements(document.getElementById('kea-text-2'));
}


function setupGrid(substage_num) {
    grid_data = SUBSTAGE_DATA[substage_num];
    createGrid(grid_data.grid_size);

    // Create logic array for locations
    grid_data.pathfinding_grid = new pathfinder.Grid(grid_data.grid_size, grid_data.grid_size);
    // Pick starting location
    grid_data.starting_location = selectGridStartingLocation(grid_data.grid_size);
    if (DEBUG) {
        console.log('Grid start location picked.')
    }
    // Pick goal location
    grid_data.goal_location = selectGridGoalLocation(grid_data.grid_size, grid_data.starting_location);
    if (DEBUG) {
        console.log('Grid goal location picked.')
    }
    // Create obstacles (both in array and interface)
    createGridObstacles();
    if (DEBUG) {
        console.log('Grid obstacle locations picked.')
    }
    // Find shortest path
    if (plains_substage_num != 3) {
        grid_data.inital_path = shortestGridPathInstructions();
    }
    // Add styling to grid cells
    styleGrid();

    if (DEBUG) {
        console.log('Grid data:');
        console.log(grid_data);
    }
}


function styleGrid() {
    // Style inside grid
    for (let y_coord = 0; y_coord < grid_data.grid_size; y_coord++) {
        for (let x_coord = 0; x_coord < grid_data.grid_size; x_coord++) {
            let coords = { x_coord: x_coord, y_coord: y_coord };
            let cell = getGridElementFromCoords(x_coord, y_coord);
            let css_class;
            if (coordsMatch(coords, grid_data.starting_location)) {
                css_class = 'cell-space-entrance';
            } else if (coordsMatch(coords, grid_data.goal_location)) {
                css_class = 'cell-space-goal';
            } else if (!grid_data.pathfinding_grid.isWalkableAt(x_coord, y_coord)) {
                css_class = getRandomGridObstacleStyle();
            } else {
                css_class = CELL_SPACE_VARIANTS[Math.floor(Math.random() * CELL_SPACE_VARIANTS.length)];
            }
            cell.classList.add(css_class);
        }
    }
    // Style outside grid.
    // Note: Uses CSS Grid positioning: Starts at 1, and y values are only 1 and 3.
    var container = document.getElementById('plains-left-container');
    for (let y_coord = 1; y_coord < 4; y_coord += 2) {
        for (let x_coord = 2; x_coord < grid_data.grid_size + 2; x_coord++) {
            let element = document.createElement('div');
            element.classList.add('to-cleanup');
            element.style.setProperty(
                'grid-area',
                `${y_coord} / ${x_coord} / ${y_coord + 1} / ${x_coord + 1}`
            );
            if (x_coord - 2 == grid_data.goal_location.x_coord && y_coord == 1) {
                element.id = 'plains-grid-goal-path';
            } else if (x_coord - 2 == grid_data.starting_location.x_coord && y_coord == 3) {
                element.id = 'plains-grid-entrance-path';
            } else {
                element.classList.add(getRandomGridObstacleStyle(), 'obstacle-outside-cell');
                if (y_coord == 1) {
                    element.classList.add('obstacle-outside-top');
                } else {
                    element.classList.add('obstacle-outside-bottom');
                }
            }
            container.appendChild(element);
        }
    }
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
        instructions = adjustHeading(instructions, heading, required_heading);
        instructions.push('F');
        [prev_x_coord, prev_y_coord] = [x_coord, y_coord];
        heading = required_heading;
    }
    // Turn to face path
    instructions = adjustHeading(instructions, heading, 0);
    console.log(instructions);
    return instructions;
}


function adjustHeading(instructions, heading, required_heading) {
    // Add 270 instead of minus 90 to ensure positive number for modulo
    if ((heading + 270) % 360 == required_heading) {
        instructions.push('L');
    } else if ((heading + 90) % 360 == required_heading) {
        instructions.push('R');
    } else if ((heading + 180) % 360 == required_heading) {
        instructions.push('L', 'L');
    }
    return instructions;
}


function createGridObstacles() {
    var obstacle_coords = [];
    if (plains_substage_num == 2) {
        // Always obstacles
        var temp_obstacle_coords = [
            [2, 0],
            [2, 4],
            [0, 2],
            [1, 2],
            [3, 2],
            [4, 2],
        ];
        var temp_grid = new pathfinder.Grid(grid_data.grid_size, grid_data.grid_size);
        for (let i = 0; i < temp_obstacle_coords.length; i++) {
            temp_grid.setWalkableAt(temp_obstacle_coords[i][0], temp_obstacle_coords[i][1], false);
        }
        var finder = new pathfinder.IDAStarFinder();
        var path = finder.findPath(
            grid_data.starting_location.x_coord,
            grid_data.starting_location.y_coord,
            grid_data.goal_location.x_coord,
            grid_data.goal_location.y_coord,
            temp_grid,
        );
        var possible_obstacle_coords = [];
        for (let x_coord = 0; x_coord < grid_data.grid_size; x_coord++) {
            for (let y_coord = 0; y_coord < grid_data.grid_size; y_coord++) {
                let valid_obstacle = true;
                for (let i = 0; i < path.length; i++) {
                    let [path_x_coord, path_y_coord] = path[i];
                    if (x_coord == path_x_coord && y_coord == path_y_coord) {
                        valid_obstacle = false;
                    }
                }
                if (valid_obstacle) {
                    possible_obstacle_coords.push([x_coord, y_coord]);
                }
            }
        }
        var number_to_pick = 12;
        var picked = 0;
        while (picked < number_to_pick) {
            let index = getRandomInt(0, possible_obstacle_coords.length);
            obstacle_coords.push(possible_obstacle_coords.splice(index, 1)[0]);
            picked++;
        }
    } else if (plains_substage_num == 3) {
        obstacle_coords = [
            // Row 0
            [0, 0],
            [1, 0],
            [2, 0],
            [4, 0],
            [5, 0],
            // Row 1
            [0, 1],
            [1, 1],
            [2, 1],
            [4, 1],
            [5, 1],
            // Row 3
            [1, 3],
            [2, 3],
            [4, 3],
            // Row 4
            [1, 4],
            [2, 4],
            [4, 4],
            // Row 5
            [4, 5],
        ]
    } else { // plains_substage_num == 1
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
    }
    for (let i = 0; i < obstacle_coords.length; i++) {
        createGridObstacle(...obstacle_coords[i]);
    }
}


function createGridObstacle(x_coord, y_coord) {
    grid_data.pathfinding_grid.setWalkableAt(x_coord, y_coord, false);
}


function getRandomGridObstacleStyle() {
    return CELL_OBSTACLE_VARIANTS[Math.floor(Math.random() * CELL_OBSTACLE_VARIANTS.length)];
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

function selectGridStartingLocation(grid_size) {
    if (plains_substage_num == 2) {
        var x_coord = getRandomInt(0, grid_size);
        if (x_coord == Math.floor(grid_size / 2)) {
            x_coord++;
        }
    } else if (plains_substage_num == 3) {
        var x_coord = 5;
    } else {
        var x_coord = getRandomInt(0, grid_size);
    }
    var y_coord = grid_size - 1; // Bottom row
    return { x_coord: x_coord, y_coord: y_coord };
}


function selectGridGoalLocation(grid_size, starting_location) {
    var starting_x_coord = starting_location.x_coord;
    if (plains_substage_num == 2) {
        var x_coord = (starting_x_coord + Math.ceil(grid_size / 2)) % (grid_size + 1);
    } else if (plains_substage_num == 3) {
        var x_coord = 3;
    } else { // plains_substage_num == 1
        var possible_x_coords = [];
        if (starting_x_coord - 1 >= 0) {
            possible_x_coords.push(starting_x_coord - 1);
        }
        if (starting_x_coord + 1 <= grid_size - 1) {
            possible_x_coords.push(starting_x_coord + 1);
        }
        var random_x_coord_index = getRandomInt(0, possible_x_coords.length);
        var x_coord = possible_x_coords[random_x_coord_index];
    }
    return { x_coord: x_coord, y_coord: 0 };
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
    var ui_elements = document.getElementById('plains-next-stage');
    showUiElements(ui_elements);
}


function cleanUp() {
    // Do not delete SVG as used by multiple levels
    // Only reset elements that have children added. Styles will be overwritten.
    document.getElementById('plains-grid').innerHTML = '';
    document.getElementById('plains-instruction-blocks').innerHTML = '';
    document.getElementById('plains-user-instructions').innerHTML = '';
    document.getElementById('plains-run-button').removeAttribute('disabled');
    document.querySelectorAll('#stage-plains .to-cleanup').forEach(el => el.remove());
    var elements = document.querySelectorAll('#plains-narrative-text .initial-text.narrative-text');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('hidden');
    }
    document.getElementById('plains-next-stage').removeAttribute('style');

}


function end() {
    $('#animation-blindfold').fadeIn(
        BLINDFOLD_FADE_DURATION,
        function () {
            cleanUp();
            if (plains_substage_num + 1 in SUBSTAGE_DATA) {
                changeStage(`plains-${plains_substage_num + 1}`);
            } else {
                stopMusic('plains');
                $('#stage-plains').addClass('hidden');
                changeStage('before-pa');
            }
        }
    );
}


export { start };
