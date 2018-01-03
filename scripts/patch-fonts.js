const fs = require('fs');
const path = require('path');

function readCSSFile(filePath) {

  function patchCSSFile(fileData) {
    let patched = fileData.replace(/url\(\/static\/media\//g, "url(../media/");
    fs.writeFile(filePath, patched, 'utf8', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(filePath + " successfully patched!");
      }
    });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      patchCSSFile(data);
    }

  });

}

function scanCSSDir(cssFolderPath) {
  fs.readdir(cssFolderPath, (err, files) => {
    if (err) {
      console.log(err);
    } else {
      files.forEach((file) => {
        let fullPath = cssFolderPath + '/' + file;
        if (path.extname(fullPath) === '.css') {
          readCSSFile(fullPath);
        }
      });
    }
  });
}

scanCSSDir('build/static/css');
