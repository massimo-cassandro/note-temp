/* eslint-env node */

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const {BannerPlugin} = require('webpack');
const PACKAGE = require('./package.json');
const path = require('path');


// aliases from jsconfig
const jsConfig = require(path.join(__dirname, '/jsconfig.json'));
const aliases = {};
for(const item in jsConfig.compilerOptions.paths) {

  const key = item.replace(/(\/\*)$/, ''),
    value = path.resolve(__dirname, jsConfig.compilerOptions.paths[item][0].replace(/(\/\*)$/, ''));

  aliases[key] = value;
}
// console.log(aliases);


const Dotenv = require('dotenv-webpack');

const isDevelopment = process.env.NODE_ENV === 'development'
  ,buildSourcemaps = isDevelopment
  ,output_dir = path.resolve(__dirname, './build')

  // https://medium.com/@technoblogueur/webpack-one-manifest-json-from-multiple-configurations-output-fee48578eb92
  // ,manifest_shared_seed = {};
;

const config = {
  mode: isDevelopment? 'development' : 'production',

  // watch: isDevelopment,

  // Control how source maps are generated
  // devtool: isDevelopment? 'inline-source-map' : 'source-map', // false, <== false non aggiunge la sourcemap ,
  devtool: isDevelopment? 'inline-source-map' : false,
  // devtool: 'source-map',

  // Where webpack looks to start building the bundle
  entry: {
    'note': './src/index.js',
  },
  // Where webpack outputs the assets and bundles

  output: {
    path: output_dir,
    // filename: '[name].js',
    filename: '[name].[contenthash].js',
    publicPath: '/', // `/${output_dir}/`, // usato per i percorsi degli elementi importati nei js
    clean: !isDevelopment,
  },

  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        // terserOptions: {
        //   format: {
        //     comments: false,
        //   },
        // },
        extractComments: false,
      }),
    ],
    runtimeChunk: 'single',
    // runtimeChunk: false,
    // runtimeChunk: { name: entrypoint => `runtime~${entrypoint.name}`,
    // splitChunks: { chunks: 'all', },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    usedExports: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

  // Spin up a server for quick development
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, '/'),
      serveIndex: true,
    },

    // open: true,
    compress: true,
    hot: true,
    // host: '0.0.0.0',
    port: 5500,
    // devMiddleware: { writeToDisk: true } // forza la scrittura su disco anche in modalità dev
  },

  // =>> rules
  // Determine how modules within the project are treated
  module: {
    rules: [

      // =>> html files
      {
        test: /(\.html?)$/i,
        oneOf: [

          // copy files to output folder
          {
            type: 'javascript/auto',
            resourceQuery: /as_asset/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[contenthash].[ext]',
                  // outputPath: 'imgs/',
                  esModule: false,
                }
              }
            ]
          },
          // get html content
          {
            loader: 'html-loader'
          },
        ]
      },

      // =>> markdown / plain text / raw svg
      // {
      //   test: /\.(txt|md)$/,
      //   type: 'asset/source'
      // },

      // =>> typescript
      // {
      //   test: /\.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/,
      // },

      // =>> JavaScript/JSX: Use Babel to transpile JavaScript files
      {
        test: /\.(?:js|mjs|cjs|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }]
            ]
          },
        },
      },

      // =>> svg
      {
        test: /\.svg$/i,
        oneOf: [
          // svg inline in css, base64 (con `?css-inline`)
          {
            resourceQuery: /css-inline/,
            // loader: 'raw-loader',
            type: 'asset/inline',
            generator: {
              dataUrl: content => {
                content = content.toString();
                return svgToMiniDataURI(content);
              }
            }
          },

          // svg inline (con `?inline`)
          {
            resourceQuery: /inline/,
            // type: 'asset/inline', // inline as base 64
            type: 'asset/source', // inline as svg
          },

          // copy image files to build folder
          {
            // type: 'asset/resource',
            type: 'javascript/auto',
            // resourceQuery: { not: [/(css-)?inline/] },
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[contenthash].[ext]',
                  outputPath: 'imgs/',
                  esModule: false,
                }
              }
            ]
          },
        ]
      },

      // =>> Images
      {
        test: /\.(?:gif|png|jpg|jpeg|webp|avif)$/i,
        // type: 'asset/resource',
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: 'imgs/',
              esModule: false,
            }
          }
        ]
      },

      // =>> Fonts
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        //type: 'asset/resource',
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              hmr: isDevelopment,
              name: '[name].[contenthash].[ext]',
              outputPath: 'fonts', // usato nel manifest
              // publicPath: `/${output_dir}/fonts`, // usato nel css
              esModule: false,
            }
          }
        ]
      },

      // =>> css/scss modules
      {
        test: /(\.module\.(sass|scss|css))$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // importLoaders: 1,
              // modules: true,
              modules: {
                // esModule: false, // abilita importazione in cjs
                auto: true, // /\.module\.scss$/i.test(filename),
                // localIdentName: Encore.isProduction()? '[hash:base64]' : '[local]_[hash:base64:6]' // '[name]__[local]_[hash:base64:5]'
                localIdentName: '[local]_[hash:base64:6]' // '[name]__[local]_[hash:base64:5]'
              },
              sourceMap: isDevelopment
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                sourceMap: buildSourcemaps
              },
            },
          },
          // {
          //   loader: 'sass-loader',
          //   options: {
          //     sourceMap: isDevelopment
          //   }
          // }
        ]
      },

      // =>> css / scss
      {
        test: /\.(sass|scss|css)$/,
        exclude: /(\.module\.s?(a|c)ss)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          // MiniCssExtractPlugin.loader, // per uso con scrittura del css anche in dev (commentando riga precedente)
          {
            loader: 'css-loader',
            options: {
              sourceMap: buildSourcemaps,
              importLoaders: isDevelopment? 1 : 2,
              modules: false
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                sourceMap: buildSourcemaps
              },
            },
          },
          // {
          //   loader: 'sass-loader',
          //   options: {
          //     sourceMap: buildSourcemaps
          //   }
          // },
        ],
      },
    ], // end rules
  }, // end module

  // =>> plugins
  plugins: [

    new Dotenv({
      path: isDevelopment? './.env.development' : './.env',
      expand: true,
      ignoreStub: true
    }),

    // Removes/cleans build folders and unused assets when rebuilding
    // non necessario con opzione `clean` di output
    // new CleanWebpackPlugin(),

    // Extracts CSS into separate files
    new MiniCssExtractPlugin({
      // filename: isDevelopment? '[name].css' : '[name].[contenthash].css',
      // chunkFilename: isDevelopment? '[id].css' : '[id].[contenthash].css'
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }),

    // =>> CopyWebpackPlugin
    new CopyWebpackPlugin({
      patterns: [
        {
          // from: 'src/assets/**/*.{ico,png,svg,webmanifest}',
          from: 'src/assets/**/*.*',
          to: '[name][ext]',
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/.DS_Store', '**/_*.*'],
          },
        },
        {
          from: 'src/assets/**/_{htaccess,htpasswd}',
          to: ({ context, absoluteFilename }) => {
            return path.join(output_dir,  path.basename(absoluteFilename).replace(/^_/, '.'));
          },
          toType: 'file',
        },
        {
          from: 'src/php',
          to: 'php',
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/.DS_Store'],
          },
        },
      ],
    }),

    // =>> HotModuleReplacementPlugin
    // Only update what has changed on hot reload
    // new webpack.HotModuleReplacementPlugin(), (non necessario con devServer.hot === true)

    // =>> WebpackManifestPlugin
    new WebpackManifestPlugin(/* {seed: manifest_shared_seed} */),

    // =>> HtmlWebpackPlugin
    // https://github.com/jantimon/html-webpack-plugin#readme
    new HtmlWebpackPlugin({
      // template: path.resolve(__dirname, './src/assets/template.html'),
      templateContent: `<!DOCTYPE html>
        <html lang="it">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
            <link rel="icon" href="./favicon.ico" sizes="32x32">
            <link rel="icon" href="./favicon.svg" type="image/svg+xml">
            <link rel="apple-touch-icon" href="./apple-touch-icon.png">
            <link rel="manifest" href="./manifest.webmanifest">
            <meta name="robots" content="noindex, nofollow">
            <title>Note</title>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>`,
      filename: 'index.html',
      inject: 'body',
    }),

    new HtmlWebpackInjectPreload({
      files: [
        {
          match: /.*-latin-(?!(ext-)).*\.woff2$/,
          attributes: {as: 'font', type: 'font/woff2', crossorigin: true },
        },
        {
          match: /.*\.css$/,
          attributes: {as: 'style' },
        },
        // {
        //   match: /.*\.js$/,
        //   attributes: {as: 'script' },
        // },
      ]
    }),

    // (isDevelopment && new HtmlWebpackPlugin({
    //   filename: '.gitkeep',
    //   inject: false,
    //   templateContent: () => { return ''}
    // })),

    // =>> BannerPlugin
    new BannerPlugin({
      banner: () => {
        const date = new Date().toLocaleString('en-UK', { year: 'numeric', month: 'long' });

        // version = /(-alpha|-beta|-rc)/.test(PACKAGE.version)? PACKAGE.version :
        //   PACKAGE.version.replace(/(\d+\.\d+)\.\d+/, '$1.x');

        return '/*!\n' +
          ` * ${PACKAGE.name} v.${PACKAGE.version} - Massimo Cassandro ${date}\n` +
          ' */\n';
      },
      raw: true
    })
  ], // end plugins

  // =>> resolve
  resolve: {
    // fallback: {
    //   'fs': false,
    //   'util': false
    // },
    modules: ['./', 'node_modules'],
    extensions: ['.tsx', '.ts', '.js', '.mjs', '.cjs', '.jsx', '.json', '.scss', '.css'],
    alias: aliases
  }

};


module.exports = config;
