const path = require('path')
const { ProvidePlugin, DefinePlugin } = require('webpack')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    app: path.join(__dirname, '../src', 'index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    alias: {
      process: 'process/browser',
      '@app': path.resolve(__dirname, '../src'),
      '@app/components': path.resolve(__dirname, '../src/components'),
      '@app/lib': path.resolve(__dirname, '../src/lib'),
      '@app/styles': path.resolve(__dirname, '../src/styles'),
    },
    fallback: {
      'process/browser': require.resolve('process/browser'),
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: 'runtime',
    },
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
  },
  cache: {
    type: 'filesystem',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        exclude: /node_modules/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        exclude: /node_modules/,
        type: 'asset',
      },
      {
        test: /\.svg$/i,
        exclude: /node_modules/,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] },
        use: '@svgr/webpack',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('tailwindcss'), require('autoprefixer')],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ProvidePlugin({
      process: 'process/browser',
    }),
    new DefinePlugin({
      BUILD_VERSION: JSON.stringify(require('../package.json').version),
      BUILD_DATE: JSON.stringify(new Date().toLocaleString()),
    }),
  ],
}
