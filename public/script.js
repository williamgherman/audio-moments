const TITLE_TEXT = "AUDIO MOMENTS";
const INSTRUCTION_TEXT = "FEED THE BIRDS";
const FAIL_TEXT_1 = "YOU SCARED THE BIRDS AWAY";
const FAIL_TEXT_2 = "YOU CAN NEVER DO ANYTHING RIGHT";
const BASEMENT_INSTRUCTIONS = "I'M LOCKING YOU IN THE BASEMENT\n" +
                              "UNTIL YOU LEARN HOW TO BEHAVE";

const formResolution = 7;

// sounds
let ambience, scare, scare2, scare3, scatter, doorCreak, unlock;

// scene objects
let box_x, box_y;
let boxSize = 30;

// object properties
let overBox = false;
let overPlay = false;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;
let colorShift = 0.3;
let angle;
let xPoints = [], yPoints = [];
let initRadius = 30;
let focusX, focusY;

// font
let vcrfont;
let fontSize = 32;

let mouseVel = 0.0

let timeElapsed = false;
let alreadyRan = false;

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
      SKY = 7;

let scene = TITLE_SCREEN;

function preload() {
    soundFormats('ogg', 'mp3');

    ambience = loadSound('assets/pigeons-ambient.ogg');
    scare = loadSound('assets/pigeons-scare.ogg');
    scare2 = loadSound('assets/pigeons-scare-2.ogg');
    scare3 = loadSound('assets/pigeons-scare-3.ogg');
    scatter = loadSound('assets/pigeons-scatter.ogg');
    darkroom = loadSound('assets/dark-room.ogg');
    doorCreak = loadSound('assets/door-creak.ogg');
    unlock = loadSound('assets/unlock.ogg');

    scare.playMode('sustain');
    scare2.playMode('sustain');
    scare3.playMode('sustain');

    vcrfont = loadFont('assets/VCR_OSD_MONO_1.001.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight - 5);
    background(color(0,0,255));
    box_x = boxSize * 1.5;
    box_y = boxSize * 1.5;
    rectMode(RADIUS);

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
                let shiftX = random(-mouseVel, mouseVel + 3) * 2;
                let shiftY = random(-mouseVel, mouseVel + 3) * 2;
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
        push();
            background(color(0,0,0));
            text(BASEMENT_INSTRUCTIONS,
                 width * 0.5 + random(-1,1),
                 height * 0.1 + random(-1,1));
        pop();
        push();
            fill(0);
            stroke(255);
            focusX += (mouseX - focusX) * 0.01;
            focusY += (mouseY - focusY) * 0.01;
            for (let i = 0; i < formResolution; i++) {
                xPoints[i] += random(-1, 1);
                yPoints[i] += random(-1, 1);
            }
            beginShape();
            curveVertex(xPoints[formResolution - 1] + focusX,
                        yPoints[formResolution - 1] + focusY);
            for (let i = 0; i < formResolution; i++) {
                curveVertex(xPoints[i] + focusX, yPoints[i] + focusY);
            }
            curveVertex(xPoints[0] + focusX, yPoints[0] + focusY);
            curveVertex(xPoints[1] + focusX, yPoints[1] + focusY);
            endShape();
        pop();

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
        let start_play = map(focusX, 0, width, 0, src_length);

        poly_counter += 1;
        poly_counter = poly_counter % num_voices;
        voices[poly_counter].playGrain(start_play, 1);

        grainDur += map(focusY, 0, height, (-(src_length / 2)), src_length / 2);
        grainDur = constrain(grainDur, 0.1, src_length);
        // let newatt = grainDur * 0.2;
        // let newrel = grainDur * 0.2;
        for (let i = 0; i < voices.length; i++)
            voices[i].setGrainDuration(grainDur);
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
        this.sound.source.gain.gain.linearRampToValueAtTime(this.amp,now + this.attack);
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
