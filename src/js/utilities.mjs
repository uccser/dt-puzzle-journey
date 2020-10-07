import {
    DEBUG,
    UI_FADE_DURATION,
    UI_STAGGER_DEFAULT,
    SMOKE_FAST_DURATION,
    SMOKE_SLOW_DURATION,
} from './constants.mjs';
import { playFX } from './audio.mjs';

// Import third party libraries
import anime from 'animejs/lib/anime.es.js';


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


export function getRandomInt(min, max) {
    // The maximum is exclusive and the minimum is inclusive
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


export function getRandomIntInclusive(min, max) {
    // The maximum is inclusive and the minimum is inclusive
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


export function animateSmoke(fast_smoke, slow_smoke) {
    fast_smoke.forEach(function (smoke_element) {
        anime({
            targets: smoke_element,
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'linear',
            duration: SMOKE_FAST_DURATION,
            loop: true
        });
    });
    slow_smoke.forEach(function (smoke_element) {
        anime({
            targets: smoke_element,
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'linear',
            duration: SMOKE_SLOW_DURATION,
            loop: true
        });
    });
}


export function showUiElements(ui_elements, duration=UI_FADE_DURATION,  stagger_amount=UI_STAGGER_DEFAULT, complete) {
    // Fade UI elements from white to colour, also with scaling.
    if (!Array.isArray(ui_elements)) {
        ui_elements = [ui_elements];
    }
    var timeline = anime.timeline({
        duration: duration,
        easing: 'easeOutCubic',
        autoplay: false,
        complete: complete,
    });
    var stagger_operator = '+';
    if (stagger_amount < 0) {
        stagger_operator = '-'
        stagger_amount *= -1;
    }
    ui_elements.forEach(function (ui_element, index) {
        // Setup animation options
        let options = {
            targets: ui_element,
            opacity: [0, 1],
            scale: [1.3, 1],
            begin: function () {
                ui_element.style.visibility = 'visible';
                ui_element.style.pointerEvents = 'auto';
                if (ui_element.classList.contains('ui-text')) {
                    playFX('writing');
                }
            },
        };
        if (index == 0) {
            timeline.add(options);
        } else {
            timeline.add(options, `${stagger_operator}=${stagger_amount}`);
        }
    });
    timeline.play();
}


export function hideUiElements(ui_elements, duration=UI_FADE_DURATION, stagger_amount=UI_STAGGER_DEFAULT, complete) {
    // Fade UI elements until hidden
    if (!Array.isArray(ui_elements)) {
        ui_elements = [ui_elements];
    }
    var timeline = anime.timeline({
        duration: duration,
        easing: 'easeOutCubic',
        autoplay: false,
        complete: complete,
    });
    var stagger_operator = '+';
    if (stagger_amount < 0) {
        stagger_operator = '-'
        stagger_amount *= -1;
    }
    ui_elements.forEach(function (ui_element, index) {
        let options = {
            targets: ui_element,
            opacity: [1, 0],
            scale: [1, 0.7],
            complete: function () {
                ui_element.style.visibility = 'hidden';
                ui_element.style.pointerEvents = 'none';
            }
        };
        if (index == 0) {
            timeline.add(options);
        } else {
            timeline.add(options, `${stagger_operator}=${stagger_amount}`);
        }
    });
    timeline.play();
}
