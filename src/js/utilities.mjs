import { DEBUG } from './constants.mjs';


export function get_svg(id) {
    var svg_doc = document.getElementById(id).contentDocument;
    return svg_doc.getElementsByTagName('svg')[0];
}


export function get_svg_height(svg) {
    return svg.getBoundingClientRect().height;
}


export function get_svg_width(svg) {
    return svg.getBoundingClientRect().width;
}


export function equal_sets(set_a, set_b) {
    if (set_a.size !== set_b.size) return false;
    for (var a of set_a) if (!set_b.has(a)) return false;
    return true;
}


export function mark_asset_as_ready(asset_id) {
    window.ready_assets.add(asset_id);
    if (DEBUG) {
        console.log('SVG #' + asset_id + ' loaded.');
    }
}


export function change_stage(level_id) {
    var animation_container = document.getElementById('animation-container');
    var change_event = new CustomEvent('journey:change_stage', { detail: level_id });
    animation_container.dispatchEvent(change_event);
}
