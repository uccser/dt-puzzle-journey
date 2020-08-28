/*
    Author: Jack Morgan

    Notes:
        - All times are in milliseconds.
*/


import jQuery from 'jquery';
window.$ = jQuery;
import anime from 'animejs/lib/anime.es.js';

// TODO: Possibly implement a dev mode to skip long transitions.
const DEBUG = true;

$(document).ready(function () {
    stage_1();
});


function stage_1() {
    $('#stage-1').removeClass('hidden');
    var landscape_svg = document.getElementById('landscape-view');
    landscape_svg.addEventListener('load', function () {
        if (DEBUG) {
            console.log('Landscape view loaded.');
        }
        animate_landscape_view();
    });
}

function animate_landscape_view() {
    var svg = get_svg('landscape-view');
    var svg_height = get_svg_height(svg);
    var container_height = $('#animation-container').height();
    var plains = svg.querySelector('#plains');
    var river = svg.querySelector('#river');
    var forest_layer_far = svg.querySelector('#forest-layer-far');
    var forest_layer_close = svg.querySelector('#forest-layer-close');
    var landscape_layers = [
        plains,
        river,
        forest_layer_far,
        forest_layer_close,
    ];

    // Move elements down
    var layer_down_amount = container_height * .5;
    if (DEBUG) {
        console.log('Moving landscape layers down by: ' + layer_down_amount + 'px.');
    }
    anime({
        targets: landscape_layers,
        translateY: layer_down_amount,
        duration: 0
    });

    var fade_out_duration = 3000;
    var text_duration = 4000;
    var delay_duration = (fade_out_duration + text_duration) * .9;
    var animation_duration = 30000;
    var translate_amount = (svg_height - container_height) * -1;
    var parallax_animation_duration = 0.4 * animation_duration;

    $('#animation-blindfold').fadeOut(fade_out_duration);
    //Show UI elements
    display_landscape_ui_1(fade_out_duration, text_duration);

    // Animate whole SVG upwards, with parallax effect on layers.
    var landscape_timeline = anime.timeline({
        duration: parallax_animation_duration,
        easing: 'easeOutQuad',
        delay: delay_duration,
    });
    landscape_timeline.add({
        targets: svg,
        translateY: translate_amount,
        duration: animation_duration,
        easing: 'easeInOutSine',
        complete: display_landscape_ui_2
    })
    .add({
        targets: plains,
        translateY: 0,
    }, animation_duration * 0.04)
    .add({
        targets: river,
        translateY: 0,
    }, animation_duration * 0.25)
    .add({
        targets: forest_layer_far,
        translateY: 0,
    }, animation_duration * 0.42)
    .add({
        targets: forest_layer_close,
        translateY: 0,
    }, animation_duration * 0.55);
}


function display_landscape_ui_1(fade_out_duration, text_duration) {
    console.log('Displaying Landscape View UI - 1.');
    var ui_elements = document.getElementById('landscape-ui-1').children;
    $(ui_elements).css('visibility', 'visible');
    var ui_timeline = anime.timeline({
        easing: 'linear',
    });
    ui_timeline.add({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: fade_out_duration,
        easing: 'linear'
    })
    .add({
        targets: ui_elements,
        opacity: 0,
        duration: 1000,
        delay: anime.stagger(750),
        easing: 'linear'
    }, '+=' + text_duration);
}

function display_landscape_ui_2() {
    console.log('Displaying Landscape View UI - 2.');
    var ui_elements = document.getElementById('landscape-ui-2').children;
    $(ui_elements).css('visibility', 'visible');
    anime({
        targets: ui_elements,
        opacity: 1,
        duration: 1000,
        delay: anime.stagger(750),
        easing: 'linear'
    });
}


function get_svg(id) {
    var svg_doc = document.getElementById(id).contentDocument;
    return svg_doc.getElementsByTagName('svg')[0];
}

function get_svg_height(svg) {
    return svg.getBoundingClientRect().height;
}

function get_svg_width(svg) {
    return svg.getBoundingClientRect().width;
}
