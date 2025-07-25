"use strict";

var gl;
var positions = [];
var positions1 = [];

var numPositions = 100000;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three positions.

    var vertices = [
        vec2(-1, -1),
        vec2(-0.5, 0),
        vec2(0, -1)
    ];

    var vertices1 = [
        vec2(0, -1),
        vec2(0.5, 0),
        vec2(1, -1)
    ];

    // Specify a starting positions p for our iterations
    // p must lie inside any set of three vertices

    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = mult(0.25, add(u, v));

    var u1 = add(vertices1[0], vertices1[1]);
    var v1 = add(vertices1[0], vertices1[2]);
    var p1 = mult(0.25, add(u1, v1));

    // And, add our initial positions into our array of points

    positions.push(p);

    // Compute new positions
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for (var i = 0; positions.length < numPositions / 2; ++i) {
        var j = Math.floor(3 * Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }

    positions.push(p1);

    for (var i = 0; positions.length < numPositions; ++i) {
        var j = Math.floor(3 * Math.random());

        p1 = add(positions[numPositions / 2 + i], vertices1[j]);
        p1 = mult(0.5, p1);
        positions.push(p1);
    }



    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, positions.length);
}
