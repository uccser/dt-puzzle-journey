import { DEBUG } from './constants.mjs';


export function getSvg(id) {
    var svg_doc = document.getElementById(id).contentDocument;
    return svg_doc.getElementsByTagName('svg')[0];
}


export function getSvgHeight(svg) {
    return svg.getBoundingClientRect().height;
}


export function getSvgWidth(svg) {
    return svg.getBoundingClientRect().width;
}


export function equalSets(set_a, set_b) {
    if (set_a.size !== set_b.size) return false;
    for (var a of set_a) if (!set_b.has(a)) return false;
    return true;
}


export function markAssetAsReady(asset_id) {
    window.ready_assets.add(asset_id);
    if (DEBUG) {
        console.log('SVG #' + asset_id + ' loaded.');
    }
}


export function changeStage(level_id) {
    var animation_container = document.getElementById('animation-container');
    var change_event = new CustomEvent('journey:change_stage', { detail: level_id });
    animation_container.dispatchEvent(change_event);
}


export function setSvgElementAnchor(svgs) {
    if (!Array.isArray(svgs)) {
        svgs = [svgs];
    }
    svgs.forEach(function (item) {
        item.style.transformBox = 'fill-box';
    });
}


export function addStylesToSvg(svg) {
    var styles = `
    .interactable {
        cursor: pointer;
    }`;
    var style_element = document.createElement('style');
    svg.appendChild(style_element);
    var style_sheet = style_element.sheet;
    style_sheet.insertRule(styles);
}
