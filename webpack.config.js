module.exports = function (config) {
  config.resolve = config.resolve || {};
  config.resolve.alias = Object.assign({}, config.resolve.alias, {
    react: require.resolve('preact/compat'),
    'react-dom': require.resolve('preact/compat')
  });

  // Performance optimizations for development
  if (config.mode === 'development') {
    // Enable caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
      cacheDirectory: require('path').resolve(__dirname, 'node_modules/.cache/webpack'),
    };

    // Optimize source maps for development
    config.devtool = 'eval-cheap-module-source-map';

    // Split chunks for better caching
    config.optimization = config.optimization || {};
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    };

    // Use faster incremental builds
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
  }

  // Production optimizations
  if (config.mode === 'production') {
    // Better minification
    config.optimization = config.optimization || {};
    config.optimization.minimize = true;

    // Tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
  }

  return config;
};
