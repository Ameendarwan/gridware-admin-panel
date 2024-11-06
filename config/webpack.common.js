const path = require('path')
const { ProvidePlugin, DefinePlugin } = require('webpack')

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
    },
    // Redirect module requests when normal resolving fails
    fallback: {
      'process/browser': require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      // Vanilla JS
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      // Typescript
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      // Images
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      // Fonts
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      // SVG as resource
      {
        test: /\.svg$/i,
        exclude: /node_modules/,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      // SVG as React Component
      {
        test: /\.svg$/i,
        exclude: /node_modules/,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: '@svgr/webpack',
      },
      // CSS loader
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
    new ProvidePlugin({
      process: 'process/browser',
    }),
    new DefinePlugin({
      BUILD_VERSION: JSON.stringify(require('../package.json').version),
      BUILD_DATE: JSON.stringify(new Date().toLocaleString()),
    }),
  ],
}
