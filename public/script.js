/*
 * AUDIO MOMENTS
 * a audio-visual game using p5.js
 *
 * demo available running at:
 * https://williamgherman.netlify.app
 *
 * Author: William Gherman
 * Date: 2021-05-31
 */
const TITLE_TEXT = "AUDIO MOMENTS";
const CREDITS = "BY WILLIAM GHERMAN";
const INSTRUCTION_TEXT = "FEED THE BIRDS";
const FAIL_TEXT_1 = "YOU SCARED THE BIRDS AWAY";
const FAIL_TEXT_2 = "YOU CAN NEVER DO ANYTHING RIGHT";
const BASEMENT_INSTRUCTIONS = "I'M LOCKING YOU IN THE BASEMENT\n" +
                              "UNTIL YOU LEARN HOW TO BEHAVE";
const BACK_OUTSIDE_TEXT = "WHATEVER. JUST LEAVE THE FOOD BY THE BENCH.";
const SUCCESS_1 = "... THANK YOU.";

const formResolution = 7;

// sounds
let ambience, scare, scare2, scare3, scatter, doorCreak, unlock, darkRoom,
    failure, success1, success2, success3;

// scene objects
let box_x, box_y;
let boxSize = 30;
let benchX;
let benchY;

let bagSprite, benchSprite;

// object properties
let overBox = false;
let overPlay = false;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;
let colorShift = 0.3;
let angle;
let xPoints = [], yPoints = [];
let initRadius = 50;
let focusX, focusY;
let blobs = [];

// font
let vcrfont;
let fontSize = 32;

let mouseVel = 0.0

let timeElapsed = false;
let alreadyRan = false;
let musicPlaying = false;
let benchVisible;

let gotKeys = false;
let unlockedDoor = false;
let openedDoor = false;

// granulator setup
let src_length;
let voices = [];
let num_voices = 50;
let poly_counter = 0;
let grainDur = 1;

const TITLE_SCREEN = 0,
      INSTRUCTIONS = 1,
      BIRDS = 2,
      FAILURE = 3,
      THREAT = 4,
      BASEMENT = 5,
      BASEMENT_SUCCESS = 6,
      SUCCESS = 7;
      END_SCREEN = 8;

let scene = TITLE_SCREEN;

function preload() {
    soundFormats('ogg', 'mp3');

    ambience = loadSound('assets/pigeons-ambient.ogg');
    scare = loadSound('assets/pigeons-scare.ogg');
    scare2 = loadSound('assets/pigeons-scare-2.ogg');
    scare3 = loadSound('assets/pigeons-scare-3.ogg');
    scatter = loadSound('assets/pigeons-scatter.ogg');
    darkRoom = loadSound('assets/dark-room.ogg');
    doorCreak = loadSound('assets/door-creak.ogg');
    unlock = loadSound('assets/basement-sounds.ogg');

    failure = loadSound('assets/failure.ogg');
    success1 = loadSound('assets/success1.ogg');
    success2 = loadSound('assets/success2.ogg');
    success3 = loadSound('assets/success3.ogg');

    scare.playMode('sustain');
    scare2.playMode('sustain');
    scare3.playMode('sustain');
    darkRoom.playMode('sustain');

    vcrfont = loadFont('assets/VCR_OSD_MONO_1.001.ttf');

    benchSprite = loadImage('assets/benchSprite.png');
    bagSprite = loadImage('assets/bagSprite.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight - 5);
    background(color(0,0,255));
    box_x = boxSize * 1.5;
    box_y = boxSize * 1.5;
    rectMode(RADIUS);
    benchX = width * 0.5;
    benchY = height * 0.3;

    textAlign(CENTER, CENTER);
    textFont(vcrfont);
    textSize(fontSize);

    angle = radians(360 / formResolution);
    for (let i = 0; i < formResolution; i++) {
        xPoints.push(cos(angle * i) * initRadius);
        yPoints.push(sin(angle * i) * initRadius);
    }

    focusX = width / 2;
    focusY = height / 2;

    src_length = unlock.duration();
    for (let i = 0; i < num_voices; i++) {
        let voice = new GranularVoice(unlock, grainDur);
        voices.push(voice);
    }
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
                 width * 0.5 + random(-3, 3),
                 height * 0.3 + random(-3, 3));
            if (!alreadyRan) {
                setTimeout(() => {timeElapsed = true;}, 3000);
                alreadyRan = true;
            }
        } else {
            scene = BIRDS;
            alreadyRan = false;
        }

    } else if (scene === BIRDS) {
        timeElapsed = false;
        alreadyRan = false;
        let tileCount = 10;
        background(255);
        if (benchVisible) {
            image(benchSprite, benchX, benchY, benchSprite.width / 10,
                  benchSprite.height / 10);
        }
        translate(width / tileCount / 2, height / tileCount / 2);
        strokeWeight(3);
        stroke(0);
        fill(255, 255, 255);
        // text(mouseVel, width / 2, height / 2);

        for (let gridY = 0; gridY < tileCount; gridY++) {
            for (let gridX = 0; gridX < tileCount; gridX++) {
                let posX = width / tileCount * gridX;
                let posY = height / tileCount * gridY;
                let shiftX = random(-mouseVel, mouseVel + 2) * 2;
                let shiftY = random(-mouseVel, mouseVel + 2) * 2;
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
                //stroke(255);
                //fill(244, 122, 158);
                document.documentElement.style.cursor = "grab";
            } else {
                document.documentElement.style.cursor = "grabbing";
            }
        } else {
            // stroke(156, 39, 176);
            // fill(244, 122, 158);
            overBox = false;
        }
        translate(-width / tileCount / 2 - 20, -height / tileCount / 2 - 20);
        // rect(box_x, box_y, boxSize, boxSize);
        image(bagSprite, box_x, box_y, bagSprite.width / 10,
              bagSprite.height / 10);
    } else if (scene === FAILURE) {
        if (colorShift < 1.0) {
            background(lerpColor(color(255,255,255), color(0,0,0), colorShift));
            colorShift += 0.01;
            alreadyRan = false;
        }
        else {
            background(color(0,0,0));
            text(FAIL_TEXT_1,
                 width * 0.5 + random(-3, 3),
                 height * 0.3 + random(-3, 3));
            if (!alreadyRan) {
                setTimeout(() => {timeElapsed = true;}, 3000);
                alreadyRan = true;
            }
            if (timeElapsed) {
                text(FAIL_TEXT_2,
                     width * 0.5 + random(-3, 3),
                     height * 0.4 + random(-3, 3));
                setTimeout(() => {scene = BASEMENT;}, 3000);
            }
        }


    } else if (scene === BASEMENT) {
        if (!musicPlaying) {
            darkRoom.loop();
            darkRoom.setVolume(1, 3);
            musicPlaying = true;
            colorShift = 0.3
        }
        push();
            background(color(0,0,0));
            text(BASEMENT_INSTRUCTIONS,
                 width * 0.5 + random(-1,1),
                 height * 0.1 + random(-1,1));
        pop();
        push();
            fill(0);
            if (openedDoor) stroke(color(0, 0, 255));
            else if (unlockedDoor) stroke(color(0, 255, 0));
            else if (gotKeys) stroke(color(255, 255, 25));
            else stroke(255);
            focusX += (mouseX - focusX) * 0.01;
            focusY += (mouseY - focusY) * 0.01;
            for (let i = 0; i < formResolution; i++) {
                xPoints[i] += random(-2, 2);
                yPoints[i] += random(-2, 2);
            }
            let currentBlob = new basementBlob(focusX, focusY, xPoints, yPoints);
            blobs.push(currentBlob);
            if (blobs.length > 50) {
                blobs.splice(0,1);
            }
            for (let i = 0; i < blobs.length; i++)
                blobs[i].drawBlob();
        pop();

    } else if (scene === BASEMENT_SUCCESS) {
        darkRoom.stop();
        musicPlaying = false;
        gotKeys = false;
        unlockedDoor = false;
        openedDoor = false;
        background(color(130,130,130));
        text(BACK_OUTSIDE_TEXT, width * 0.5 + random(-2, 2),
                                height * 0.3 + random(-2, 2));
        setTimeout(() => { scene = BIRDS;}, 5000);
        box_x = boxSize * 1.5;
        box_y = boxSize * 1.5;
        benchVisible = true;
        mouseVel = 0;
    } else if (scene === SUCCESS) {
        background(color(0, 0, 255));
        text(SUCCESS_1, width / 2, height / 2);
        setTimeout(() => {scene = END_SCREEN;}, 6000);
        box_x = boxSize * 1.5;
        box_y = boxSize * 1.5;
    } else if (scene === END_SCREEN) {
        background(color(0, 0, 255));
        text(TITLE_TEXT, width / 2, height * 0.3);
        text(CREDITS, width / 2, height * 0.6);
    }
}

function basementBlob(fx, fy, xp, yp) {
    this.focusX = fx;
    this.focusY = fy;
    this.xPoints = xp;
    this.yPoints = yp;
}

basementBlob.prototype.drawBlob = function() {
    beginShape();
    curveVertex(this.xPoints[formResolution - 1] + this.focusX,
                this.yPoints[formResolution - 1] + this.focusY);
    for (let i = 0; i < formResolution; i++) {
        curveVertex(this.xPoints[i] + this.focusX,
                    this.yPoints[i] + this.focusY);
    }
    curveVertex(this.xPoints[0] + this.focusX, this.yPoints[0] + this.focusY)
    curveVertex(this.xPoints[1] + this.focusX, this.yPoints[1] + this.focusY)
    endShape();
}

function mousePressed() {
    if (scene === TITLE_SCREEN) {
        if (overPlay) {
            ambience.loop();
            ambience.setVolume(0);
            ambience.setVolume(1, 3);
            timeElapsed = false;
            alreadyRan = false;
            scene = INSTRUCTIONS;
            return;
        }
    } else if (scene === BIRDS) {
        if (overBox) {
            locked = true;
            fill(255, 255, 255);
        } else {
            locked = false;
        }
        xOffset = mouseX - box_x;
        yOffset = mouseY - box_y;
    } else if (scene === BASEMENT) {

        // map to position of source
        let start_play = map(focusX, width * 0.1, width * 0.9, 0, src_length);
        let objVel = Math.sqrt(Math.pow(blobs[blobs.length - 1].focusX -
                                        blobs[blobs.length - 2].focusX, 2) +
                               Math.pow(blobs[blobs.length - 1].focusY -
                                        blobs[blobs.length - 2].focusY, 2));
        let rate = map(objVel, 0, 10, 0.5, 1.5);

        poly_counter += 1;
        poly_counter = poly_counter % num_voices;
        voices[poly_counter].playGrain(start_play, rate);

        grainDur = map(focusY, 0, height, 0.1, 4)
        grainDur = constrain(grainDur, 0.1, src_length);
        // let newatt = grainDur * 0.2;
        // let newrel = grainDur * 0.2;
        for (let i = 0; i < voices.length; i++)
            voices[i].setGrainDuration(grainDur);

        if (focusX < width * 0.35 && focusX > width * 0.2) {
            if (unlockedDoor) {
                gotKeys = false;
                unlockedDoor = false;
                failure.play();
                return;
            }
            gotKeys = true;
            success1.play();
            return;
        }
        if (focusX < width * 0.2 && focusX > width * 0.15 && gotKeys) {
            success2.play();
            unlockedDoor = true;
            return;
        } else if (gotKeys && !unlockedDoor) {
            gotKeys = false;
            failure.play();
            return;
        }
        if (focusX < width * 0.7 && focusX > width * 0.55 && gotKeys &&
            unlockedDoor) {
            openedDoor = true;
            birdsScattered = false;
            success3.play();
            darkRoom.setVolume(0, 3);
            ambience.loop();
            ambience.setVolume(0);
            ambience.setVolume(1, 6);
            setTimeout(() => {scene = BASEMENT_SUCCESS;}, 3000);
        } else if (unlockedDoor) {
            unlockedDoor = false;
            gotKeys = false;
            openedDoor = false;
            failure.play();
        }

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
        } else if (mouseVel >= 25 && !scatter.isPlaying()) {
            scatterBirds();
        }
    }
}

function mouseReleased() {
    if (scene === BIRDS) {
        mouseVel = 0.0;
        if (benchVisible && mouseX < benchX + 50 && mouseX > benchX - 50 &&
            mouseY < benchY + 50 && mouseY > benchY - 50 && locked)
        {
            scene = SUCCESS;
            ambience.setVolume(0, 6);
            setTimeout(() => {ambience.stop();}, 6000);
        }
    }
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

/* custom GranularVoice object */

function GranularVoice(src, grLength) {
    this.sound = src;
    this.sound.playMode('sustain');
    this.amp = 0.5;

    this.attack = 0.049;
    this.release = 0.049;
    this.grainDur = grLength - (this.attack + this.release);
}

GranularVoice.prototype.playGrain = function(start, rate) {
    let now = getAudioContext().currentTime;

    this.sound.play(0, rate, 1, start, this.grainDur + 1);

    if (this.sound.source) {
        this.sound.source.gain.gain.cancelScheduledValues(now);
        this.sound.source.gain.gain.setValueAtTime(0.0, now); // start at zero
        this.sound.source.gain.gain.linearRampToValueAtTime(this.amp,now +
            this.attack);
        this.sound.source.gain.gain.linearRampToValueAtTime(this.amp, now +
            (this.attack + this.grainDur) ); // stay during grain duration
        this.sound.source.gain.gain.linearRampToValueAtTime(-0.0, now +
            (this.attack + this.grainDur  + this.release) );
    }

}

GranularVoice.prototype.setAmp = function(newamp) {
    this.amp = newamp;
}


GranularVoice.prototype.setAttack = function(newattack){
    if (this.grainDur > (newattack + this.release)) {
        this.attack = newattack;
    } else {
        throw 'new attack value out of range';
    }
}

GranularVoice.prototype.setRelease = function(newrelease) {
    if (this.grainDur > (this.attack + newrelease)) {
        this.release = newrelease;
    } else {
        throw 'new release value out of range';
    }
}

GranularVoice.prototype.setGrainDuration = function(newgraindur) {
    if (newgraindur > (this.attack + this.release)) {
        this.grainDur = newgraindur;
    } else {
        throw 'new grain duration out of range';
    }
}
