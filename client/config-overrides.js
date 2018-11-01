// From here: https://github.com/facebook/create-react-app/issues/1277
// Apparently this doesn't work with the latest react scripts. I'm going to hold out until they add worker support officially, or just eject this damn thing
const lodashCloneDeep = require('lodash/cloneDeep');

const three = require('three');

module.exports = function override(config, env) {
    // Add worker-loader by hijacking configuration for regular .js files.
    const uglifyIndex = config.plugins.findIndex((plugin) => plugin.constructor.name === 'UglifyJsPlugin');
    // cannot have unused code removal as it messes up numjs
    if (uglifyIndex !== -1) {
      const { compress } = config.plugins[uglifyIndex].options;
      config.plugins[uglifyIndex].options.compress = {...compress, ...{ unused: false } }
      config.plugins[uglifyIndex].options.mangle = {
        except: Object.keys(three),
      }
    }

    const babelLoader = config.module.rules[1].oneOf.find(
      (loader) => loader.loader.includes('babel-loader') !== false
    );

    const workerExtension = /\.worker\.js$/;

    config.module.rules.push({
      test: workerExtension,
      use: [{
        loader: 'worker-loader',
        options: {
          inline: true,
          fallback: false,
        }
      },
      {
        loader: babelLoader.loader,
        options: babelLoader.options,
      }
      ]
    });
    return config;
};
