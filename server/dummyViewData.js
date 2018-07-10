const View = require ('./models/view');

module.exports = function () {
  View.count().exec((err, count) => {
    if (count > 0) {
      return;
    }

    const view1 = new View({
      threeFile: 'Vernal',
      threeThumbnail: 'test',
      skybox:{file: 'test'},
      enableLight: 'true',
      enableMaterials: 'true',
      enableShaders: 'true',
      enableMeasurement: 'true',
      enableUnits: 'ft'
      //cuid: 'cikqgkv4q01ck7453ualdn3ta'
    });

    const view2 = new View({
      threeFile: 'Autumn',
      threeThumbnail: 'test',
      skybox:{file: 'test'},
      enableLight: 'true',
      enableMaterials: 'true',
      enableShaders: 'true',
      enableMeasurement: 'true',
      enableUnits: 'mm'
      //cuid: 'cikqgkv4q01ck7453ualdn3pv'
    });

    const view3 = new View({
      threeFile: 'Katt',
      threeThumbnail: 'test',
      skybox:{file: 'test'},
      enableLight: 'true',
      enableMaterials: 'true',
      enableShaders: 'true',
      enableMeasurement: 'true',
      enableUnits: 'cm'
      //cuid: 'cikqgkv4q01ck7453ualdn3uz'
    });

    const view4 = new View({
      threeFile: 'Faux',
      threeThumbnail: 'test',
      skybox:{file: 'test'},
      enableLight: 'true',
      enableMaterials: 'true',
      enableShaders: 'true',
      enableMeasurement: 'true',
      enableUnits: 'cm'
      //cuid: 'cikqgkv4q01ck7453ualdn3uz'
    });

    View.create([view1, view2, view3, view4], (error) => {
      if (!error) {
        // console.log('ready to go....');
      }
    });
  });
}
