
const TITLE_TEXT = "AUDIO MOMENTS";
const INSTRUCTION_TEXT = "FEED THE BIRDS";

let ambience, scare, scare2, scare3, scatter;

let box_x, box_y;
let boxSize = 30;
let overBox = false;
let overPlay = false;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;
let colorShift = 0.3;

let vcrfont;
let fontSize = 32;

let mouseVel = 0.0

let timeElapsed = false;

const TITLE_SCREEN = 0,
      INSTRUCTIONS = 1,
      BIRDS = 2,
      FAILURE = 3,
      THREAT = 4,
      BASEMENT = 5,
      BASEMENT_SUCCESS = 6,
      SKY = 7;

let scene = TITLE_SCREEN;

function preload() {
    soundFormats('ogg', 'mp3');

    ambience = loadSound('assets/pigeons-ambient.ogg');
    scare = loadSound('assets/pigeons-scare.ogg');
    scare2 = loadSound('assets/pigeons-scare-2.ogg');
    scare3 = loadSound('assets/pigeons-scare-3.ogg');
    scatter = loadSound('assets/pigeons-scatter.ogg');

    scare.playMode('sustain');
    scare2.playMode('sustain');
    scare3.playMode('sustain');

    vcrfont = loadFont('assets/VCR_OSD_MONO_1.001.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight - 5);
  background(color(0,0,255));
  //ambience.loop();
  //ambience.stop(); // safety
  box_x = boxSize * 1.5;
  box_y = boxSize * 1.5;
  rectMode(RADIUS);

  textAlign(CENTER, CENTER);
  textFont(vcrfont);
  textSize(fontSize);
}

function draw() {
    document.documentElement.style.cursor = "default";
    if (scene === TITLE_SCREEN) {
        background(color(0,0,255));
        fill(200);
        text(TITLE_TEXT, width * 0.5, height * 0.1);
        text("PLAY", width * 0.5, height * 0.7);
        overPlay = false;

        if (mouseX > width * 0.5 - 50 &&
            mouseX < width * 0.5 + 50 &&
            mouseY > height * 0.7 - 10 &&
            mouseY < height * 0.7 + 20)
        {
            document.documentElement.style.cursor = "pointer";
            overPlay = true;
            text(">      ", width * 0.5, height * 0.7);
        }
    } else if (scene === INSTRUCTIONS) {
        if (!timeElapsed) {
            background(color(0,0,0));
            text(INSTRUCTION_TEXT,
                 width * 0.5 + random(-5, 5),
                 height * 0.3 + random(-5, 5));
            setTimeout(() => {timeElapsed = true;}, 3000);
        } else {
            scene = BIRDS;
        }

    } else if (scene === BIRDS) {
        let tileCount = 10;
        background(255);
        translate(width / tileCount / 2, height / tileCount / 2);
        strokeWeight(3);
        stroke(0);
        fill(255, 255, 255);
        text(mouseVel, width / 2, height / 2);

        for (let gridY = 0; gridY < tileCount; gridY++) {
            for (let gridX = 0; gridX < tileCount; gridX++) {
                let posX = width / tileCount * gridX;
                let posY = height / tileCount * gridY;
                let shiftX = random(-mouseVel, mouseVel + 10) * 2;
                let shiftY = random(-mouseVel, mouseVel + 10) * 2;
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
                document.documentElement.style.cursor = "grab";
            } else {
                document.documentElement.style.cursor = "grabbing";
            }
        } else {
            stroke(156, 39, 176);
            fill(244, 122, 158);
            overBox = false;
        }
        translate(-width / tileCount / 2, -height / tileCount / 2);
        rect(box_x, box_y, boxSize, boxSize);
    } else if (scene === FAILURE) {
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
    if (scene === TITLE_SCREEN) {
        if (overPlay) {
            ambience.loop();
            ambience.setVolume(0);
            ambience.setVolume(1, 3);
            scene = INSTRUCTIONS;
            return;
        }
    }
    else if (scene === BIRDS) {
        if (overBox) {
            locked = true;
            fill(255, 255, 255);
        } else {
            locked = false;
        }
        xOffset = mouseX - box_x;
        yOffset = mouseY - box_y;
    }
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
            if (mouseVel > 10 && mouseVel < 25) {
                switch(int(random(0,3))) {
                    case 0: scare.play(); break;
                    case 1: scare2.play(); break;
                    case 2: scare3.play(); break;
                    default: break;
                }
            }
        } else if (mouseVel >= 25) {
            scatterBirds();
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
    scene = FAILURE;
}
