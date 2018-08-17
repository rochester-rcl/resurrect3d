const lodashCloneDeep = require('lodash/cloneDeep');

module.exports = function override(config, env) {
    // Add worker-loader by hijacking configuration for regular .js files.

    const workerExtension = /\.worker\.js$/;

    const babelLoader = config.module.rules[1].oneOf.find(
      (loader) => loader.loader.includes('babel-loader') !== false
    );

    const workerLoader = lodashCloneDeep(babelLoader);

    workerLoader.test = workerExtension;
    workerLoader.use = [
        'worker-loader',
        { // Old babel-loader configuration goes here.
            loader: workerLoader.loader,
            options: workerLoader.options,
        },
    ];
    delete workerLoader.loader;
    delete workerLoader.options;

    babelLoader.exclude = (babelLoader.exclude || []).concat([workerExtension]);

    config.module.rules[1].oneOf.push(workerLoader);

    return config;
};
