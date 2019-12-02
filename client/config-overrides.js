// From here: https://github.com/facebook/create-react-app/issues/1277
// Apparently this doesn't work with the latest react scripts. I'm going to hold out until they add worker support officially, or just eject this damn thing
const lodashCloneDeep = require("lodash/cloneDeep");

const three = require("three");

module.exports = function override(config, env) {
  // Add worker-loader by hijacking configuration for regular .js files.
  const terserIndex = config.optimization.minimizer.findIndex(
    plugin => plugin.constructor.name === "TerserPlugin"
  );
  // cannot have unused code removal as it messes up numjs
  if (terserIndex !== -1) {
    const { compress } = config.optimization.minimizer[
      terserIndex
    ].options.terserOptions;
    config.optimization.minimizer[
      terserIndex
    ].options.terserOptions.compress = {
      ...compress,
      ...{ unused: false }
    };
    config.optimization.minimizer[terserIndex].options.terserOptions.keep_classnames = true;
    config.optimization.minimizer[terserIndex].options.terserOptions.keep_fnames = true;
  }
  const babelLoader = config.module.rules[2].oneOf.find(
    loader => loader.loader.includes("babel-loader") !== false
  );
  const workerExtension = /\.worker\.js$/;
  const workerRule = {
    test: workerExtension,
    use: [
      "worker-loader",
      {
        loader: babelLoader.loader,
        options: babelLoader.options
      }
    ]
  };

  if (process.env.REACT_APP_BUILD_ENV === "OMEKA") {
    workerRule.use = [
      {
        loader: "worker-loader",
        options: {
          inline: true,
          fallback: false
        }
      },
      {
        loader: babelLoader.loader,
        options: babelLoader.options
      }
    ];
  }

  config.module.rules.push(workerRule);
  return config;
};
