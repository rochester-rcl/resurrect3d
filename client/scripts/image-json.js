var Jimp = require("Jimp");
const path = require('path');
var fs = require("fs");

Jimp.read(path.join(__dirname, "../public/color-wheel.png"))
  .then(image => {
    var width = image.bitmap.width;
    var height = image.bitmap.height;
    var pixels = {};
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        pixels[x] = pixels[x] || {};
        var pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
        pixels[x][y] = `${pixel.r}, ${pixel.g}, ${pixel.b}`;
      }
    }
    fs.writeFile('./color-wheel-data.json', JSON.stringify({ data: pixels }), 'utf8', (err) => {
        if (err) { throw err; }
    });
  })
  .catch(err => { throw err; });

