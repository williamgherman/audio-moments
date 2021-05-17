

let ambience, scare, scare2, scare3, scatter;

let box_x, box_y;
let boxSize = 30;
let overBox = false;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;
let colorShift = 0.3;

let mouseVel;

// 0 Birds
// 1 Cave
// 2 Sky
let scene = 0;

function preload() {
    soundFormats('ogg', 'mp3');
    ambience = loadSound('audio/pigeons-ambient.ogg');
    scare = loadSound('audio/pigeons-scare.ogg');
    scare2 = loadSound('audio/pigeons-scare-2.ogg');
    scare3 = loadSound('audio/pigeons-scare-3.ogg');
    scatter = loadSound('audio/pigeons-scatter.ogg');


    scare.playMode('sustain');
    scare2.playMode('sustain');
    scare3.playMode('sustain');
}
function setup() {
  createCanvas(windowWidth, windowHeight - 5);
  background(255);
  ambience.loop();
  ambience.stop(); // safety
  box_x = boxSize * 1.5;
  box_y = boxSize * 1.5;
  rectMode(RADIUS);
}

function draw() {
    if (scene === 0) {
        let tileCount = 10;
        background(255);
        translate(width / tileCount / 2, height / tileCount / 2);
        strokeWeight(3);
        stroke(0);
        fill(255, 255, 255);
        text(mouseVel, 0, 1/4);

        for (var gridY = 0; gridY < tileCount; gridY++) {
            for (var gridX = 0; gridX < tileCount; gridX++) {
                var posX = width / tileCount * gridX;
                var posY = height / tileCount * gridY;
                var shiftX = random(-box_x, box_x) / 90;
                var shiftY = random(-box_x, box_x) / 90;
                ellipse(posX + shiftX, posY + shiftY, 15, 15);
            }
        }

        if (mouseX > box_x - boxSize &&
            mouseX < box_x + boxSize &&
            mouseY > box_y - boxSize &&
            mouseY < box_y + boxSize)
        {
            overBox = true;
            if (!locked) {
                stroke(255);
                fill(244, 122, 158);
            }
        } else {
            stroke(156, 39, 176);
            fill(244, 122, 158);
            overBox = false;
        }
        translate(-width / tileCount / 2, -height / tileCount / 2);
        rect(box_x, box_y, boxSize, boxSize);
    } else if (scene === 1) {
        if (colorShift < 1.0) {
            background(lerpColor(color(255,255,255), color(0,0,0), colorShift));
            colorShift += 0.01;
        }
        else {
            background(0);
        }


    }
}

function mousePressed() {
    if (!ambience.isPlaying())
        ambience.play();
    if (overBox) {
        locked = true;
        fill(255, 255, 255);
    } else {
        locked = false;
    }
    xOffset = mouseX - box_x;
    yOffset = mouseY - box_y;
}

function mouseDragged() {
    if (locked) {
        box_x = mouseX - xOffset;
        box_y = mouseY - yOffset;
        mouseVel = Math.sqrt(Math.pow((pmouseX - mouseX), 2) +
                                 Math.pow((pmouseY - mouseY), 2));
        if (!(scare.isPlaying() || scare2.isPlaying() || scare3.isPlaying()
            || scatter.isPlaying()))
        {
            if (mouseVel > 100 && mouseVel < 150) {
                switch(int(random(0,3))) {
                    case 0: scare.play(); break;
                    case 1: scare2.play(); break;
                    case 2: scare3.play(); break;
                    default: break;
                }
            } else if (mouseVel >= 150) {
                scatterBirds();
            }
        }
    }
}

function mouseReleased() {
    locked = false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 5);
}

function scatterBirds() {
    scatter.play();
    ambience.stop();
    scene = 1;
}
