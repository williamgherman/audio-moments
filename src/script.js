const player = new Tone.Player({
    url: "https://tonejs.github.io/audio/loop/FWDL.mp3",
    loop: true,
    loopStart: 0,
    loopEnd: 2.564104308,
    fadeIn: 2,
    playbackRate: 0.06,
    reverse: true,
}).toDestination();
const playButton = document.querySelector("#playButton");
const stopButton = document.querySelector("#stopButton");
stopButton.disabled = true;

playButton.addEventListener("click", async() => {
    await Tone.start();
    console.log("audio ready!");
    player.start();
    stopButton.disabled = false;
    playButton.disabled = true;
});
stopButton.addEventListener("click", () => {
    playButton.disabled = false;
    stopButton.disabled = true;
    player.stop();
});
