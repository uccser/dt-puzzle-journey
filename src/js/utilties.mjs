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

export { get_svg, get_svg_height, get_svg_width };
