import { DEBUG } from './constants.mjs';


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


function equal_sets(set_a, set_b) {
    if (set_a.size !== set_b.size) return false;
    for (var a of set_a) if (!set_b.has(a)) return false;
    return true;
}


function mark_asset_as_ready(asset_id) {
    window.ready_assets.add(asset_id);
    if (DEBUG) {
        console.log('SVG #' + asset_id + ' loaded.');
    }
}


export { get_svg, get_svg_height, get_svg_width, equal_sets, mark_asset_as_ready};
