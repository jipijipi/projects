//base unit of time in ms
const dit = 180;
const dah = dit * 3;
const letterPause = dit * 3;
const wordPause = dit * 7;

let keyStart, keyEnd;
let pauseStart, pauseEnd;

let keyDown = false;

let code = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
};
// let code = {
//     A: [1, 3],
//     B: [3, 1, 1, 1],
//     C: [3, 1, 3, 1],
//     D: [3, 1, 1],
//     E: [1],
//     F: [1, 1, 3, 1],
//     G: [3, 3, 1],
//     H: [1, 1, 1, 1],
//     I: [1, 1],
//     J: [1, 3, 3, 3],
//     K: [3, 1, 3],
//     L: [1, 3, 1, 1],
//     M: [3, 3],
//     N: [3, 1],
//     O: [3, 3, 3],
//     P: [1, 3, 3, 1],
//     Q: [3, 3, 1, 3],
//     R: [1, 3, 1],
//     S: [1, 1, 1],
//     T: [3],
//     U: [1, 1, 3],
//     V: [1, 1, 1, 3],
//     W: [1, 3, 3],
//     X: [3, 1, 1, 3],
//     Y: [3, 1, 3, 3],
//     Z: [3, 3, 1, 1],
// };

let currentLetter = '';
let currentWord = '';
let currentAlphaLetter = '';
let currentAlphaWord = '';

//match function

function alphaMatch(morse) {
    return Object.keys(code)[Object.values(code).indexOf(morse)];
}



//key presses
document.onkeydown = () => {

    // playTone(500);



    if (!keyDown) {
        keyStart = Date.now();
        keyDown = true;

        pauseEnd = Date.now();
        pauseDuration = pauseEnd - pauseStart;

        if (pauseDuration > dit * 2) {
            currentWord += currentLetter;
            currentLetter = '';
            console.log(`word: ${currentWord}`);
            console.log(`pause : ${pauseDuration}`)
        };
    }
}

document.onkeyup = () => {
    if (keyDown) {
        keyEnd = Date.now();
        keyDown = false;

        pressDuration = keyEnd - keyStart;
        pauseStart = Date.now();


        if (pressDuration < dit) {

            currentLetter += '.';
            console.log(`dit (${pressDuration}ms)`)

        } else {

            currentLetter += '-';
            console.log(`dah (${pressDuration}ms)`)

        };


        currentAlphaLetter = alphaMatch(currentLetter);

        console.log(currentAlphaLetter);
        console.log(currentLetter);
    }

}

//pause timer
let wordTimer;
window.setInterval(() => wordTimer = Date.now() - pauseStart, 100);