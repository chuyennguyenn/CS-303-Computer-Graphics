"use strict";

var gl;

var color = [0.0, 0.0, 0.0];
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    var vertices = [
        vec2(0,  1),
        vec2(-1,  0),
        vec2(1,  0),
        vec2(0, -1)
    ];


    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);

    colorLoc = gl.getUniformLocation(program, "uColor");

    // Initialize event handlers

    document.getElementById("RedSlider").onchange = function(event) {
      color[0] = (event.target.value)/100;
    };
    document.getElementById("GreenSlider").onchange = function(event) {
      color[1] = (event.target.value)/100;
    };
    document.getElementById("BlueSlider").onchange = function(event) {
      color[2] = (event.target.value)/100;
    };
    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform3f(colorLoc, color[0], color[1], color[2]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(
        function () {requestAnimationFrame(render);},
        500
    );
}
