"use strict";

var color = [];
var rotating = false;

var global_time = 0;
var ripple_time = 10;
var start_time = 0;
var grid = [];
var src = [];

var vBuffer;
var cBuffer;

var light = 1.0;
var rain = false;
var lightTime = 2;
var start = false;

var rainSrc = [];
var rainY = 1.5;
var cubeFalling = false;
var rainX = 0.0;
var rainZ = 0.0;
var rainTime = 0.0;
var stopRain = true;

var vertexColors = [
    vec4(1, 0, 0, 1), // red,0
    vec4(0, 1, 0, 1), // green,1
    vec4(0, 0, 1, 1), // blue,2
    vec4(1, 1, 0, 1), // yellow,3
    vec4(1, 0, 1, 1),  // magenta,4
    vec4(2 / 3, 1 / 4, 0, 1), // brown,5
    vec4(0.1, 0.1, 0.7, 1), // lake blue - surface waves,6
    vec4(0.0, 0.1, 0.3, 1), // ocean blue - under wave,7
    vec4(0.9, 0.95, 1.0, 1) // foamy blue - foamy wave, 8

];

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

    const at = vec3(0.0, 0.5, 0.0);
    const up = vec3(0.0, 1.0, 0.0);

    window.onload = function init() {

        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);

        aspect = canvas.width / canvas.height;

        gl.clearColor(0.0, 0.05, 0.1, 1.0);

        gl.enable(gl.DEPTH_TEST);

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

        document.getElementById("rotating").onclick = function () {
            rotating = !rotating;
        }

        document.getElementById("rain").onclick = function () {
            rain = true;
            stopRain = false;
            rainTime = 0;
        }

        document.getElementById("stop").onclick = function () {
            stopRain = true;
        }

        updateMesh();

        render();
    }

    function updateMesh() {

        positionsArray.length = 0;
        color.length = 0;

        //mountain
        divideTriangle2(vertices[8], vertices[13], vertices[12], 0.3, 10, 5);
        divideTriangle2(vertices[8], vertices[13], vertices[9], 0.3, 10, 5);

        //lake
        ripple(2);

        if (rain && lightTime == 1) {
            addFallingCube();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);

    }

    function triangle(a, b, c) {
        positionsArray.push(a, b, c);
    }

    function lightIntensity(baseColor) {
        var brightness = Math.min(Math.max(0.6, lightTime * 0.6), 1.0);
        light = brightness;

        return vec4(
            baseColor[0] * light,
            baseColor[1] * light,
            baseColor[2] * light,
            1.0
        );
    }

    function waveIntensity(waveData, baseColor) {
        var normalized = Math.min(1.0, Math.abs(waveData) / 0.02);
        var intensity = 0.6 + 0.7 * normalized;

        return vec4(
            baseColor[0] * intensity,
            baseColor[1] * intensity,
            baseColor[2] * intensity,
            1.0
        );
    }

    function ripple(num) {
        const step = 0.03;
        const amplitude = 0.01;
        const frequency = 20;

        for (var x = -1, xi = 0; x <= 1; x += step, xi++) {
            grid[xi] = [];
            for (var z = -1, zi = 0; z <= 0.5; z += step, zi++) {

                var totalDx = 0;
                var totalDz = 0;
                var dx = 0;
                var dz = 0;
                var wave = 0;

                for (const source of src) {
                    dx = x - source.x;
                    dz = z - source.z;
                    var r = Math.sqrt(dx * dx + dz * dz) * 2;

                    var decay = Math.exp(-r * 0.5) / (1 + r * 3);
                    var delay = r / 1.5;
                    var localTime = global_time - delay - source.start_time;

                    if (localTime < 0 || localTime > ripple_time) {
                        continue;
                    }

                    var timeRatio = 1 - localTime / ripple_time;
                    var fade = Math.max(0.0, timeRatio);
                    wave = amplitude * fade * decay * Math.sin(frequency * r - localTime * 2.0 * Math.PI);
                    totalDx += (dx / r) * wave;
                    totalDz += (dz / r) * wave;

                }

                var nx = x + totalDx;
                var nz = z + totalDz;

                grid[xi][zi] = vec4(nx, wave, nz, 1.0);
            }
        }

        const rows = grid.length;
        const cols = grid[0].length;

        for (var xi = 0; xi < rows - 1; xi++) {
            for (var zi = 0; zi < cols - 1; zi++) {

                var baseCol = vertexColors[num];
                var w1 = grid[xi][zi];
                var w2 = grid[xi + 1][zi];
                var w3 = grid[xi][zi + 1];
                var w4 = grid[xi + 1][zi + 1];

                positionsArray.push(w1);
                positionsArray.push(w2);
                positionsArray.push(w4);
                color.push(lightIntensity(waveIntensity(w1[1], baseCol)));
                color.push(lightIntensity(waveIntensity(w2[1], baseCol)));
                color.push(lightIntensity(waveIntensity(w4[1], baseCol)));

                positionsArray.push(w1);
                positionsArray.push(w3);
                positionsArray.push(w4);
                color.push(lightIntensity(waveIntensity(w1[1], baseCol)));
                color.push(lightIntensity(waveIntensity(w3[1], baseCol)));
                color.push(lightIntensity(waveIntensity(w4[1], baseCol)));
            }
        }
    }

    function addFallingCube() {
        if (!rainSrc.length) return;

        for (const source of rainSrc) {
            const size = 0.01;
            const x = source.x;
            const z = source.z;
            const y = source.y
            const vertices = [
                vec4(x - size, y - size, z + size, 1),
                vec4(x - size, y + size, z + size, 1),
                vec4(x + size, y + size, z + size, 1),
                vec4(x + size, y - size, z + size, 1),
                vec4(x - size, y - size, z - size, 1),
                vec4(x - size, y + size, z - size, 1),
                vec4(x + size, y + size, z - size, 1),
                vec4(x + size, y - size, z - size, 1)
            ];

            const blue = vertexColors[2];

            function quad(a, b, c, d) {
                positionsArray.push(vertices[a], vertices[b], vertices[c]);
                positionsArray.push(vertices[a], vertices[c], vertices[d]);
                color.push(blue, blue, blue, blue, blue, blue);
            }

            quad(1, 0, 3, 2); // front
            quad(2, 3, 7, 6); // right
            quad(3, 0, 4, 7); // bottom
            quad(6, 5, 1, 2); // top
            quad(4, 5, 6, 7); // back
            quad(5, 4, 0, 1); // left
        }
    }

    function divideTriangle2(a, b, c, factor, count, num) {

        if (count === 0) {
            triangle(a, b, c);

            var aveHeight = (a[1] + b[1] + c[1]) / 3;

            var colorNum;

            color.push(vertexColors[num]);

            if (aveHeight < 0.1) {
                colorNum = num;
            }

            else colorNum = 1;

            color.push(lightIntensity(vertexColors[colorNum]));
            color.push(lightIntensity(vertexColors[colorNum]));

        }
        else {

            var midpoint = mix(c, mix(a, b, 0.6), 1.01);
            midpoint = add(midpoint, vec4(0, factor, 0, 0));
            --count;
            var newFactor = factor * 0.55;
            divideTriangle2(a, b, midpoint, newFactor, count, num);
            divideTriangle2(c, a, midpoint, newFactor, count, num);
            divideTriangle2(b, c, midpoint, newFactor, count, num);

        }
    }

    var render = function () {

        global_time += 0.01;

        if (rain) {
            if (!stopRain) {
                rainTime += 0.5;
                if (rainTime >= 0.5) {
                    rainX = Math.random() * 2 - 1;
                    rainZ = Math.random() * 2 - 1;
                    rainSrc.push({ x: rainX, y: rainY, z: rainZ });
                    rainTime = 0;
                }
            }

            lightTime -= 0.1;
            if (lightTime <= 1) {
                lightTime = 1;
            }
        }

        for (let i = 0; i < rainSrc.length; i++) {
            rainSrc[i].y -= 0.05;

            if (rainSrc[i].y <= 0) {
                src.push({ x: rainSrc[i].x, z: rainSrc[i].z, start_time: global_time });
            }
        }

        if (rainSrc.length == 0 && stopRain == true) {
            rain = false;
        }

        if (!rain && rainSrc.length === 0) {
            lightTime += 0.1;
            if (lightTime >= 2) {
                lightTime = 2;
            }
        }


        updateMesh();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(radius * Math.cos(theta), 1.5, radius * Math.sin(theta));
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, 2, 10);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        src = src.filter(source => global_time - source.start_time <= ripple_time);

        rainSrc = rainSrc.filter(drop => drop.y > 0);

        gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
        //gl.drawArrays(gl.LINES, 0, positionsArray.length);
        if (rotating) {
            theta -= 0.05;
        }
        requestAnimationFrame(render);
    }

}
mountainExample();
