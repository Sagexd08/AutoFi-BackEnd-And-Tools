const path = require('path');

module.exports = {
  entry: {
    index: './src/index.ts',
    modules: './src/modules/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    library: {
      name: 'CeloAISDK',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { node: '18' } }],
                '@babel/preset-typescript',
              ],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    'viem': 'viem',
  },
  optimization: {
    minimize: true,
    sideEffects: false,
  },
  mode: 'production',
  devtool: 'source-map',
};

