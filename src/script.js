// p5 functions

let ambience;

function preload() {
    // soundFormats('ogg', 'mp3');
    ambience = loadSound('../audio/pigeons-ambient.ogg');
}
function setup() {
  createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  background(255);
  ambience.loop();
  ambience.stop(); // safety
}

function draw() {
    let tileCount = 10;
    background(255);
    translate(width / tileCount / 2, height / tileCount / 2);
    strokeWeight(3);

    for (var gridY = 0; gridY < tileCount; gridY++) {
        for (var gridX = 0; gridX < tileCount; gridX++) {
            var posX = width / tileCount * gridX;
            var posY = height / tileCount * gridY;
            var shiftX = random(-mouseX, mouseX) / 90;
            var shiftY = random(-mouseX, mouseX) / 90;
            ellipse(posX + shiftX, posY + shiftY, 15, 15);
        }
    }
}

function mousePressed() {
    if (!ambience.isPlaying())
        ambience.play();
}

function windowResized() {
    resizeCanvas(windowWidth * 0.9, windowHeight * 0.9);
}
