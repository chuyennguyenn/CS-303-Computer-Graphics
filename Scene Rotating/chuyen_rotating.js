"use strict";

var canvas;
var gl;

var numPositions = 18;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];
var theta1 = [0, 1, 0];
var theta2 = [1, 1, 1];

var theta3 = 0.0;
var dr = 5.0 * Math.PI / 180.0;
var phi = 0.0;
var radius = 4.0;

var thetaLoc;
var translateLoc;
var scaleLoc;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var s1 = 1;
var s2 = 0.8;
var s3 = 0.5;

var rotate = false;

var modelViewMatrixLoc;
var projectionMatrixLoc;

/* adding this 4 lines break the code for some reason?? 
var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;
*/

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorTrig();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    translateLoc = gl.getUniformLocation(program, "uTranslate");
    scaleLoc = gl.getUniformLocation(program, "uScale");

    //event listeners for buttons
    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
    };
    document.getElementById("Rotating").onclick = function () {     //for the middle one
        rotate = !rotate;
    };

    document.getElementById("Button1").onclick = function () { theta3 += dr; };
    document.getElementById("Button2").onclick = function () { theta3 -= dr; };

    render();
}

function colorTrig() {
    trig(0, 1, 2);
    trig(2, 0, 3);
    trig(3, 0, 4);
    trig(4, 0, 1);
    trig(1, 2, 3);
    trig(1, 3, 4);
}

function trig(a, b, c) {
    var vertices = [
        vec4(0, 0, 0.5, 1),    //0
        vec4(0.5, 0, 0, 1),    //1
        vec4(0, 0.5, 0, 1),    //2
        vec4(-0.5, 0, 0, 1),   //3
        vec4(0, -0.5, 0, 1)    //4
    ];

    var vertexColors = [
        vec4(1, 0, 0, 1), // red
        vec4(0, 1, 0, 1), // green
        vec4(0, 0, 1, 1), // blue
        vec4(1, 1, 0, 1), // yellow
        vec4(1, 0, 1, 1)  // magenta
    ];

    var indices = [a, b, c];

    for (var i = 0; i < indices.length; ++i) {
        positions.push(vertices[indices[i]]);
        //colors.push(vertexColors[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (rotate) {
        theta[axis] += 2.0; //mid
    }

    theta1[yAxis] += 2.0;   //left
    theta2[zAxis] += 0.0;   //right

    var eye = vec3(radius * Math.sin(theta3) * Math.cos(phi),
        radius * Math.sin(theta3) * Math.sin(phi),
        radius * Math.cos(theta3));


    var modelViewMatrix = lookAt(eye, at, up);
    var projectionMatrix = ortho(-2.0, 2.0, 2.0, -2.0, -10.0, 10.0);
    //var projectionMatrix = ortho(left, right, bottom, top, -10.0, 10.0);


    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //  mid
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform3fv(translateLoc, [0.0, 0.0, 0.0]);
    gl.uniform3fv(scaleLoc, [s1, s1, s1]);
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    // left
    gl.uniform3fv(thetaLoc, theta1);

    gl.uniform3fv(translateLoc, [-1.5, .0, 0.0]);
    gl.uniform3fv(scaleLoc, [s2, s2, s2]);
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    // right
    gl.uniform3fv(thetaLoc, theta2);

    gl.uniform3fv(translateLoc, [2, .0, 0.0]);
    gl.uniform3fv(scaleLoc, [s3, s3, s3]);
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
}