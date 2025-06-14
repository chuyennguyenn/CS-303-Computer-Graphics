"use strict";

var gl;
var positions =[];
var colors = [];

var numPositions = 3000000;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three positions.

    var vertices = [
        vec3(-1, 0, 0), //4 corners of building 
        vec3(1, 0, 0),
        vec3(-1, -1, 0),
        vec3(1, -1, 0),
    ];

    var baseColors = [
        vec3(1, 0, 0),  //red
        vec3(0, 1, 0),  //green
        vec3(0, 0, 1),  //blue
        vec3(0, 0, 0),  //black
        vec3(1, 1, 1)   //white
    ];

    var roof = [
        vec3(0, 1, 0), //top of rooftop
        vec3(-1, 0, 0), //2 bases
        vec3(1, 0, 0)
    ];

    var wallLeft = [
        vec3(-1, -1, 0),
        vec3(-0.1, 0, 0),
        vec3(-0.1, -1, 0),
        vec3(-1, 0, 0)
    ];

    var wallRight = [
        vec3(1, -1, 0),
        vec3(0.1, 0, 0),
        vec3(0.1, -1, 0),
        vec3(1, 0, 0)
    ];

    var connect = [
        vec3(-0.1, -0.5, 0),
        vec3(0.1, -0.5, 0),
        vec3(-0.1, 0, 0),
        vec3(0.1, 0, 0)
    ];


    var door = [
        vec3(-0.1, -1, 0),
        vec3(0.1, -1, 0),
        vec3(-0.1, -0.5, 0),
        vec3(0.1, -0.5, 0)
    ];

    var u1 = add(roof[0], roof[1]);
    var v1 = add (roof[0], roof[2]);
    var p1 = mult (0.25, add(u1, v1));
    var p;

    positions.push(p1);

    for ( var i = 0; positions.length < numPositions/5; ++i ) {
        var j = Math.floor(3*Math.random());

        p1 = add(positions[i], roof[j]);
        p1 = mult(0.5, p1);
        positions.push(p1);
        colors.push(baseColors[0]);
    }

    positions.push(wallLeft[0]);

    for ( var i = 0; positions.length < numPositions*2/5; ++i ) {
        var j = Math.floor(4*Math.random());

        p = add(positions[numPositions/5+i], wallLeft[j]);
        p = mult(0.5, p);
        positions.push(p);
        colors.push(baseColors[2]);
    }

    positions.push(wallRight[0]);

    for ( var i = 0; positions.length < numPositions*3/5; ++i ) {
        var j = Math.floor(4*Math.random());

        p = add(positions[numPositions*2/5+i], wallRight[j]);
        p = mult(0.5, p);
        positions.push(p);
        colors.push(baseColors[2]);
    }

    positions.push(door[0]);

    for ( var i = 0; positions.length < numPositions*4/5; ++i ) {
        var j = Math.floor(4*Math.random());

        p = add(positions[numPositions*3/5+i], door[j]);
        p = mult(0.5, p);
        positions.push(p);
        colors.push(baseColors[3]);
    }

    positions.push(connect[0]);

    for ( var i = 0; positions.length < numPositions; ++i ) {
        var j = Math.floor(4*Math.random());

        p = add(positions[numPositions*4/5+i], connect[j]);
        p = mult(0.5, p);
        positions.push(p);
        colors.push(baseColors[2]);
    }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINES, 0, positions.length);
}
