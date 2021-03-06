const path = require('path');
const deps = require('./deps');
const webpack = require('webpack');

const appPath = path.resolve(__dirname, '../');
const appServerPath = path.resolve(appPath, 'server');
const appServerJs = path.resolve(appServerPath, 'index.tsx');
const appServerBuild = path.resolve(appPath, 'build');
const appSrc = path.resolve(appPath, 'src');
const appServer = path.resolve(appPath, 'server');

module.exports = {
  target: 'node',
  // Don't attempt to continue if there are any errors.
  bail: true,
  entry: appServerJs,
  output: {
    path: appServerBuild,
    filename: 'server.js'
  },
  resolve: {
    modules: ['node_modules', path.resolve(appPath, 'node_modules'), path.resolve(appPath, '../node_modules')],
    extensions: [
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx'
    ],
    alias: {
      '@source/services/graphql': path.resolve(__dirname, '../server/graphql/index.ts'),
      '@source': path.resolve(appPath, 'src'),
      'components': deps.componentsPath,
      'plugins': deps.pluginsPath,
      // This is because of badly written webfont loader libs. On SSR, we have
      // no window and even if we setup mock window, this lib doesn't works.
      'webfontloader': path.resolve(__dirname, 'webfontloader-mock.js'),
      '../graphql': path.resolve(__dirname, '../server/graphql/index.ts'),
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },

      // First, run the linter.
      // It's important to do this before Typescript runs.
      {
        test: /\.(ts|tsx)$/,
        loader: require.resolve('tslint-loader'),
        enforce: 'pre',
        include: [appSrc, appServer]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        },
        exclude: [
          path.resolve(appPath, 'node_modules'),
          path.resolve(appPath, '../node_modules'),
          deps.componentsPath,
          deps.pluginsPath,
          path.resolve(appPath, '../components')
        ]
      },
      {
        test: /\.js$/,
        loader: require.resolve('source-map-loader'),
        enforce: 'pre',
        include: appSrc
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          //Compile .tsx?
          {
            test: /\.(ts|tsx)$/,
            include: [appSrc, appServer],
            loader: require.resolve('ts-loader'),
            options: {
              configFile: path.resolve(appPath, 'tsconfig.server.json')
            }
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader don't uses a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      fetch: 'node-fetch',
      window: ['global', 'window'],
    })
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
