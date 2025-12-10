const path = require('path');

module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.ts(x?)$/,
      include: [
        path.resolve(__dirname, '../forge-monitor'),
      ],
      use: [
        options.defaultLoaders.babel,
      ],
    });
    return config;
  },
};
