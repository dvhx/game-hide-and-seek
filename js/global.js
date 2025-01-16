// Experimental system to "Track and warn about undocumented globals"
// linter: ngspicejs-lint
// global: console, window
"use strict";

var SC = window.SC || {};

SC.global = {
    background: 'Background rendering (tiled map)',
    bubble: 'Draw speech bubble',
    bubbles: 'Display multiple bubbles over NPC character when he explain mission with "next" button',
    bubblesCasual: 'Show independent (non-interractive) speech bubbles over character',
    canvas: 'Canvas functions (initialization, rendering, resizing)',
    character: 'Create one character and add it to character list (name must be unique)',
    characters: 'Manager for all characters',
    currentMap: 'Name of currently loaded map',
    effect: 'Create single effect for a character with tile names and their duration',
    effects: 'Manager for all objects',
    flashlight: 'Flashlight canvas (masks background with black color, selectively removed)',
    ghost: 'Ghost character',
    global: 'Description of all SC.* objects',
    globalCheck: 'Track and warn about undocumented globals',
    init: 'Load all tileset images, then call callback',
    isTouchDevice: 'Return true if device has touch screen (to show touchpad)',
    keyboard: 'Keyboard alternative to touchpad (WASD and arrows on desktop)',
    landscape: 'Handle switch to landscape orientation',
    lip: 'Show animated lip on the top with info',
    loop: 'Calling main rendering function SC.render() in a 60 FPS loop',
    lost: 'If true player lost the game',
    map: 'Maps journal (changes, persistence) and overlapping',
    maps: 'Object with all available maps',
    pause: 'If true SC.render() will do nothing',
    placeGhost: 'Randomly place ghost on the map',
    player: 'Player character',
    quit: 'If true ending screen will have quit button, set by ?quit=Quit label',
    quitLabel: 'String to be displayed in end screen',
    render: 'Main rendering function',
    size: 'Width and height of a tile (e.g. 16)',
    splash: 'Nice animated popup window with custom content',
    standAloneTile: 'Create canvas with stand alone tile, used e.g. in shop',
    startTimer: 'Start countdown timer in top yellow lip',
    storage: 'Simplified access to localStorage with extra checks and type conversions',
    tiles: 'Tileset, all available tiles',
    time: 'Milliseconds since the epoch',
    timeElapsed: 'Time in ms spent in the SC.render() function',
    timeLeft: 'Decreasing 60s time limit, 0=game over',
    timeLip: 'Lip that is shown on top, handle used for changing colors and updating remaining time',
    timeOld: 'Previous time used to calculate duration of a frame',
    touchpad: 'Touchpad with arrows for mobile phones',
    win: 'True indicate player won'
}; // don't forget to review SC.globalCheck.neverSeen once in a while

SC.globalCheck = function () {
    // Track and warn about undocumented globals
    // track objects that were no longer seen
    SC.globalCheck.neverSeen = SC.globalCheck.neverSeen || JSON.parse(JSON.stringify(SC.global));
    Object.keys(SC).forEach((k) => delete SC.globalCheck.neverSeen[k]);
    // alphabetical sorting is important to not redeclare things
    var a = Object.keys(SC.global);
    var b = Object.keys(SC.global).sort();
    if (a.join(',') !== b.join(',')) {
        console.warn('SC.global keys are not sorted alphabetically, this may lead to mistakes or redeclarations');
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                console.warn('  Key #' + i + ' (' + a[i] + ' should be swapped with ' + b[i] + ')');
                break;
            }
        }
    }
    // warn about undocumented globals
    SC.globalCheck.seen = SC.globalCheck.seen || {};
    Object.keys(SC)
        .filter((k) => !SC.global[k] && !SC.globalCheck.seen[k])
        .sort()
        .forEach((k) => {
        console.warn('SC.' + k + ' undocumented in js/globals.js');
        SC.globalCheck.seen[k] = typeof SC[k];
    });
};

SC.globalCheck();
window.addEventListener('DOMContentLoaded', SC.globalCheck);
window.setTimeout(SC.globalCheck, 1000);
window.setTimeout(SC.globalCheck, 5000);
window.setInterval(SC.globalCheck, 15000);
