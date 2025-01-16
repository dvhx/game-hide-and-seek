// Main window
"use strict";
// globals: document, window, URL

var SC = window.SC || {};

SC.currentMap = 'forest';
SC.quitLabel = (new URL(document.location)).searchParams.get('quit');

// duplicate tiles for single tile characters
SC.characters.singleTileCharacter('invisible');

SC.landscape = function () {
    // Handle switch to landscape orientation
    if (window.innerWidth > window.innerHeight) {
        SC.canvas.setZoom(window.innerWidth / 23 / SC.size);
    } else {
        SC.canvas.setZoom(window.innerWidth / 13 / SC.size);
    }
};

SC.quit = function (aWin) {
    // Send parent window message to close this iframe
    window.parent.postMessage({action: 'quit', data: {win: aWin || false}});
};

SC.placeGhost = function () {
    // Randomly place ghost on the map
    var n = 0, d = 1, x, y, r = Math.hypot(SC.maps[SC.background.map].width / 2, SC.maps[SC.background.map].height / 2), tiles;
    while (d < 0.5 * r) {
        x = 1 + Math.floor((SC.maps[SC.background.map].width - 2) * Math.random());
        y = 1 + Math.floor((SC.maps[SC.background.map].height - 2) * Math.random());
        d = SC.player.distanceTo(x, y);
        console.log('x', x, 'y', y, 'd', d, 'r', r, 'n', n);
        n++;
        if (n > 10) {
            break;
        }
    }
    // x = 7; y = 4;
    SC.ghost.teleport('forest', x, y);
    // do not place ghost on tree
    function center() {
        // move ghost towards center
        if (SC.ghost.x <= SC.maps[SC.currentMap].width / 2) {
            SC.ghost.teleport(SC.currentMap, SC.ghost.x + 1, SC.ghost.y, 'down');
        }
        if (SC.ghost.x > SC.maps[SC.currentMap].width / 2) {
            SC.ghost.teleport(SC.currentMap, SC.ghost.x - 1, SC.ghost.y, 'down');
        }
        if (SC.ghost.y <= SC.maps[SC.currentMap].height / 2) {
            SC.ghost.teleport(SC.currentMap, SC.ghost.x, SC.ghost.y + 1, 'down');
        }
        if (SC.ghost.y > SC.maps[SC.currentMap].height / 2) {
            SC.ghost.teleport(SC.currentMap, SC.ghost.x, SC.ghost.y - 1, 'down');
        }
    }
    tiles = SC.maps[SC.currentMap].ground[SC.ghost.y][SC.ghost.x];
    if (tiles.indexOf('tree1') >= 0 || tiles.indexOf('tree2') >= 0 || tiles.indexOf('well') >= 0 || tiles.indexOf('columnbroken') >= 0 || tiles.indexOf('tombstone') >= 0) {
        console.log('center', tiles);
        center();
    }
    // workaround for fog below ghost
    console.log('xy', SC.ghost.x, SC.ghost.y);
    SC.ghost.base('invisible');
    SC.map.change(SC.currentMap, SC.ghost.x, SC.ghost.y, 'ghost-down', false);
};

SC.startTimer = function () {
    // Start countdown timer in top yellow lip
    SC.timeLip = SC.lip('60s', null, 60);
    SC.timeLip.close.style.display = 'none';
    SC.timeLip.color('lime');
    SC.timeLip.lip.onclick = undefined;
    SC.timeLeft = 60;
    window.setInterval(function () {
        if (SC.win || SC.lost) {
            return;
        }
        SC.timeLeft--;
        SC.timeLip.text.textContent = SC.timeLeft + 's';
        if (SC.timeLeft >= 15 && SC.timeLeft < 30) {
            SC.timeLip.color('yellow');
        }
        if (SC.timeLeft >= 1 && SC.timeLeft < 15) {
            SC.timeLip.color('orange');
        }
        if (SC.timeLeft < 1) {
            SC.timeLip.color('red');
        }
        if (SC.ghost.distanceTo(SC.player.x, SC.player.y) < 3) {
            SC.win = true;
            SC.ghost.base('ghost');
            SC.bubblesCasual('hs_player', ["I found you!"], function () {
                window.setTimeout(function () {
                    SC.bubblesCasual('hs_ghost', ['Next time I will hide better!'], function () {
                        //SC.ghost.base('invisible');
                        SC.splash('Mission complete!', ['Play again', 'Back to chat'], 'lime', '', function (aButton) {
                            if (aButton === 'Play again' || aButton === undefined) {
                                document.location.reload();
                            } else {
                                SC.quit(true);
                            }
                        });
                    });
                }, 500);
            });
            return;
        }
        if (SC.timeLeft === 0) {
            SC.lost = true;
            SC.pause = true;
            SC.splash('Mission failed!', SC.quitLabel ? ['Play again', SC.quitLabel] : ['Play again'], 'orange', 'You have failed to find ghost!', function (aButton) {
                if (aButton === 'Play again' || aButton === undefined) {
                    document.location.reload();
                }
                if (aButton === SC.quitLabel) {
                    SC.quit(false);
                }
            }).bgClickDisable();
        }
    }, 1000);
};

// initialize window
window.addEventListener('DOMContentLoaded', function () {
    // load saved player
    // Initialize town
    SC.init(function () {
        // initialize canvas
        SC.canvas.init('background_canvas', 'character_canvas');
        window.addEventListener('resize', SC.landscape);
        SC.canvas.setZoom(document.body.clientWidth / 13 / SC.size);

        // initialize on-screen touchpad
        SC.touchpad = SC.touchpad('image/arrows130.png', undefined, true);
        SC.touchpad.img.style.zIndex = 10;
        //SC.touchpad.img.style.bottom = '2em';
        SC.touchpad.img.style.opacity = 0.7;
        SC.touchpad.hide();

        // wasd
        SC.keyboard.touchpad = true;

        // hide touchpad on desktop
        if (!SC.isTouchDevice()) {
            SC.touchpad.hide();
            SC.touchpad.hide = function () { console.log('SC.touchpad.hide suppressed'); };
            SC.touchpad.show = function () { console.log('SC.touchpad.show suppressed'); };
        }

        // player
        SC.player = SC.map.npc(SC.currentMap, 'hs_player');
        // SC.player.base(SC.storage.readString('SC.playerBase', 'boy'));
        SC.player.setPlayer();

        // ghost
        SC.touchpad.show();
        SC.ghost = SC.map.npc(SC.currentMap, 'hs_ghost');
        SC.ghost.teleport('forest', SC.player.x - 1, SC.player.y);
        window.setTimeout(function () {
            SC.bubblesCasual('hs_ghost', ["Find me if you can!"], function () {
                SC.placeGhost();
                window.setTimeout(function () {
                    SC.bubblesCasual('hs_player', ['I will find you!'], function () {
                        SC.startTimer();
                        SC.touchpad.show();
                    });
                }, 500);
            });
        }, 500);

        // background
        SC.background.load(SC.currentMap);
        SC.background.key = '';

        // directional flashlight
        SC.touchpad.angle = Math.PI;
        SC.landscape();
        // rendering loop
        SC.loop();
    });

    // esc = quit
    if (SC.quitLabel) {
        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !(SC.win || SC.lost)) {
                SC.splash('Quit game?', SC.quitLabel ? ['Continue', SC.quitLabel] : ['Continue'], 'orange', '', function (aButton) {
                    if (aButton === SC.quitLabel) {
                        SC.quit(false);
                    }
                }).bgClickDisable();
            }
        });
    }
});

