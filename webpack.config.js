const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const root = path.resolve(__dirname, 'src', 'pages');
const projects = fs.readdirSync(root);
const entries = {};
const htmlWebpackPlugin = [];

for (const project of projects) {
  entries[project] = path.join(root, project, `${project}.js`);

  htmlWebpackPlugin.push(
    new HtmlWebpackPlugin({
      template: `./pages/${project}/${project}.pug`,
      filename: `${project === "main" ? "index" : project}.html`,
      chunks: [project],
    })
  );
}

module.exports = (env, argv) => {
  const isProductionBuild = process.env.NODE_ENV === 'production';
  const publicPath = isProductionBuild ? '/lion-bank/' : '';
  
  const config = {
    mode: process.env.NODE_ENV || 'development',
    context: path.resolve(__dirname, 'src'),
    entry: entries,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[hash:8].js',
      publicPath: publicPath
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
          options: {
            minimize: false,
          }
        },
        {
          test: /\.pug$/,
          loader: 'pug-loader',
        },
        {
          test: /\.(c|sa|sc)ss$/i,
          use: [
            isProductionBuild ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer']
                }
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.js$/i,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: 'images',
            publicPath: path.posix.join(publicPath, 'images')
          },
        },
        {
          test: /\.(woff|woff2)$/i,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts',
            publicPath: path.posix.join(publicPath, 'fonts')
          }
        }
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, "./src"),
        components: path.resolve(__dirname, "./src/components"),
        images: path.resolve(__dirname, "./src/images"),
        styles: path.resolve(__dirname, "./src/styles"),
      },
      extensions: ['*', '.js', '.vue', '.json'],
    },
    plugins: [
      ...htmlWebpackPlugin,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/favicon.ico'),
            to: path.resolve(__dirname, 'dist')
          }
        ]
      })
    ],
    devtool: '#eval-source-map',
    devServer: {
      historyApiFallback: true,
      noInfo: false,
      overlay: true,
    },
  };
  
  if (isProductionBuild) {
    config.devtool = 'none';
    config.plugins = (config.plugins || []).concat([
      new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
        chunkFilename: 'styles/vendors.[chunkhash].css',
      }),
    ]);

    config.optimization = config.optimization || {};

    config.optimization.minimizer = [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
    ];
  }

  return config;
}