'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * URL de la API que consume el cliente.
 *
 * Se resuelve en tiempo de build mediante DefinePlugin. Tiene un valor por
 * defecto funcional para que el proyecto corra sin definir variables de
 * entorno, tal como pide el enunciado.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: path.resolve(__dirname, 'src/index.js'),

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/'
    },

    module: {
      rules: [
        {
          // Babel es necesario para transformar JSX. El enunciado lo excluye
          // explícitamente en la API, pero no en el frontend.
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },

    resolve: {
      extensions: ['.js', '.jsx']
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        favicon: false
      }),
      new webpack.DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(API_BASE_URL)
      })
    ],

    devServer: {
      port: 8080,
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.resolve(__dirname, 'public')
      }
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map'
  }
}