/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const ThemeResolverPlugin = require('webpack-theme-resolver-plugin');
const themeUtils = require('./theme-build-utils');
const { BannerPlugin, HTMLBannerPlugin, LICENSE_HEADER } = require('./license-header-built-files');

function addENVDefaults() {
  if (typeof process.env.VUE_APP_TITLE === 'undefined') {
    process.env.VUE_APP_TITLE = 'Documentation';
  }
}

function baseGenerateCssOptions(config) {
  const target = process.env.VUE_APP_TARGET;
  const buildTarget = ['ide', 'default'].includes(target) ? target : 'default';

  return {
    extract: process.env.NODE_ENV === 'production' && {
      ignoreOrder: true,
    },
    loaderOptions: {
      scss: {
        additionalData: `$build-target: '${buildTarget}'; $is-target-ide: $build-target == 'ide';`,
      },
    },
    ...config,
  };
}

function baseChainWebpack(config) {
  const themeFallbackDirectories = themeUtils.getThemePaths();

  config.module
    .rule('static-html-assets')
    .test(/\.html$/)
    .pre()
    .include
    .add(path.resolve(__dirname, '../assets/global-elements'))
    .end()
    .use('html-loader')
    .loader('html-loader')
    .end();

  // Add theme fallback resolver
  config.resolve
    .plugin('ThemeResolverPlugin')
    .use(ThemeResolverPlugin, [[
      {
        prefix: 'theme',
        directories: themeFallbackDirectories,
      },
    ]]);

  config.resolve.alias.set('docc-render', path.resolve(__dirname, '../'));

  // Add license header to built files
  config
    .plugin('BannerPlugin')
    .use(BannerPlugin, [{
      banner: LICENSE_HEADER,
    }]);

  // Add license header to HTML built files
  if (process.env.NODE_ENV === 'production') {
    config
      .plugin('HTMLBannerPlugin')
      .use(HTMLBannerPlugin, [LICENSE_HEADER]);
  }
}

function baseDevServer({ defaultDevServerProxy = 'http://localhost:8000' } = {}) {
  const devServerProxy = process.env.VUE_APP_DEV_SERVER_PROXY || defaultDevServerProxy;

  // See https://cli.vuejs.org/config/#devserver for more details
  const localFixtures = fs.existsSync(devServerProxy);
  return localFixtures ? ({
    // If `$VUE_APP_DEV_SERVER_PROXY` is a path that exists on the local
    // filesystem, use its files to serve data and image requests
    //
    // Example: a .docc-build directory generated by `docc preview`
    before(app) {
      app.get(/^\/data\/diffs/, ({ path: documentPath, query: { changes } }, res) => {
        const directory = path.dirname(documentPath);
        const extension = path.extname(documentPath);
        const baseName = path.basename(documentPath, extension);

        // Encode the query parameter into the path to obtain a filesystem path.
        //
        // For example, /data/diffs/documentation/foo.json?changes=latest_minor gets converted to
        // /data/diffs/documentation/foo-latest_minor.json

        res.sendFile(path.join(devServerProxy, directory, `${baseName}-${changes}${extension}`));
      });
      app.get(/^\/(data|downloads|images|videos|index)/, (req, res) => {
        res.sendFile(path.join(devServerProxy, req.path));
      });
    },
  }) : ({
    // Otherwise, use the `$VUE_APP_DEV_SERVER_PROXY` value as an http endpoint
    // to proxy data and image requests through
    //
    // Example: a localhost:[port] URL obtained from `docc preview`
    proxy: {
      '^/(data|downloads|images|videos|index)': {
        target: devServerProxy,
      },
    },
  });
}

const baseConfig = {
  productionSourceMap: false,
  transpileDependencies: ['swift-docc-render'],
};

function vueUtils({
  chainWebpack = () => {},
  devServerConfig,
  cssConfig,
  ...config
} = {}) {
  addENVDefaults();
  return {
    chainWebpack(conf) {
      baseChainWebpack(conf);
      chainWebpack(conf);
    },
    devServer: baseDevServer(devServerConfig),
    css: baseGenerateCssOptions(cssConfig),
    ...baseConfig,
    ...config,
  };
}

module.exports = vueUtils;
