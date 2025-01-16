// Flashlight canvas (masks background with black color, selectively removed)
// linter: ngspicejs-lint
// global: window, document, Image
"use strict";

var SC = window.SC || {};

SC.flashlight = (function () {
    // Flashlight canvas (masks background with black color, selectively removed)
    var self = {};

    self.img = new Image();
    self.img.src = 'image/flashlight.png';

    function onResize() {
        // Handle window resize
        self.canvas.width = window.innerWidth;
        self.canvas.height = window.innerHeight;
        self.canvas.style.width = window.innerWidth + 'px';
        self.canvas.style.height = window.innerHeight + 'px';
    }
    window.addEventListener('DOMContentLoaded', function () {
        // Grab canvas
        self.canvas = document.getElementById('flashlight_canvas');
        self.context = self.canvas.getContext('2d');
        onResize();
    });
    window.addEventListener('resize', onResize);

    self.drawImageRotated = function (aImage, aX, aY, aWidth, aHeight, aAngleRad, aCenterX, aCenterY) {
        // Draw rotated image on canvas centered around centerpoint on image, (aX,aY) is placed where the center point is!
        var cx = aWidth * aCenterX / aImage.width,
            cy = aHeight * aCenterY / aImage.height;
        self.context.save();
        self.context.translate(aX, aY);
        self.context.rotate(aAngleRad);
        self.context.translate(-cx, -cy);
        self.context.drawImage(aImage, 0, 0, aWidth, aHeight);
        self.context.restore();
    };

    self.render = function () {
        // Render flashlight mask
        var w = self.canvas.width;
        var h = self.canvas.height;
        var iw = SC.canvas.zoom * SC.size * 15;
        var ih = SC.canvas.zoom * SC.size * 15;
        // black
        self.context.globalAlpha = 1;
        self.context.globalCompositeOperation = 'source-over';
        self.context.fillStyle = 'black';
        self.context.fillRect(0, 0, w, h);
        // erase hole where the flashlight points
        //self.context.globalAlpha = 0.9 + 0.1 * Math.sin(Date.now()/190) * Math.sin(Date.now()/270);
        if (self.img.naturalWidth > 0) {
            self.context.globalCompositeOperation = 'destination-out';
            self.drawImageRotated(self.img, w/2, h/2, iw, ih, SC.touchpad.angle - Math.PI / 2, self.img.naturalWidth/2, self.img.naturalWidth/2);
        }
    };

    return self;
}());
