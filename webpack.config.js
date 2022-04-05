var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = {
  entry: {
    dist: './js/h5p-notation-widget.js',
  },
  output: {
    filename: 'h5p-notation-widget.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {      
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: path.join(__dirname, 'src/fonts'),
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  }
  ,
  plugins: [
    new MiniCssExtractPlugin({
    filename: "h5p-notation-widget.css"
      })
    ]
};

if(isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
