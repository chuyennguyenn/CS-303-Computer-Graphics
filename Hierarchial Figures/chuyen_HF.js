"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var uLflagLoc;
var rotationMatrixLoc;

var vertices = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var lightTheta = 0.0;
var lightAxis = 1;
var lightRotate = false;

var lightPosition = vec4(6.0, 6.0, 6.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;


var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var noseId = 11;
var leftEyeId = 12;
var rightEyeId = 13;
var leftEyeBrowId = 14;
var rightEyeBrowId = 15;
var leftLipId = 16;
var rightLipId = 17;


var torsoHeight = 5.0;
var torsoWidth = 1.0;

var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;

var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;

var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;

var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;

var headHeight = 1.5;
var headWidth = 1.0;

var noseWidth = 0.2;
var noseHeight = 0.2;
var noseDepth = 0.45;

var eyeSize = 0.1;
var eyeBrowSize = 0.05;
var eyeBrowLength = 0.25;

var lipSize = 0.08;
var lipLength = 0.25;

var numNodes = 18;
var numAngles = 11;
var angle = 0;

var theta3 = 0.0;
var dr = 5.0 * Math.PI / 180.0;
var phi = 0.0;
var radius = 4.0;

var animation = false;

const at = vec3(0.0, 3.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0, 90, 45, 45, 90, 90, 90, 90];
var theta2 = vec3(0, 0, 0);
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

var rotationMatrix = mat4();

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var nBuffer;
var colorBuffer;
var modelViewLoc;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];


var redColor = vec4(1.0, 0.0, 0.0, 1.0);
var blackColor = vec4(0.0, 0.0, 0.0, 1.0);
var pinkColor = vec4(1.0, 0.5, 0.5, 1.0);
var blueColor = vec4(0.0, 1.0, 0.0, 1.0);
var greenColor = vec4(0.0, 0.0, 1.0, 1.0);

var down = false;
var reverseLeft = false;


function scale4(a, b, c) {
    var result = mat4();
    result[0] = a;
    result[5] = b;
    result[10] = c;
    return result;
}


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:

            m = rotate(theta[torsoId], vec3(0, 1, 0));
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:

            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
            m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, noseId);
            break;

        case noseId:

            m = translate(0.0, 1.5 * headHeight / 5, headWidth / 2);
            m = mult(m, rotate(theta[noseId], vec3(1, 0, 0)));
            figure[noseId] = createNode(m, nose, leftEyeId, null);
            break;

        case leftEyeId:

            m = translate(-0.2, 3.8 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[leftEyeId], vec3(0, 0, 1)));
            figure[leftEyeId] = createNode(m, leftEye, rightEyeId, null);
            break;

        case rightEyeId:

            m = translate(0.2, 3.8 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[leftEyeId], vec3(0, 0, 1)));
            figure[rightEyeId] = createNode(m, rightEye, leftEyeBrowId, null);
            break;

        case leftEyeBrowId:

            m = translate(-0.24, 4.4 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[leftEyeBrowId], vec3(0, 0, 1)));
            figure[leftEyeBrowId] = createNode(m, leftEyeBrow, rightEyeBrowId, null);
            break;

        case rightEyeBrowId:

            m = translate(0.24, 4.4 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[rightEyeBrowId], vec3(0, 0, 1)));
            figure[rightEyeBrowId] = createNode(m, rightEyeBrow, leftLipId, null);
            break;

        case leftLipId:

            m = translate(-0.12, 0.5 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[leftLipId], vec3(0, 0, 1)));
            figure[leftLipId] = createNode(m, leftLip, rightLipId, null);
            break;

        case rightLipId:

            m = translate(0.12, 0.5 * headHeight / 5, headWidth / 3);
            m = mult(m, rotate(theta[rightLipId], vec3(0, 0, 1)));
            figure[rightLipId] = createNode(m, rightLip, null, null);
            break;

        case leftUpperArmId:

            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:

            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:

            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:

            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;

        case leftLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], vec3(1, 0, 0)));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

    }

}

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(redColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(redColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function nose() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(pinkColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(noseWidth, noseHeight, noseDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftEye() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(eyeSize, eyeSize, eyeSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightEye() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(eyeSize, eyeSize, eyeSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftEyeBrow() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(eyeBrowSize, eyeBrowLength, eyeBrowSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightEyeBrow() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(eyeBrowSize, eyeBrowLength, eyeBrowSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLip() {
    // gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(lipSize, lipLength, lipSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLip() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blackColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.5 * noseDepth));
    instanceMatrix = mult(instanceMatrix, scale(lipSize, lipLength, lipSize));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(greenColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(greenColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(greenColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(greenColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blueColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blueColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blueColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    //gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(blueColor));
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //
    //  Load shaders and initialize attribute buffers

    gl.enable(gl.DEPTH_TEST);
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    var eye = vec3(radius * Math.sin(theta3) * Math.cos(phi),
        radius * Math.sin(theta3) * Math.sin(phi),
        radius * Math.cos(theta3));

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -30.0, 30.0);
    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    uLflagLoc = gl.getUniformLocation(program, "uLflag");
    gl.uniform1i(uLflagLoc, lightRotate);

    rotationMatrix = mat4();

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    document.getElementById("slider0").onchange = function (event) {
        theta[torsoId] = event.target.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function (event) {
        theta[head1Id] = event.target.value;
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function (event) {
        theta[leftUpperArmId] = event.target.value;
        initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function (event) {
        theta[leftLowerArmId] = event.target.value;
        initNodes(leftLowerArmId);
    };

    document.getElementById("slider4").onchange = function (event) {
        theta[rightUpperArmId] = event.target.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function (event) {
        theta[rightLowerArmId] = event.target.value;
        initNodes(rightLowerArmId);
    };
    document.getElementById("slider6").onchange = function (event) {
        theta[leftUpperLegId] = event.target.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function (event) {
        theta[leftLowerLegId] = event.target.value;
        initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function (event) {
        theta[rightUpperLegId] = event.target.value;
        initNodes(rightUpperLegId);
    };
    document.getElementById("slider9").onchange = function (event) {
        theta[rightLowerLegId] = event.target.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function (event) {
        theta[head2Id] = event.target.value;
        initNodes(head2Id);
    };

    document.getElementById("Animation").onclick = function () {
        animation = !animation;
    }

    document.getElementById("LightButton").onclick = function () {
        lightRotate = !lightRotate;
        gl.uniform1i(gl.getUniformLocation(program, "uLflag"), lightRotate);
    };

    for (i = 0; i < numNodes; i++) initNodes(i);

    render();
}


var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (animation) {
        theta[leftUpperArmId] += 1;
        theta[rightUpperArmId] += 1;
        initNodes(rightUpperArmId);
        initNodes(leftUpperArmId);

        if (theta[leftUpperLegId] != 225 && reverseLeft == false) {
            theta[leftUpperLegId] += 1;
            theta[rightUpperLegId] -= 1;

            if (theta[leftLowerLegId] == 45) {
                theta[leftLowerLegId] += 0;
            } else theta[leftLowerLegId] -= 1;

            if (theta[rightLowerLegId] == 0) {
                theta[rightLowerLegId] += 0;
            } else theta[rightLowerLegId] += 1;


            if (theta[leftUpperLegId] == 225) {
                reverseLeft = true;
            }
        }

        if (theta[leftUpperLegId] != 135 && reverseLeft == true) {
            theta[leftUpperLegId] -= 1;
            theta[rightUpperLegId] += 1;

            if (theta[leftLowerLegId] == 0) {
                theta[leftLowerLegId] += 0;
            } else theta[leftLowerLegId] += 1;

            if (theta[rightLowerLegId] == 45) {
                theta[rightLowerLegId] += 0;
            } else theta[rightLowerLegId] -= 1;

            if (theta[leftUpperLegId] == 135) {
                reverseLeft = false;
            }
        }

        initNodes(leftLowerLegId);
        initNodes(leftUpperLegId);
        initNodes(rightUpperLegId);
        initNodes(rightLowerLegId);
    }

    traverse(torsoId);

    if (lightRotate) {
        theta2[yAxis] += 2.0;
        rotationMatrix = rotate(theta2[yAxis], vec3(0, 1, 0));
    }
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uRotationMatrix"), false, flatten(rotationMatrix));


    requestAnimationFrame(render);
}