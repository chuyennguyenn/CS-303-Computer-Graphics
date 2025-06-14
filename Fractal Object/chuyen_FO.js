"use strict";

var color = [];

var vertexColors = [
    vec4(1, 0, 0, 1), // red
    vec4(0, 1, 0, 1), // green
    vec4(0, 0, 1, 1), // blue
    vec4(1, 1, 0, 1), // yellow
    vec4(1, 0, 1, 1),  // magenta
    vec4(2 / 3, 1 / 4, 0, 1) // brown
];

var mountainExample = function () {
    var canvas;
    var gl;

    var positionsArray = [];

    var radius = 4;
    var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)           
    var aspect;       // Viewport aspect ratio                                     
    var eye;

    var modelViewMatrixLoc, projectionMatrixLoc;
    var modelViewMatrix, projectionMatrix;
    var theta = 0;

    const at = vec3(0.0, 1.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);

    window.onload = function init() {

        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        var vertices = [
            vec4(-1, 0, -0.5, 1),   //0
            //vec4(0, 0, 1, 1), 
            vec4(1, 0, -0.5, 1),    //1
            vec4(-1, 0, -1, 1),     //2
            vec4(1, 0, -1, 1),      //3
            vec4(-0.7, 0, -0.45, 1),//4
            vec4(0.7, 0, -0.45, 1), //5
            vec4(-0.4, 0, -0.2, 1), //6
            vec4(0.4, 0, -0.2, 1),  //7
            vec4(-1, 0, 0.2, 1),   //8
            vec4(1, 0, 0.2, 1),    //9
            vec4(-1, 0, 0.5, 1),    //10
            vec4(1, 0, 0.5, 1),     //11
            vec4(-1, 0, 1, 1),      //12
            vec4(1, 0, 1, 1)        //13

        ];


        //beach
        divideTriangle(vertices[10], vertices[3], vertices[11], 0.15, 4, 3);
        divideTriangle(vertices[10], vertices[2], vertices[11], 0.15, 4, 3);

        //mountain
        divideTriangle2(vertices[8], vertices[13], vertices[12], 0.3, 10, 5);
        divideTriangle2(vertices[8], vertices[13], vertices[9], 0.3, 10, 5);

        //water
        divideTriangle(vertices[2], vertices[3], vertices[6], 0.1, 4, 2);
        divideTriangle(vertices[4], vertices[5], vertices[2], 0.1, 4, 2);
        divideTriangle(vertices[4], vertices[5], vertices[3], 0.1, 4, 2);
        divideTriangle(vertices[6], vertices[7], vertices[2], 0.1, 4, 2);
        divideTriangle(vertices[6], vertices[7], vertices[3], 0.1, 4, 2);
        divideTriangle(vertices[4], vertices[5], vertices[6], 0.1, 4, 2);
        divideTriangle(vertices[4], vertices[5], vertices[7], 0.1, 4, 2);


        //divideSquare(vertices[0], vertices[1], vertices[2], vertices[3], 1, 10, 2);

        gl.viewport(0, 0, canvas.width, canvas.height);

        aspect = canvas.width / canvas.height;

        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);


        //
        //  Load shaders and initialize attribute buffers
        //
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);

        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

        render();
    }

    function triangle(a, b, c) {
        positionsArray.push(a, b, c);
    }

    function square(a, b, c, d) {
        positionsArray.push(a, b, c, d);
    }

    function divideSquare(a, b, c, d, factor, count, num) {
        if (count == 0) {
            triangle(a, b, c);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
            triangle(a, b, d);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
        }

        else {
            --count;
            var midpoint = mix(a, b, 0.5);
            var midpoint1 = mix(a, d, 0.5);
            var midpoint2 = mix(c, b, 0.5);
            var midpoint3 = mix(c, d, 0.5);

            midpoint = add(midpoint, vec4(0, factor * Math.random(), 0, 0));
            midpoint1 = add(midpoint1, vec4(0, factor * Math.random(), 0, 0));
            midpoint2 = add(midpoint2, vec4(0, factor * Math.random(), 0, 0));
            midpoint3 = add(midpoint3, vec4(0, factor * Math.random(), 0, 0));

            var newFactor = factor * 0.75;

            divideSquare(a, b, midpoint1, midpoint2, newFactor, count, num);
            divideSquare(c, d, midpoint1, midpoint2, newFactor, count, num);
            divideSquare(a, d, midpoint, midpoint3, newFactor, count, num);
            divideSquare(b, c, midpoint, midpoint3, newFactor, count, num);
        }
    }

    function divideTriangle(a, b, c, factor, count, num) {

        // check for end of recursion                                               

        if (count === 0) {
            triangle(a, b, c);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
            color.push(vertexColors[num]);
        }
        else {

            //find midpoint
            var midpoint = mix(c, mix(a, b, 0.5), 0.5);

            midpoint = add(midpoint, vec4(0, factor * Math.random(), 0, 0));

            // three new triangles                                                  
            --count;
            var newFactor = factor * 0.55;
            divideTriangle(a, b, midpoint, newFactor, count, num);
            divideTriangle(c, a, midpoint, newFactor, count, num);
            divideTriangle(b, c, midpoint, newFactor, count, num);


        }
    }

    function divideTriangle2(a, b, c, factor, count, num) {

        // check for end of recursion                                               

        if (count === 0) {
            triangle(a, b, c);

            var aveHeight = (a[1] + b[1] + c[1]) / 3;

            var colorNum;

            color.push(vertexColors[num]);

            if (aveHeight < 0.1) {
                colorNum = num;
            }

            else colorNum = 1;


            color.push(vertexColors[colorNum]);
            color.push(vertexColors[colorNum]);


        }
        else {

            //find midpoint
            var midpoint = mix(c, mix(a, b, 0.5), 1);

            midpoint = add(midpoint, vec4(0, factor, 0, 0));

            // three new triangles                                                  
            --count;
            var newFactor = factor * 0.55;
            divideTriangle2(a, b, midpoint, newFactor, count, num);
            divideTriangle2(c, a, midpoint, newFactor, count, num);
            divideTriangle2(b, c, midpoint, newFactor, count, num);


        }
    }


    var render = function () {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(radius * Math.cos(theta), 1, radius * Math.sin(theta));
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, 2, 10);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
        theta += 0.005;
        requestAnimationFrame(render);
    }

}
mountainExample();
